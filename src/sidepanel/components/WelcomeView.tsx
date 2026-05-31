import { DocumentSearchIcon, HospitalIcon, EmailIcon, FileIcon } from './icons';

interface WelcomeViewProps {
  onAnalyze: () => void;
  onUpload: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const WORKS_WITH = [
  { label: 'Hospital portals', Icon: HospitalIcon },
  { label: 'Emailed reports', Icon: EmailIcon },
  { label: 'Downloaded PDFs', Icon: FileIcon },
];

export function WelcomeView({ onAnalyze, onUpload, onDrop, onDragOver }: WelcomeViewProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center px-6 py-10"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <DocumentSearchIcon className="mb-6 h-14 w-14" />

      <h2 className="mb-3 text-lg font-semibold text-text-primary">Understand your lab results</h2>
      <div className="mb-6 h-px w-16 bg-border" />

      <p className="body-text mb-8 max-w-xs text-center">
        Open a lab result PDF in Chrome, or upload one directly to get a plain-English breakdown
        and questions for your doctor.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button onClick={onAnalyze} className="btn-primary-lg">
          Analyse This Page
        </button>
        <button onClick={onUpload} className="btn-secondary-lg">
          Upload PDF
        </button>
      </div>

      <div className="mt-8 w-full max-w-xs rounded-md border border-teal-200 bg-[#F0FDFA] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Works with
        </p>
        <ul className="space-y-3">
          {WORKS_WITH.map(({ label, Icon }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-primary-light text-brand-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <p className="body-text mt-6 max-w-xs text-center text-xs">
        Local files opened in Chrome cannot always be read — use Upload PDF for those.
      </p>
    </div>
  );
}
