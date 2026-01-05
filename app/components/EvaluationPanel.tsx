'use client';

import { Evaluation } from '@/app/page';

interface EvaluationPanelProps {
  evaluation: Evaluation | null;
  isLoading: boolean;
}

export function EvaluationPanel({ evaluation, isLoading }: EvaluationPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-xl font-semibold text-white">Evaluation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
            <p className="text-slate-400">Evaluating your response...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-xl font-semibold text-white">Evaluation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Submit your response to get feedback</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-900/30 border-green-700';
    if (score >= 6) return 'bg-yellow-900/30 border-yellow-700';
    if (score >= 4) return 'bg-orange-900/30 border-orange-700';
    return 'bg-red-900/30 border-red-700';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
        <h2 className="text-xl font-semibold text-white">Evaluation & Score</h2>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6 text-sm">
        {/* Score Card */}
        <div className={`rounded-lg border-2 p-4 ${getScoreBgColor(evaluation.score)}`}>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Overall Score</p>
          <div className={`text-5xl font-bold ${getScoreColor(evaluation.score)}`}>
            {evaluation.score}/10
          </div>
        </div>

        {/* Strengths */}
        {evaluation.strengths.length > 0 && (
          <section>
            <h3 className="text-green-400 font-bold mb-2">✅ Strengths</h3>
            <ul className="space-y-1 text-slate-300">
              {evaluation.strengths.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-500 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Areas to Improve */}
        {evaluation.improvements.length > 0 && (
          <section>
            <h3 className="text-yellow-400 font-bold mb-2">⚠️ Areas to Improve</h3>
            <ul className="space-y-1 text-slate-300">
              {evaluation.improvements.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-yellow-500 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Missing Components */}
        {evaluation.missingComponents.length > 0 && (
          <section>
            <h3 className="text-red-400 font-bold mb-2">❌ Missing Components</h3>
            <ul className="space-y-1 text-slate-300">
              {evaluation.missingComponents.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-500 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Follow-up Questions */}
        {evaluation.deepDiveQuestions.length > 0 && (
          <section className="bg-slate-700/30 rounded p-4 border border-slate-600">
            <h3 className="text-blue-400 font-bold mb-2">❓ Follow-up Questions</h3>
            <ol className="space-y-2 text-slate-300">
              {evaluation.deepDiveQuestions.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-500 flex-shrink-0 font-semibold">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
