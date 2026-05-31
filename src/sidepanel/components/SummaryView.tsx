import type { AnalysisResult } from '../utils/types';
import { HeroSummaryCard } from './HeroSummaryCard';
import { SectionLabel } from './SectionLabel';
import { BodyDiagramSection } from './BodyDiagramSection';
import { QuestionCard } from './QuestionCard';
import { Disclaimer } from './Disclaimer';
import { ActionBar } from './ActionBar';

interface SummaryViewProps {
  result: AnalysisResult;
  onExport: () => void;
  onSave: () => void;
  saveStatus?: 'idle' | 'saved' | 'duplicate';
}

const STAGGER_MS = 50;

function AnimatedSection({
  delay,
  children,
  className = '',
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`opacity-0 ${className}`}
      style={{ animation: `fade-in-up 300ms ease ${delay}ms forwards` }}
    >
      {children}
    </div>
  );
}

export function SummaryView({ result, onExport, onSave, saveStatus = 'idle' }: SummaryViewProps) {
  let delay = 0;
  const nextDelay = () => {
    const current = delay;
    delay += STAGGER_MS;
    return current;
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="summary-view flex w-full flex-col gap-6">
          <AnimatedSection delay={nextDelay()}>
            <HeroSummaryCard
              urgency={result.urgency}
              summary={result.summary}
              groups={result.groups}
            />
          </AnimatedSection>

          <AnimatedSection delay={nextDelay()} className="w-full">
            <BodyDiagramSection groups={result.groups} />
          </AnimatedSection>

          <AnimatedSection delay={nextDelay()} className="w-full">
            <SectionLabel>Questions for Your Doctor</SectionLabel>
            <div className="questions-list flex w-full flex-col gap-3">
              {result.questions.map((q, i) => (
                <div
                  key={i}
                  className="opacity-0"
                  style={{
                    animation: `fade-in-up 300ms ease ${delay + (i + 1) * STAGGER_MS}ms forwards`,
                  }}
                >
                  <QuestionCard question={q} index={i} />
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={delay + (result.questions.length + 1) * STAGGER_MS}>
            <Disclaimer />
          </AnimatedSection>
        </div>
      </div>

      <ActionBar onExport={onExport} onSave={onSave} saveStatus={saveStatus} />
    </>
  );
}
