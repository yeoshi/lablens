export type HeaderView = 'welcome' | 'results' | 'history' | 'loading' | 'error';

interface HeaderProps {
  view: HeaderView;
  onHistoryClick: () => void;
  onNewAnalysis?: () => void;
  onBackClick?: () => void;
}

function Logo() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-primary">
        <span className="text-sm font-bold text-white">L</span>
      </div>
      <span className="truncate text-base font-semibold text-text-primary">LabLens</span>
    </div>
  );
}

export function Header({ view, onHistoryClick, onNewAnalysis, onBackClick }: HeaderProps) {
  if (view === 'history') {
    return (
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-card px-4 py-3">
        <button onClick={onBackClick} className="btn-ghost h-auto px-0">
          ← Back
        </button>
        <span className="text-sm font-semibold text-text-primary">Your History</span>
        <div className="w-14 shrink-0" aria-hidden="true" />
      </header>
    );
  }

  const showNewAnalysis = view === 'results';

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {showNewAnalysis && (
          <button onClick={onNewAnalysis} className="btn-ghost h-auto shrink-0 px-0">
            ← New Analysis
          </button>
        )}
        {!showNewAnalysis && <Logo />}
        {showNewAnalysis && (
          <div className="hidden min-w-0 sm:block">
            <Logo />
          </div>
        )}
      </div>

      <button onClick={onHistoryClick} className="btn-ghost h-auto shrink-0 px-2">
        History
      </button>
    </header>
  );
}
