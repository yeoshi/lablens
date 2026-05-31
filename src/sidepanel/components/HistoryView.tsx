import type { HistoryEntry } from '../utils/types';
import { HistoryItem } from './HistoryItem';

interface HistoryViewProps {
  history: HistoryEntry[];
  onView: (entry: HistoryEntry) => void;
  onExport: (entry: HistoryEntry) => void;
  onClear: () => void;
  formatDate: (iso: string) => string;
}

export function HistoryView({
  history,
  onView,
  onExport,
  onClear,
  formatDate,
}: HistoryViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-sm text-text-secondary">No saved analyses yet.</p>
            <p className="mt-1 text-xs text-text-secondary">
              Analyze a lab report and tap Save to keep it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                onView={onView}
                onExport={onExport}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {history.length > 0 && (
          <button
            onClick={onClear}
            className="mt-6 w-full rounded-xl border border-red-200 py-2.5 text-sm font-medium text-status-abnormal transition hover:bg-status-abnormal-bg"
          >
            🗑️ Clear All History
          </button>
        )}
      </div>
    </div>
  );
}
