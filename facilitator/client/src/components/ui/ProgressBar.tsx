import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
  showLabel?: boolean;
  height?: 'sm' | 'md';
}

const colors = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

export function ProgressBar({ value, max = 100, color = 'indigo', showLabel = false, height = 'sm' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const h = height === 'sm' ? 'h-2' : 'h-3';
  const barColor = pct >= 75 ? colors.emerald : pct >= 50 ? colors.indigo : pct >= 35 ? colors.amber : colors.red;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-gray-100 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${color === 'indigo' ? barColor : colors[color]} ${h} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 w-10 text-right">{pct}%</span>
      )}
    </div>
  );
}
