const QUESTIONS = [
  "Designing a URL Shortening Service like TinyURL",
  "Designing Pastebin",
  "Designing Instagram",
  "Designing Dropbox",
  "Designing Facebook Messenger",
  "Designing Twitter",
  "Designing Youtube or Netflix",
  "Designing Typeahead Suggestion",
  "Designing an API Rate Limiter",
  "Designing Twitter Search",
  "Designing a Web Crawler",
  "Designing Facebook's Newsfeed",
  "Designing Yelp or Nearby Friends",
  "Designing Uber backend",
  "Designing Ticketmaster",
];

export async function GET() {
  const randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  return Response.json({ question: randomQuestion });
}

export async function POST(request: Request) {
  try {
    const { customQuestion } = await request.json();
    
    if (!customQuestion?.trim()) {
      return Response.json(
        { error: 'Custom question is required' },
        { status: 400 }
      );
    }
    
    return Response.json({ question: customQuestion.trim() });
  } catch (error) {
    return Response.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
