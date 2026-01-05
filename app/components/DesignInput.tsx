'use client';

import { ChangeEvent } from 'react';

interface DesignInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DesignInput({ value, onChange }: DesignInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      className="w-full h-full p-6 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm leading-relaxed"
    />
  );
}
