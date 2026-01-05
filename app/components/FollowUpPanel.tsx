'use client';

import { useState, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';

interface FollowUpPanelProps {
  designText: string;
}

export function FollowUpPanel({ designText }: FollowUpPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const debouncedFetchRef = useRef<any>(null);

  useEffect(() => {
    debouncedFetchRef.current = debounce(async (q: string) => {
      if (!q.trim() || !designText.trim()) {
        setAnswer('');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ design: designText, question: q }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        setAnswer(data.answer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch answer');
        setAnswer('');
      } finally {
        setIsLoading(false);
      }
    }, 800);

    return () => debouncedFetchRef.current?.cancel();
  }, [designText]);

  const handleQuestionChange = (text: string) => {
    setQuestion(text);
    debouncedFetchRef.current?.(text);
  };

  if (!designText.trim()) {
    return (
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50">
        <p className="text-slate-400">Enter a design first to ask follow-up questions</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
        <h2 className="text-xl font-semibold text-white">Ask a Question</h2>
        <p className="text-slate-400 text-sm mt-1">Deep dive into specific aspects</p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="e.g., How would you handle database failover? What about eventual consistency?"
          className="p-4 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm border-b border-slate-700 h-20"
        />

        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="text-center">
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm mt-2">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center flex items-center justify-center h-full">
              <div>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                <p className="text-slate-400 text-sm">Thinking...</p>
              </div>
            </div>
          )}

          {answer && !isLoading && (
            <div className="text-slate-300 space-y-3 text-sm leading-relaxed">
              {answer.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {!isLoading && !answer && !error && question && (
            <div className="text-center text-slate-400">
              <p>Ask a question about your design</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
