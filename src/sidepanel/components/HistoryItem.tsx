import type { HistoryEntry } from '../utils/types';

interface HistoryItemProps {
  entry: HistoryEntry;
  onView: (entry: HistoryEntry) => void;
  onExport: (entry: HistoryEntry) => void;
  formatDate: (iso: string) => string;
}

export function HistoryItem({ entry, onView, onExport, formatDate }: HistoryItemProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-text-primary">📋 {entry.title}</p>
          <p className="text-xs text-text-secondary">{formatDate(entry.analyzedAt)}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {entry.flaggedCount} flagged value{entry.flaggedCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => onView(entry)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-accent-blue hover:bg-blue-50"
        >
          View
        </button>
        <button
          onClick={() => onExport(entry)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-bg-panel"
        >
          📥
        </button>
      </div>
    </div>
  );
}
