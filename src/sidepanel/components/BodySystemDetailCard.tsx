import { useState } from 'react';
import type { BodySystemGroup, GroupLabValue } from '../utils/types';
import { formatRichText } from '../utils/format-summary';
import { StatusDot, SystemBadge, ChevronDownIcon, ChevronUpIcon } from './icons';

interface BodySystemDetailCardProps {
  group: BodySystemGroup;
}

function ValueRow({ value }: { value: GroupLabValue }) {
  const displayValue = value.unit ? `${value.value} ${value.unit}` : value.value;

  return (
    <div className="grid grid-cols-[minmax(3rem,4rem)_1fr_minmax(4rem,5rem)_1rem] items-center gap-2 px-3 py-2">
      <span className="truncate text-sm font-medium text-text-primary">{value.name}</span>
      <span className="font-mono text-[13px] font-medium text-text-primary">{displayValue}</span>
      <span className="font-mono text-[13px] text-text-muted">({value.referenceRange})</span>
      <StatusDot status={value.status} className="justify-self-end" />
    </div>
  );
}

export function BodySystemDetailCard({ group }: BodySystemDetailCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(group.status !== 'normal');
  const showAnalogy =
    group.analogy && (group.status === 'abnormal' || group.status === 'borderline');

  return (
    <div className="card shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <SystemBadge system={group.system} />
          <h3 className="card-title">{group.system}</h3>
        </div>
        <StatusDot status={group.status} />
      </div>

      <p className="body-text text-text-primary">{formatRichText(group.topline)}</p>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between rounded-sm border border-border bg-bg-card px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted transition hover:bg-bg-section"
        >
          <span>Details</span>
          {detailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>

        {detailsOpen && (
          <div className="mt-2 overflow-hidden rounded-sm border border-border bg-bg-card">
            <div className="grid grid-cols-[minmax(3rem,4rem)_1fr_minmax(4rem,5rem)_1rem] gap-2 border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">
              <span>Test</span>
              <span>Value</span>
              <span>Range</span>
              <span />
            </div>
            {group.values.map((value) => (
              <ValueRow key={`${value.name}-${value.value}`} value={value} />
            ))}
          </div>
        )}
      </div>

      {showAnalogy && (
        <p className="mt-4 rounded-sm bg-brand-primary-light px-3 py-3 text-sm italic leading-relaxed text-brand-primary">
          💡 {formatRichText(group.analogy!)}
        </p>
      )}
    </div>
  );
}
