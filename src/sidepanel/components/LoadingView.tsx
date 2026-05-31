import type { ProcessingState } from '../utils/types';

interface LoadingViewProps {
  processing: ProcessingState;
}

const STEPS = [
  { key: 'extracting', label: 'Reading your lab report...', icon: '📄' },
  { key: 'translating', label: 'Translating to plain English...', icon: '🔄' },
  { key: 'questions', label: 'Generating questions', icon: '💬' },
] as const;

function stepStatus(stepKey: string, current: ProcessingState): 'done' | 'active' | 'pending' {
  const order = ['extracting', 'translating', 'questions', 'done'];
  const currentIdx = order.indexOf(current.step);
  const stepIdx = order.indexOf(stepKey);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export function LoadingView({ processing }: LoadingViewProps) {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-medium text-text-secondary">
          <span>Processing</span>
          <span>{processing.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-panel">
          <div
            className="h-full rounded-full bg-accent-blue transition-all duration-500 animate-pulse-bar"
            style={{ width: `${processing.progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {STEPS.map((step) => {
          const status = stepStatus(step.key, processing);
          return (
            <div key={step.key} className="flex items-start gap-3">
              <span className="text-lg">
                {status === 'done' ? '✅' : status === 'active' ? step.icon : '○'}
              </span>
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
                  <p className="mt-0.5 text-xs text-text-secondary">{processing.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-auto pt-8 text-center text-xs text-text-secondary">
        This usually takes about 10–15 seconds.
      </p>
    </div>
  );
}
