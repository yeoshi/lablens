interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  onUpload: () => void;
}

export function ErrorView({ message, onRetry, onUpload }: ErrorViewProps) {
  const isLocalFile =
    message.toLowerCase().includes('local') ||
    message.toLowerCase().includes('upload') ||
    message.toLowerCase().includes('file url');

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 text-4xl">⚠️</div>
      <h2 className="mb-2 text-lg font-bold text-text-primary">Couldn&apos;t read this PDF</h2>
      <p className="mb-6 text-sm text-text-secondary">{message}</p>

      <div className="mb-8 w-full max-w-xs rounded-xl bg-bg-panel p-4 text-left text-sm text-text-secondary">
        <p className="mb-2 font-medium text-text-primary">This might happen if:</p>
        <ul className="space-y-1">
          <li>• The PDF is opened as a local file (use Upload PDF instead)</li>
          <li>• The PDF is image-only (no selectable text)</li>
          <li>• The page isn&apos;t a lab report</li>
          <li>• The file is password-protected</li>
        </ul>
      </div>

      {isLocalFile ? (
        <button
          onClick={onUpload}
          className="mb-3 w-full max-w-xs rounded-xl bg-accent-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          📁 Upload PDF Instead
        </button>
      ) : null}

      <button
        onClick={onRetry}
        className={`w-full max-w-xs rounded-xl px-6 py-3 text-sm font-semibold transition ${
          isLocalFile
            ? 'border border-border bg-bg-card text-text-primary hover:bg-bg-panel'
            : 'bg-accent-blue text-white hover:bg-blue-700'
        }`}
      >
        Try Again
      </button>
    </div>
  );
}
