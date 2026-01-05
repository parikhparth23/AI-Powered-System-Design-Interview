'use client';

import { useState, useEffect } from 'react';
import { QuestionPanel } from './components/QuestionPanel';
import { ResponseInput } from './components/ResponseInput';
import { EvaluationPanel } from './components/EvaluationPanel';

export interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  missingComponents: string[];
  deepDiveQuestions: string[];
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [drawingData, setDrawingData] = useState<string>('');
  const [drawingSceneData, setDrawingSceneData] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      const response = await fetch('/api/question');
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setQuestion(data.question);
      setResponse('');
      setEvaluation(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch question');
    }
  };

  const handleCustomQuestion = (customQuestion: string) => {
    setQuestion(customQuestion);
    setResponse('');
    setEvaluation(null);
    setError('');
  };

  const handleDrawingChange = (sceneData: any) => {
    // Store scene data for restoration
    setDrawingSceneData(sceneData);
    
    // Generate PNG from scene data and store for submission
    if (sceneData?.elements && sceneData.elements.length > 0) {
      // Store a placeholder indicating drawing exists
      // The actual PNG will be captured when Done Drawing is clicked
      setDrawingData('drawing-exists');
    } else {
      setDrawingData('');
    }
  };

  const handleAnalyze = async () => {
    if (!response.trim() && !drawingData) {
      setError('Please write a response or create a drawing first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // If drawing exists, generate PNG from scene data for API submission
      let pngDataUrl = '';
      if (drawingData && drawingSceneData?.elements?.length > 0) {
        try {
          // Use Excalidraw's export function to generate PNG from scene data
          const { exportToBlob } = await import('@excalidraw/excalidraw');
          const blob = await exportToBlob({
            elements: drawingSceneData.elements,
            appState: drawingSceneData.appState || {},
            files: drawingSceneData.files || {},
            type: 'png',
          });
          
          // Convert blob to data URL synchronously using canvas
          await new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              pngDataUrl = reader.result as string;
              console.log('Drawing exported:', {
                hasDrawing: !!pngDataUrl,
                pngLength: pngDataUrl.length,
                elements: drawingSceneData.elements.length,
              });
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (exportError) {
          console.error('Failed to export drawing:', exportError);
        }
      }

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          response, 
          drawingData: pngDataUrl || null
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.statusText}`);

      const data = await res.json();
      setEvaluation(data.evaluation);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to evaluate response';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">System Design Interview</h1>
          <p className="text-slate-400 mt-2">
            Practice system design with AI-powered feedback and scoring
          </p>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Question Column - Compact */}
          <div className="col-span-3 flex flex-col rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden shadow-xl">
            <QuestionPanel 
              question={question} 
              onNewQuestion={fetchQuestion}
              onCustomQuestion={handleCustomQuestion}
            />
          </div>

          {/* Middle Column - Response & Drawing - Large */}
          <div className="col-span-5 flex flex-col rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden shadow-xl">
            <ResponseInput 
              value={response}
              onChange={setResponse}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={error}
              onDrawingChange={handleDrawingChange}
              drawingData={drawingSceneData}
            />
          </div>

          {/* Right Column - Evaluation - Large */}
          <div className="col-span-4 flex flex-col rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden shadow-xl">
            <EvaluationPanel 
              evaluation={evaluation}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
