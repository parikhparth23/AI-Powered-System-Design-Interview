import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const ARCHITECT_SYSTEM_PROMPT = `You are a Distinguished Systems Architect with 20+ years of experience. Your role is to critically analyze system designs WITHOUT providing generic praise.

When analyzing a system design:
1. Blind Spots: Identify what the designer is forgetting (monitoring, rate limiting, edge cases, compliance, disaster recovery, etc.)
2. Trade-offs: For every component or decision, explain the CAP Theorem implications and what's being sacrificed
3. Bottlenecks: Specifically identify where the design fails when traffic increases 100-1000x
4. Infrastructure Recommendations: Suggest specific AWS/Azure/GCP services or open-source tools with reasoning
5. Failure Modes: List potential single points of failure (SPOFs) and how they cascade
6. Deep Dive Questions: Ask 2 probing questions that push the design further

Use the "Rule of Three": For every component proposed, provide three potential risks.

CRITICAL: Return ONLY valid JSON where EVERY VALUE IS A STRING, not objects. All arrays must contain plain text strings only.
Example format:
{
  "blindSpots": ["Missing monitoring for...", "No rate limiting on..."],
  "tradeOffs": ["Using PostgreSQL sacrifices...", "Redis caching increases..."],
  ...
}`;

const DIAGRAM_PROMPT = `Based on this system design description, create a Mermaid diagram showing the architecture. Include components, data flows, and external services. Use graph TB format.

Return ONLY valid Mermaid syntax starting with "graph TB" or "graph LR", no markdown backticks or extra text.`;

async function generateDiagram(design: string, model: any): Promise<string> {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${DIAGRAM_PROMPT}\n\nSystem Design:\n${design}`,
            },
          ],
        },
      ],
    });

    const diagramCode = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Clean up the response - remove markdown code blocks if present
    return diagramCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  } catch (error) {
    console.error('Diagram generation error:', error);
    return ''; // Return empty string if diagram generation fails
  }
}

export async function POST(request: Request) {
  try {
    const { design } = await request.json();

    if (!design || !design.trim()) {
      return Response.json(
        { error: 'Design description is required' },
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

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${ARCHITECT_SYSTEM_PROMPT}\n\nAnalyze this system design:\n\n${design}`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: 'Failed to parse API response as JSON' },
        { status: 500 }
      );
    }

    let feedback = JSON.parse(jsonMatch[0]);

    // Deep flatten function to convert nested objects to strings
    const flattenValue = (val: any): string => {
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
    };

    // Normalize the feedback structure - ensure all arrays contain only strings
    const normalizedFeedback = {
      blindSpots: (Array.isArray(feedback.blindSpots) ? feedback.blindSpots : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0),
      tradeOffs: (Array.isArray(feedback.tradeOffs) ? feedback.tradeOffs : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0),
      bottlenecks: (Array.isArray(feedback.bottlenecks) ? feedback.bottlenecks : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0),
      infrastructureRecommendations: (Array.isArray(feedback.infrastructureRecommendations) ? feedback.infrastructureRecommendations : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0),
      failureModes: (Array.isArray(feedback.failureModes) ? feedback.failureModes : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0),
      deepDiveQuestions: (Array.isArray(feedback.deepDiveQuestions) ? feedback.deepDiveQuestions : [])
        .map((item: any) => flattenValue(item))
        .filter((item: string) => item.length > 0),
    };

    // Generate diagram in parallel
    const diagram = await generateDiagram(design, model);

    return Response.json({
      feedback: normalizedFeedback,
      diagram,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
