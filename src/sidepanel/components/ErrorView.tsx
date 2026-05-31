import { AlertTriangleIcon } from './icons';

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
      <AlertTriangleIcon className="mb-4" />
      <h2 className="mb-2 text-lg font-semibold text-text-primary">Couldn&apos;t read this PDF</h2>
      <p className="body-text mb-6 max-w-xs">{message}</p>

      <div className="card mb-8 w-full max-w-xs text-left">
        <p className="mb-2 text-sm font-semibold text-text-primary">This might happen if:</p>
        <ul className="body-text space-y-1 text-sm">
          <li>• The PDF is opened as a local file (use Upload PDF instead)</li>
          <li>• The PDF is image-only (no selectable text)</li>
          <li>• The page isn&apos;t a lab report</li>
          <li>• The file is password-protected</li>
        </ul>
      </div>

      {isLocalFile ? (
        <button onClick={onUpload} className="btn-primary-lg mb-3 max-w-xs">
          Upload PDF Instead
        </button>
      ) : null}

      <button
        onClick={onRetry}
        className={isLocalFile ? 'btn-secondary-lg max-w-xs' : 'btn-primary-lg max-w-xs'}
      >
        Try Again
      </button>
    </div>
  );
}
