"use client";

import { useEffect, useState } from 'react';

export interface HistoryEntry {
  id: string;
  question: string;
  response: string;
  evaluation: any;
  drawingData?: string | null;
  date: string;
}

const STORAGE_KEY = 'sdi_history_v1';

export function HistoryPanel() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clear = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear history');
      setItems([]);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return (
    <div className="p-4 text-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">History</h2>
        <button
          onClick={clear}
          className="text-sm text-slate-400 hover:text-white"
        >
          Clear
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-slate-400">No history yet. Analyze an answer to populate history.</div>
      ) : (
        <div className="space-y-3 overflow-auto max-h-[calc(100vh-260px)] pr-2">
          {items.slice(0, visibleCount).map((it) => {
            // Supabase returns `drawing_data`; accept either shape
            const drawing = (it as any).drawing_data ?? it.drawingData;
            const dateVal = (it as any).date ?? it.date;
            const idVal = (it as any).id ?? it.id;
            const evaluationVal = (it as any).evaluation ?? it.evaluation;
            const questionVal = (it as any).question ?? it.question;
            const responseVal = (it as any).response ?? it.response;

            return (
              <div key={idVal} className="bg-slate-900/40 border border-slate-700 p-3 rounded">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-200 font-medium">{questionVal}</div>
                  <div className="text-sm text-slate-400">{new Date(dateVal).toLocaleString()}</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-yellow-300">Score: {evaluationVal?.score ?? '—'}</div>
                  <div>
                    <button
                      onClick={() => setSelected({ ...it, drawing: drawing, date: dateVal, id: idVal })}
                      className="px-2 py-1 bg-slate-700 text-sm rounded hover:bg-slate-600"
                    >
                      Read more
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {items.length > visibleCount && (
        <div className="p-4">
          <button
            onClick={() => setVisibleCount((v) => v + 6)}
            className="px-3 py-2 bg-slate-700 rounded text-sm hover:bg-slate-600"
          >
            Load more
          </button>
        </div>
      )}
      
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 rounded shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                <div className="text-sm text-slate-400">{new Date(selected.date).toLocaleString()}</div>
                <div className="text-lg font-semibold">History Detail</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ml-4 px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm text-slate-400">Question</div>
                <div className="mt-1 text-slate-200 whitespace-pre-wrap">{(selected as any).question ?? (selected as any).question}</div>
              </div>

              <div>
                <div className="text-sm text-slate-400">Response</div>
                <div className="mt-1 text-slate-200 whitespace-pre-wrap">{(selected as any).response ?? (selected as any).response}</div>
              </div>

              <div>
                <div className="text-sm text-slate-400">Evaluation</div>
                <div className="mt-2 text-slate-200">
                  {((selected as any).evaluation && (selected as any).evaluation.score) ? (
                    <div className="space-y-2">
                      <div><strong>Score:</strong> {(selected as any).evaluation.score}</div>
                      {Array.isArray((selected as any).evaluation.strengths) && (
                        <div><strong>Strengths:</strong><ul className="list-disc ml-5">{(selected as any).evaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>
                      )}
                      {Array.isArray((selected as any).evaluation.improvements) && (
                        <div><strong>Improvements:</strong><ul className="list-disc ml-5">{(selected as any).evaluation.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>
                      )}
                      {Array.isArray((selected as any).evaluation.missingComponents) && (
                        <div><strong>Missing Components:</strong><ul className="list-disc ml-5">{(selected as any).evaluation.missingComponents.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>
                      )}
                    </div>
                  ) : (
                    <pre className="text-sm text-slate-300">{JSON.stringify((selected as any).evaluation || {}, null, 2)}</pre>
                  )}
                </div>
              </div>

              {(selected as any).drawing ? (
                <div>
                  <div className="text-sm text-slate-400">Diagram</div>
                  <div className="mt-2">
                    <img src={(selected as any).drawing} alt="full-diagram" className="w-full rounded border border-slate-700" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export async function saveHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'date'> & { drawingData?: string | null }) {
  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to save history');
    const created = await res.json();
    return created;
  } catch (e) {
    console.error('Failed to save history', e);
    throw e;
  }
}

export default HistoryPanel;
