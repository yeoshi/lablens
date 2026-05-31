import type { HistoryEntry } from '../utils/types';
import { HistoryItem } from './HistoryItem';
import { ClipboardIcon } from './icons';

interface HistoryViewProps {
  history: HistoryEntry[];
  onView: (entry: HistoryEntry) => void;
  onExport: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryView({ history, onView, onExport, onDelete, onClear }: HistoryViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ClipboardIcon className="mb-4" />
            <p className="text-sm text-text-secondary">No saved analyses yet.</p>
            <p className="mt-1 text-xs text-text-muted">
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
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {history.length > 0 && (
          <button onClick={onClear} className="btn-ghost mt-6 w-full">
            Clear All History
          </button>
        )}
      </div>
    </div>
  );
}
