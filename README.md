# System Design Interview Practice Tool

An interactive system design interview platform where users practice with curated questions and get AI-powered scoring and feedback.

## Features

✓ **15 NeetCode System Design Questions** (pre-loaded)
✓ **Custom Questions** - Ask your own system design questions
✓ **AI Evaluation** - Gemini scores your response 1-10 with detailed feedback
✓ **Excalidraw Integration** - Draw architecture diagrams like diagrams.net
✓ **Write/Draw Toggle** - Switch between writing text and drawing diagrams
✓ **Structured Feedback**:
  - Strengths (what you did well)
  - Areas to Improve (gaps in thinking)
  - Missing Components (critical pieces forgotten)
  - Follow-up Questions (deep-dive prompts)
✓ **Real-time Scoring** - Scores vary based on design quality
✓ **Question Relevance Checking** - AI penalizes off-topic answers

## Demo Video

https://github.com/user-attachments/assets/ef01499a-d58a-4938-bd48-9a8e438c2993


## Questions Included

1. Designing a URL Shortening Service like TinyURL
2. Designing Pastebin
3. Designing Instagram
4. Designing Dropbox
5. Designing Facebook Messenger
6. Designing Twitter
7. Designing Youtube or Netflix
8. Designing Typeahead Suggestion
9. Designing an API Rate Limiter
10. Designing Twitter Search
11. Designing a Web Crawler
12. Designing Facebook's Newsfeed
13. Designing Yelp or Nearby Friends
14. Designing Uber backend
15. Designing Ticketmaster

## Quick Start

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key (free tier available)

### 2. Setup Environment

```bash
cd ~/Desktop/sdi

# Copy example env file
cp .env.local.example .env.local

# Edit .env.local and add your Gemini API key
# GEMINI_API_KEY=paste_your_key_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Architecture

### Frontend (Next.js App Router)
- **Main Page** (`app/page.tsx`): Optimized 3-column grid layout (3-5-4 ratio)
- **QuestionPanel** (`app/components/QuestionPanel.tsx`): Question display + custom question input
- **ResponseInput** (`app/components/ResponseInput.tsx`): Text editor OR Excalidraw drawing canvas with toggle
- **EvaluationPanel** (`app/components/EvaluationPanel.tsx`): Score, strengths, improvements, missing components

### Backend (Next.js API Routes)
- **Question Endpoint** (`app/api/question/route.ts`): 
  - GET: Returns random question from curated list
  - POST: Accepts custom questions
- **Evaluate Endpoint** (`app/api/evaluate/route.ts`):
  - Receives question + response
  - Sends to Gemini API with strict evaluation rubric
  - Returns score (1-10) and detailed feedback

### Evaluation Criteria
- **Question Relevance**: Most important - off-topic answers get 1-2 score
- **Requirement Coverage**: Functional and non-functional requirements
- **Architecture Quality**: Scalability, reliability, component design
- **Missing Components**: Critical pieces needed
- **Failure Scenarios**: Error handling and edge cases

## How It Works

1. **Get a Question** - Click "Get Random Question" or "Ask Your Own Question"
2. **Write Your Design** - Describe your system design in the response panel
3. **Click Analyze** - Submit for AI evaluation
4. **Get Feedback** - Receive a score (1-10) with detailed analysis

The AI evaluates:
- Is your answer relevant to the question?
- Does it address all functional requirements?
- Does it address all non-functional requirements?
- Are critical components missing?
- Is the architecture sound and scalable?
- Are failure scenarios handled?

## Layout Design

New optimized 3-column layout using full horizontal space:

**Left Column (3/12)**: Question Display  
- Compact question display
- Get random questions from curated list
- Ask your own custom question

**Middle Column (5/12)**: Your Design (Larger)
- Text editor for writing your approach
- OR Excalidraw canvas for drawing diagrams  
- Toggle between Write/Draw modes
- Click "Analyze Response" when ready

**Right Column (4/12)**: AI Evaluation (Larger)  
- Score out of 10 (color-coded)
- Strengths in your design
- Areas to improve
- Missing critical components
- Follow-up questions to deepen thinking

This layout leverages unused question space, giving more room for detailed responses and visual diagrams.

## Tech Stack

- **Framework**: Next.js 16+ (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 (dark theme)
- **LLM**: Google Gemini 2.5 Flash (Free tier)
- **State**: React hooks
- **Package Manager**: npm

## Project Structure

```
sdi/
├── app/
│   ├── components/
│   │   ├── QuestionPanel.tsx
│   │   ├── ResponseInput.tsx
│   │   └── EvaluationPanel.tsx
│   ├── api/
│   │   ├── question/
│   │   │   └── route.ts
│   │   └── evaluate/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── node_modules/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.local (create this)
└── SETUP.md (this file)
```

## Environment Variables

```
GEMINI_API_KEY=your_google_ai_api_key
```

## Optional: Supabase persistent history (recommended for production)

If you want history shared across browsers and durable storage (Netlify, Vercel, etc.), use Supabase.

1. Create a Supabase project at https://app.supabase.com/
2. In the SQL editor, run the following to create the `history` table:

```sql
-- Create history table for storing evaluations and optional drawing PNG data (as text)
CREATE TABLE public.history (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  date timestamptz NOT NULL DEFAULT now(),
  question text,
  response text,
  evaluation jsonb,
  drawing_data text
);

-- Optional: limit size with a policy or use retention queries as needed
```

3. Add the following environment variables to your deployment (or `.env.local` for local dev):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Notes:
- Use the `SERVICE_ROLE` key on the server only (keep it secret). In Netlify, set these in Site Settings → Environment.
- The server API at `/api/history` will use these variables to read/insert/delete history entries.
- If you prefer per-user history, add an `user_id` column and implement authentication.

4. Install the Supabase client dependency:

```bash
npm install @supabase/supabase-js
```

Now the app will persist history rows to Supabase (shared across browsers). For serverless hosts, this is the recommended approach.

## Troubleshooting

**"GEMINI_API_KEY not configured"**
- Check `.env.local` exists
- Verify API key is correct
- Restart dev server

**"API error: Internal Server Error"**
- Check the terminal for error logs
- Verify Gemini API key is valid
- Check internet connection

**Always getting the same score**
- This was fixed - scores should now vary based on design quality
- If still seeing same score, clear browser cache and try again

**Question not loading**
- Refresh the page
- Check browser console for errors

## Next Steps

- Add persistent storage of interview history (localStorage or database)
- Export evaluation results as PDF
- Add difficulty levels to questions
- Implement timed interviews
- Add leaderboard/scoring history
- Support multiple interview topics
- Add video explanation links for concepts

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build
npm start

# Lint
npm run lint
```

---

Built with Next.js, Tailwind CSS, and Gemini API
