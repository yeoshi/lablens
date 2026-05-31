type SaveStatus = 'idle' | 'saved' | 'duplicate';

interface ActionBarProps {
  onExport: () => void;
  onSave: () => void;
  saveStatus?: SaveStatus;
}

export function ActionBar({ onExport, onSave, saveStatus = 'idle' }: ActionBarProps) {
  const saved = saveStatus === 'saved';
  const duplicate = saveStatus === 'duplicate';

  return (
    <div className="sticky bottom-0 flex gap-3 border-t border-border bg-bg-card px-4 py-3 shadow-action-bar">
      <button onClick={onExport} className="btn-primary flex-1">
        Export PDF
      </button>
      <button
        onClick={onSave}
        disabled={duplicate}
        className={`flex-1 rounded-lg border text-sm font-semibold transition-all duration-150 ${
          saved || duplicate
            ? 'h-10 border-status-normal bg-status-normal-bg text-green-800'
            : 'btn-secondary'
        }`}
      >
        {duplicate ? 'Already saved' : saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
