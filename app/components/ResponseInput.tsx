'use client';

import { useState } from 'react';
import DrawingCanvas from './DrawingCanvas';

interface ResponseInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string;
  onDrawingChange?: (drawingData: any) => void;
  drawingData?: any;
}

export function ResponseInput({
  value,
  onChange,
  onAnalyze,
  isLoading,
  error,
  onDrawingChange,
  drawingData,
}: ResponseInputProps) {
  const [showDrawingModal, setShowDrawingModal] = useState(false);

  const handleDoneDrawing = async () => {
    // Also export PNG for submission to AI
    const canvas = document.querySelector('.excalidraw-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngDataUrl = canvas.toDataURL('image/png');
      // Pass the PNG separately if needed for API submission
      // For now, the scene data is sufficient for restoration
    }
    setShowDrawingModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
        <h2 className="text-xl font-semibold text-white mb-4">Your Design</h2>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-blue-600 text-white"
          >
            ✏️ Write
          </button>
          <button
            onClick={() => setShowDrawingModal(true)}
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            🎨 Draw
          </button>
          {drawingData && (
            <div className="ml-auto text-xs text-green-400 flex items-center gap-1">
              ✓ Drawing added
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your system design:
- High-level architecture
- Key components
- Data flow
- Scalability approach
- Technology choices
- Trade-offs
- Failure handling
..."
          className="flex-1 p-6 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm leading-relaxed"
        />

        {error && (
          <div className="px-6 py-2 bg-red-900/20 border-t border-slate-700">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onAnalyze}
            disabled={isLoading || (!value.trim() && !drawingData)}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Analyzing...
              </span>
            ) : (
              'Analyze Response'
            )}
          </button>
        </div>
      </div>

      {/* Drawing Modal */}
      {showDrawingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full h-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-slate-800">
              <h2 className="text-2xl font-bold text-white">Draw System Diagram</h2>
              <button
                onClick={() => setShowDrawingModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <DrawingCanvas 
              onDrawingChange={onDrawingChange} 
              initialData={drawingData}
            />
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 flex gap-3 justify-end">
              <button
                onClick={handleDoneDrawing}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
              >
                Done Drawing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
