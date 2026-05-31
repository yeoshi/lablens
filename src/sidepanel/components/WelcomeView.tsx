interface WelcomeViewProps {
  onAnalyze: () => void;
  onUpload: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export function WelcomeView({ onAnalyze, onUpload, onDrop, onDragOver }: WelcomeViewProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-5xl">
        🔬
      </div>

      <h2 className="mb-2 text-lg font-bold text-text-primary">Understand your lab results</h2>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-text-secondary">
        Open a lab result PDF in Chrome, or upload one directly to get a plain-English breakdown
        and questions for your doctor.
      </p>

      <button
        onClick={onAnalyze}
        className="mb-3 w-full max-w-xs rounded-xl bg-accent-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
      >
        🔍 Analyse This Page
      </button>

      <button
        onClick={onUpload}
        className="mb-6 w-full max-w-xs rounded-xl border border-border bg-bg-card px-6 py-3 text-sm font-semibold text-text-primary transition hover:bg-bg-panel active:scale-[0.98]"
      >
        📁 Upload PDF
      </button>

      <div className="w-full max-w-xs rounded-xl border-2 border-dashed border-border bg-bg-panel p-4 text-left">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Or drag & drop a PDF here
        </p>
        <ul className="space-y-1 text-sm text-text-secondary">
          <li>• Hospital patient portals</li>
          <li>• Emailed lab reports</li>
          <li>• Downloaded PDF files</li>
        </ul>
      </div>

      <p className="mt-6 text-xs text-text-secondary">
        Local files opened in Chrome cannot always be read — use Upload PDF for those.
      </p>
    </div>
  );
}
