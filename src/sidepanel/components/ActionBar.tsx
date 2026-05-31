interface ActionBarProps {
  onExport: () => void;
  onSave: () => void;
  saved?: boolean;
}

export function ActionBar({ onExport, onSave, saved }: ActionBarProps) {
  return (
    <div className="sticky bottom-0 flex gap-3 border-t border-border bg-bg-card px-4 py-3">
      <button
        onClick={onExport}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-bg-card py-2.5 text-sm font-semibold text-text-primary transition hover:bg-bg-panel"
      >
        📥 Export PDF
      </button>
      <button
        onClick={onSave}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition ${
          saved ? 'bg-status-normal' : 'bg-accent-blue hover:bg-blue-700'
        }`}
      >
        {saved ? '✓ Saved' : '💾 Save'}
      </button>
    </div>
  );
}
