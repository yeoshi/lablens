import type { AnalysisResult } from '../utils/types';
import { LabValueCard } from './LabValueCard';
import { QuestionCard } from './QuestionCard';
import { Disclaimer } from './Disclaimer';
import { ActionBar } from './ActionBar';

interface SummaryViewProps {
  result: AnalysisResult;
  onExport: () => void;
  onSave: () => void;
  saved?: boolean;
}

export function SummaryView({ result, onExport, onSave, saved }: SummaryViewProps) {
  const flaggedCount = result.values.filter((v) => v.status !== 'normal').length;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-text-secondary">
            📊 Your Results Summary
          </h2>
          <div className="rounded-xl border border-border bg-bg-card p-4">
            <p className="text-sm leading-relaxed text-text-primary">{result.summary}</p>
            {flaggedCount > 0 && (
              <p className="mt-2 text-xs font-medium text-status-abnormal">
                {flaggedCount} value{flaggedCount !== 1 ? 's' : ''} flagged for discussion
              </p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">
            Lab Values
          </h2>
          <div className="space-y-3">
            {result.values.map((value) => (
              <LabValueCard key={value.name} value={value} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">
            Questions for Your Doctor
          </h2>
          <div className="space-y-3">
            {result.questions.map((q, i) => (
              <QuestionCard key={i} question={q} index={i} />
            ))}
          </div>
        </section>

        <Disclaimer />
      </div>

      <ActionBar onExport={onExport} onSave={onSave} saved={saved} />
    </>
  );
}
