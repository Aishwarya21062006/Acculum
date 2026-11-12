import React from 'react';
import { AlertTriangle, TrendingDown, Brain, BookOpen, HelpCircle, TrendingUp, Target } from 'lucide-react';

const SIGNAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  PERFORMANCE_SIGNAL: { label: 'Performance', color: 'text-red-700', bg: 'bg-red-100', icon: TrendingDown },
  REPEATED_ERROR_SIGNAL: { label: 'Repeated Errors', color: 'text-orange-700', bg: 'bg-orange-100', icon: AlertTriangle },
  CONFIDENCE_PERFORMANCE_SIGNAL: { label: 'Confidence vs Performance', color: 'text-purple-700', bg: 'bg-purple-100', icon: Brain },
  ENGAGEMENT_SIGNAL: { label: 'Engagement', color: 'text-amber-700', bg: 'bg-amber-100', icon: BookOpen },
  HELP_SEEKING_SIGNAL: { label: 'Help Seeking', color: 'text-blue-700', bg: 'bg-blue-100', icon: HelpCircle },
  IMPROVEMENT_SIGNAL: { label: 'Improvement', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: TrendingUp },
  PERSISTENCE_SIGNAL: { label: 'Persistence', color: 'text-teal-700', bg: 'bg-teal-100', icon: Target },
};

export function SignalBadge({ signalType }: { signalType: string }) {
  const cfg = SIGNAL_CONFIG[signalType] || { label: signalType, color: 'text-gray-700', bg: 'bg-gray-100', icon: AlertTriangle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

export function SignalIcon({ signalType, size = 16 }: { signalType: string; size?: number }) {
  const cfg = SIGNAL_CONFIG[signalType] || { icon: AlertTriangle, color: 'text-gray-500', bg: '' };
  const Icon = cfg.icon;
  return <Icon size={size} className={cfg.color} />;
}

export { SIGNAL_CONFIG };
