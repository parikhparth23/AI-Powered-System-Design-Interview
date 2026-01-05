'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface DiagramEditorProps {
  code: string;
  onChange: (code: string) => void;
}

const EXAMPLE_DIAGRAM = `graph TB
    Client["Client"]
    LB["Load Balancer"]
    API["API Servers"]
    Cache["Redis"]
    DB["Database"]
    
    Client --> LB
    LB --> API
    API --> Cache
    API --> DB`;

export function DiagramEditor({ code, onChange }: DiagramEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!showPreview || !code || !containerRef.current) return;

    mermaid.initialize({ startOnLoad: true, theme: 'dark' });

    const renderDiagram = async () => {
      try {
        containerRef.current!.innerHTML = '';
        const { svg } = await mermaid.render('diagram-preview', code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="text-red-400 p-4 text-sm">Invalid diagram syntax</div>';
        }
      }
    };

    renderDiagram();
  }, [code, showPreview]);

  return (
    <div className="space-y-2 border-t border-slate-700 pt-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-400">
          System Architecture Diagram (Optional)
        </label>
        {code && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        )}
      </div>

      {!showPreview ? (
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder={EXAMPLE_DIAGRAM}
          className="w-full p-3 bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs rounded font-mono h-40 leading-relaxed"
        />
      ) : (
        <div
          ref={containerRef}
          className="w-full p-4 bg-slate-700/50 rounded overflow-auto flex items-center justify-center min-h-40 text-sm"
          style={{ maxHeight: '300px' }}
        />
      )}

      {!code && (
        <p className="text-xs text-slate-500">
          Optional: Draw your architecture using Mermaid syntax (flowcharts, diagrams, etc.)
        </p>
      )}
    </div>
  );
}
