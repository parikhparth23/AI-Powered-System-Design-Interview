import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const FOLLOWUP_SYSTEM_PROMPT = `You are a Distinguished Systems Architect. Answer specific follow-up questions about a system design deeply and practically. Be concise but thorough.`;

export async function POST(request: Request) {
  try {
    const { design, question } = await request.json();

    if (!design?.trim() || !question?.trim()) {
      return Response.json(
        { error: 'Design and question are required' },
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
              text: `${FOLLOWUP_SYSTEM_PROMPT}\n\nSystem Design:\n${design}\n\nQuestion: ${question}`,
            },
          ],
        },
      ],
    });

    const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!answer) {
      return Response.json(
        { error: 'Failed to generate answer' },
        { status: 500 }
      );
    }

    return Response.json({ answer });
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
