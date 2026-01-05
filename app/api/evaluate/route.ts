import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const EVALUATION_PROMPT = `You are a Principal Systems Architect interviewer conducting a system design interview.

CRITICAL SCORING RULES:
1. **Question Relevance (MOST IMPORTANT)**: If the candidate is solving a completely different problem than asked:
   - Answering a different service entirely = 1-2 out of 10 (SEVERE penalty)
   - Off-topic or irrelevant design = 2-3 out of 10

2. **Score Distribution**:
   - 1-2: Completely wrong or off-topic
   - 3-4: Major architectural flaws, missing critical components
   - 5-6: Partially correct, significant gaps, some good ideas
   - 7-8: Good fundamentals, minor gaps, mostly complete
   - 9-10: Excellent design, well-thought-out, addresses all requirements

3. **Evaluation Criteria** (in order of importance):
   a) Does it solve the ACTUAL question asked? (Consider BOTH text AND diagram)
   b) Does it address all functional requirements?
   c) Does it address all non-functional requirements?
   d) Are there critical missing components?
   e) Is the architecture sound and scalable?
   f) Are failure scenarios handled?
   g) Are trade-offs discussed?

4. **IMPORTANT - Diagram Analysis**:
   - If a diagram is provided, analyze it thoroughly
   - Comment on the architecture shown in the diagram
   - Check if the diagram matches the text response
   - Evaluate diagram completeness and correctness
   - Include diagram observations in strengths, improvements, and missing components
   - If diagram is good but text is weak (or vice versa), acknowledge both

5. **Be STRICT**: 
   - Don't give high scores for partial solutions
   - Don't give passing scores for completely wrong answers
   - Vary scores significantly based on quality (not always 6-7)

Return ONLY valid JSON with these EXACT keys:
{
  "score": <integer 1-10, strictly based on above rules>,
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "missingComponents": ["...", "...", "..."],
  "deepDiveQuestions": ["...", "..."]
}

ALL VALUES MUST BE PLAIN STRINGS - NO OBJECTS OR NESTED STRUCTURES.`;


function flattenValue(val: any): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.map(v => flattenValue(v)).join(', ');
  if (typeof val === 'object' && val !== null) {
    return Object.values(val)
      .map(v => flattenValue(v))
      .filter(v => v.length > 0)
      .join('. ');
  }
  return '';
}

export async function POST(request: Request) {
  try {
    const { question, response, drawingData } = await request.json();

    if (!question?.trim() || (!response?.trim() && !drawingData)) {
      return Response.json(
        { error: 'Question and response/drawing are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Build the evaluation message
    const textContent = `${EVALUATION_PROMPT}\n\n===INTERVIEW QUESTION===\n${question}\n\n===CANDIDATE RESPONSE===\n${response || '[No text response - see diagram below]'}\n\n${drawingData ? '===SYSTEM DIAGRAM PROVIDED===\nThe candidate has also provided a system architecture diagram below. Please analyze the diagram carefully and comment on its design, completeness, and alignment with the question.' : ''}\n\n===EVALUATION===\nEvaluate this response${drawingData ? ' (including the diagram)' : ''}. FIRST check: Is this even answering the right question? If not, score should be 1-2. Then evaluate based on the rubric above. Score should VARY significantly - not always 7.`;

    // If there's a drawing, include it as an image
    let contents: any = [
      {
        role: 'user',
        parts: [{ text: textContent }],
      },
    ];

    if (drawingData) {
      // Extract base64 from data URL
      let base64Data = '';
      console.log('Raw drawingData:', {
        drawingDataType: typeof drawingData,
        drawingDataLength: drawingData?.length || 0,
        drawingDataStart: drawingData?.substring(0, 50) || 'null',
      });

      if (drawingData.includes(',')) {
        base64Data = drawingData.split(',')[1];
      } else {
        base64Data = drawingData;
      }

      console.log('Extracted base64:', {
        hasBase64: !!base64Data,
        base64Length: base64Data?.length || 0,
      });

      if (base64Data) {
        contents[0].parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Data,
          },
        });
      }
    }

    const result = await model.generateContent({
      contents,
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: 'Failed to parse evaluation response' },
        { status: 500 }
      );
    }

    let evaluation = JSON.parse(jsonMatch[0]);

    // Validate score is actually a number between 1-10
    const score = parseInt(evaluation.score);
    if (isNaN(score) || score < 1 || score > 10) {
      console.error('Invalid score returned:', evaluation.score);
      throw new Error('Invalid evaluation score received');
    }

    // Normalize to ensure all arrays contain only strings
    const normalizedEvaluation = {
      score: score,
      strengths: (Array.isArray(evaluation.strengths) ? evaluation.strengths : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0)
        .slice(0, 5),
      improvements: (Array.isArray(evaluation.improvements) ? evaluation.improvements : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0)
        .slice(0, 5),
      missingComponents: (Array.isArray(evaluation.missingComponents) ? evaluation.missingComponents : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0)
        .slice(0, 5),
      deepDiveQuestions: (Array.isArray(evaluation.deepDiveQuestions) ? evaluation.deepDiveQuestions : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0)
        .slice(0, 3),
    };

    console.log('Evaluation result:', normalizedEvaluation);

    return Response.json({ evaluation: normalizedEvaluation });
  } catch (error) {
    console.error('Error:', error);
    
    // Check if it's a quota error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return Response.json(
        {
          error: 'API quota exceeded. Please try again in a few moments or upgrade your plan.',
        },
        { status: 429 }
      );
    }
    
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
