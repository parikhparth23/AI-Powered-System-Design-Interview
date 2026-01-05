'use client';

import { useState } from 'react';

interface QuestionPanelProps {
  question: string;
  onNewQuestion: () => void;
  onCustomQuestion: (customQuestion: string) => void;
}

export function QuestionPanel({ question, onNewQuestion, onCustomQuestion }: QuestionPanelProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  const handleSubmitCustom = async () => {
    if (!customQuestion.trim()) return;
    
    setIsSubmittingCustom(true);
    try {
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customQuestion }),
      });
      
      if (response.ok) {
        const data = await response.json();
        onCustomQuestion(data.question);
        setCustomQuestion('');
        setShowCustom(false);
      }
    } catch (error) {
      console.error('Error submitting custom question:', error);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
        <h2 className="text-xl font-semibold text-white">Design Question</h2>
        <p className="text-slate-400 text-sm mt-1">Read carefully</p>
      </div>

      <div className="flex-1 overflow-auto p-6 flex flex-col">
        {!showCustom ? (
          <>
            <div className="flex-1">
              {question ? (
                <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
                  {question}
                </p>
              ) : (
                <p className="text-slate-400">Loading question...</p>
              )}
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={onNewQuestion}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Get Random Question
              </button>
              <button
                onClick={() => setShowCustom(true)}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Ask Your Own Question
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              <p className="text-slate-400 text-sm mb-3">Enter your own system design question:</p>
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g., Design a real-time chat application..."
                className="flex-1 p-4 bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm rounded-lg mb-4"
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={handleSubmitCustom}
                disabled={isSubmittingCustom || !customQuestion.trim()}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {isSubmittingCustom ? 'Loading...' : 'Use This Question'}
              </button>
              <button
                onClick={() => {
                  setShowCustom(false);
                  setCustomQuestion('');
                }}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
