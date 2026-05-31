interface HeaderProps {
  onHistoryClick: () => void;
  showBack?: boolean;
  onBackClick?: () => void;
  title?: string;
}

export function Header({ onHistoryClick, showBack, onBackClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-card px-4 py-3">
      {showBack ? (
        <button
          onClick={onBackClick}
          className="flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
        >
          ← Back
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-lg">🔬</span>
          <span className="text-lg font-bold text-text-primary">LabLens</span>
        </div>
      )}

      {title ? (
        <span className="text-sm font-semibold text-text-primary">{title}</span>
      ) : (
        <button
          onClick={onHistoryClick}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition hover:bg-bg-panel hover:text-text-primary"
        >
          History 📋
        </button>
      )}
    </header>
  );
}
