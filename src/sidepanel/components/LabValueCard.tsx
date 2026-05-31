import { useState } from 'react';
import type { LabValue } from '../utils/types';

interface LabValueCardProps {
  value: LabValue;
}

const STATUS_CONFIG = {
  normal: {
    dot: '🟢',
    border: 'border-l-status-normal',
    bg: 'bg-status-normal-bg',
    label: 'Normal',
  },
  borderline: {
    dot: '🟡',
    border: 'border-l-status-borderline',
    bg: 'bg-status-borderline-bg',
    label: 'Borderline',
  },
  abnormal: {
    dot: '🔴',
    border: 'border-l-status-abnormal',
    bg: 'bg-status-abnormal-bg',
    label: 'Abnormal',
  },
};

export function LabValueCard({ value }: LabValueCardProps) {
  const config = STATUS_CONFIG[value.status];
  const [expanded, setExpanded] = useState(value.status !== 'normal');

  return (
    <div
      className={`rounded-xl border border-border border-l-4 ${config.border} ${config.bg} overflow-hidden`}
    >
      <button
        className="flex w-full items-start justify-between p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-2">
            <span>{config.dot}</span>
            <span className="font-semibold text-text-primary">{value.name}</span>
          </div>
          {!expanded && (
            <p className="mt-1 font-mono text-xs text-text-secondary">{value.originalValue}</p>
          )}
        </div>
        {value.status === 'normal' && (
          <span className="text-xs text-text-secondary">{expanded ? '▲' : '▼'}</span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/50 px-4 pb-4">
          <div className="mb-3 space-y-1">
            <p className="font-mono text-sm text-text-primary">
              Your value: {value.originalValue}
            </p>
            <p className="font-mono text-xs text-text-secondary">
              Normal range: {value.referenceRange}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-text-primary">{value.explanation}</p>
          {value.analogy && (
            <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm italic text-accent-blue">
              💡 {value.analogy}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
