import { useState, useEffect } from 'react';
import type { HistoryEntry } from '../utils/types';
import { canOpenSourceUrl, formatDateTime, getSourceDisplayLabel } from '../utils/history-utils';
import { getUrgencyPreview } from '../utils/urgency-config';
import { TrashIcon, FileIcon } from './icons';

interface HistoryItemProps {
  entry: HistoryEntry;
  onView: (entry: HistoryEntry) => void;
  onExport: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function StatusBadges({
  flaggedCount,
  borderlineCount,
  normalCount,
}: {
  flaggedCount: number;
  borderlineCount: number;
  normalCount: number;
}) {
  if (flaggedCount === 0 && borderlineCount === 0) {
    return (
      <span className="rounded-full bg-status-normal-bg px-2 py-0.5 text-xs font-medium text-emerald-800">
        All normal
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flaggedCount > 0 && (
        <span className="rounded-full bg-status-abnormal-bg px-2 py-0.5 text-xs font-medium text-red-800">
          {flaggedCount} flagged
        </span>
      )}
      {borderlineCount > 0 && (
        <span className="rounded-full bg-status-borderline-bg px-2 py-0.5 text-xs font-medium text-amber-800">
          {borderlineCount} borderline
        </span>
      )}
      {normalCount > 0 && flaggedCount + borderlineCount > 0 && (
        <span className="rounded-full bg-bg-section px-2 py-0.5 text-xs font-medium text-text-secondary">
          {normalCount} normal
        </span>
      )}
    </div>
  );
}

export function HistoryItem({ entry, onView, onExport, onDelete }: HistoryItemProps) {
  const canOpen = canOpenSourceUrl(entry.sourceUrl);
  const urgencyPreview = getUrgencyPreview(entry.urgency);
  const sourceLabel = getSourceDisplayLabel(entry);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  const handleOpenSource = () => {
    if (canOpen && entry.sourceUrl) {
      chrome.tabs.create({ url: entry.sourceUrl });
    }
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(entry.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className="card relative hover:shadow-md">
      <button
        type="button"
        onClick={handleDeleteClick}
        className={`absolute right-3 top-3 flex items-center justify-center rounded-md px-2 py-1 transition ${
          confirmDelete
            ? 'bg-status-abnormal-bg text-xs font-semibold text-status-abnormal'
            : 'h-7 w-7 text-text-muted hover:bg-bg-section hover:text-text-primary'
        }`}
        aria-label={confirmDelete ? 'Confirm delete' : 'Delete entry'}
      >
        {confirmDelete ? 'Delete?' : <TrashIcon />}
      </button>

      <div className="mb-3 pr-8">
        <p className="flex items-start gap-2 font-semibold leading-snug text-text-primary">
          <FileIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          {entry.title}
        </p>
        <p className="mt-1 text-xs text-text-secondary">{formatDateTime(entry.date)}</p>
        <p className="mt-0.5 text-xs text-text-muted">{sourceLabel}</p>
      </div>

      <p className="mb-2 text-sm font-medium text-text-primary">{urgencyPreview}</p>
      <StatusBadges
        flaggedCount={entry.flaggedCount}
        borderlineCount={entry.borderlineCount}
        normalCount={entry.normalCount}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={() => onView(entry)} className="btn-primary h-8 px-3 text-xs">
          View
        </button>
        <button onClick={() => onExport(entry)} className="btn-secondary h-8 px-3 text-xs">
          Export PDF
        </button>
        {canOpen && (
          <button onClick={handleOpenSource} className="btn-ghost h-8 px-2 text-xs">
            Open original ↗
          </button>
        )}
      </div>
    </div>
  );
}
