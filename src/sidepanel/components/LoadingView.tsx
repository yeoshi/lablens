import type { ProcessingState } from '../utils/types';
import { CheckIcon, CircleIcon, FileIcon, SpinnerIcon, MessageIcon } from './icons';

interface LoadingViewProps {
  processing: ProcessingState;
}

const STEPS = [
  { key: 'extracting', label: 'Reading your lab report...', Icon: FileIcon },
  { key: 'translating', label: 'Translating to plain English...', Icon: SpinnerIcon },
  { key: 'questions', label: 'Generating questions', Icon: MessageIcon },
] as const;

function stepStatus(stepKey: string, current: ProcessingState): 'done' | 'active' | 'pending' {
  const order = ['extracting', 'translating', 'questions', 'done'];
  const currentIdx = order.indexOf(current.step);
  const stepIdx = order.indexOf(stepKey);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

function StepIcon({ status, Icon }: { status: 'done' | 'active' | 'pending'; Icon: typeof FileIcon }) {
  if (status === 'done') {
    return (
      <span className="flex h-5 w-5 items-center justify-center text-status-normal">
        <CheckIcon />
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="flex h-5 w-5 items-center justify-center text-brand-primary">
        <Icon />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center text-text-muted">
      <CircleIcon />
    </span>
  );
}

export function LoadingView({ processing }: LoadingViewProps) {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-widest text-text-muted">
          <span>Processing</span>
          <span>{processing.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-section">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-500 animate-pulse-bar"
            style={{ width: `${processing.progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {STEPS.map((step) => {
          const status = stepStatus(step.key, processing);
          return (
            <div key={step.key} className="flex items-start gap-3">
              <StepIcon status={status} Icon={step.Icon} />
              <div>
                <p
                  className={`text-sm font-medium ${
                    status === 'active'
                      ? 'text-text-primary'
                      : status === 'done'
                        ? 'text-text-secondary line-through'
                        : 'text-text-secondary'
                  }`}
                >
                  {step.label}
                </p>
                {status === 'active' && processing.message && (
                  <p className="mt-0.5 text-xs text-text-muted">{processing.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="body-text mt-auto pt-8 text-center text-xs">
        This usually takes about 10–15 seconds.
      </p>
    </div>
  );
}
