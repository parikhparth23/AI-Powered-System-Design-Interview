'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramPanelProps {
  code: string;
}

export function DiagramPanel({ code }: DiagramPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    mermaid.initialize({ startOnLoad: true, theme: 'dark' });

    const renderDiagram = async () => {
      try {
        containerRef.current!.innerHTML = '';
        const { svg } = await mermaid.render('diagram', code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="text-red-400 p-4">Invalid diagram syntax</div>';
        }
      }
    };

    renderDiagram();
  }, [code]);

  return (
    <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}
