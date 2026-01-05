'use client';

import React, { useCallback, useEffect, useRef, lazy, Suspense, useState } from 'react';
import '@excalidraw/excalidraw/index.css';

const ExcalidrawComponent = lazy(() => 
  import('@excalidraw/excalidraw').then(mod => ({ default: mod.Excalidraw }))
);

interface DrawingCanvasProps {
  onDrawingChange?: (sceneData: any) => void;
  initialData?: any;
}

const DrawingCanvas = ({ onDrawingChange, initialData }: DrawingCanvasProps) => {
  const [isClient, setIsClient] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExcalidrawChange = useCallback(
    (elements: any, appState: any, files: any) => {
      // Debounce the save to prevent infinite loops
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (!onDrawingChange) return;

        try {
          const sceneData = {
            elements,
            appState,
            files,
          };
          onDrawingChange(sceneData);
        } catch (error) {
          console.error('Error saving drawing:', error);
        }
      }, 500); // Debounce by 500ms
    },
    [onDrawingChange]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!isClient) {
    return <div style={{ width: '100%', height: '100%' }} />;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-300">Loading drawing tool...</div>}>
        <ExcalidrawComponent
          initialData={initialData || { elements: [] }}
          onChange={handleExcalidrawChange}
        />
      </Suspense>
    </div>
  );
};

export default DrawingCanvas;
