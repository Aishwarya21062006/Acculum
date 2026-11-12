import React from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'teal';

interface BadgeProps {
  label: string;
  variant: Variant;
  size?: 'sm' | 'md';
}

const variants: Record<Variant, string> = {
  success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  danger: 'bg-red-100 text-red-800 border border-red-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border border-purple-200',
  teal: 'bg-teal-100 text-teal-800 border border-teal-200',
};

export function Badge({ label, variant, size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const map: Record<string, { label: string; variant: Variant }> = {
    intervention_required: { label: 'Requires Intervention', variant: 'danger' },
    needs_attention: { label: 'Needs Attention', variant: 'warning' },
    on_track: { label: 'On Track', variant: 'success' },
    improving: { label: 'Improving', variant: 'info' },
  };
  const cfg = map[priority] || { label: priority, variant: 'neutral' as Variant };
  return <Badge label={cfg.label} variant={cfg.variant} />;
}
