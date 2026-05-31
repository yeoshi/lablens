import type { AnalysisResult } from '../utils/types';
import { UrgencyBanner } from './UrgencyBanner';
import { OverviewSummary } from './OverviewSummary';
import { SectionLabel } from './SectionLabel';
import { BodySystemGroupCard } from './BodySystemGroupCard';
import { QuestionCard } from './QuestionCard';
import { Disclaimer } from './Disclaimer';
import { ActionBar } from './ActionBar';
import { countFlaggedValues, getFirstFlaggedGroupIndex } from '../utils/normalize-analysis';

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
  const { abnormalCount, borderlineCount } = countFlaggedValues(result);
  const firstFlaggedIndex = getFirstFlaggedGroupIndex(result.groups);

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
            <UrgencyBanner
              urgency={result.urgency}
              abnormalCount={abnormalCount}
              borderlineCount={borderlineCount}
            />
          </AnimatedSection>

          <AnimatedSection delay={nextDelay()}>
            <OverviewSummary summary={result.summary} />
          </AnimatedSection>

          <AnimatedSection delay={nextDelay()} className="w-full">
            <SectionLabel>Your Body Systems</SectionLabel>
            <div className="lab-values-grid">
              {result.groups.map((group, index) => (
                <BodySystemGroupCard
                  key={group.system}
                  group={group}
                  id={index === firstFlaggedIndex ? 'first-flagged-value' : undefined}
                  animationDelay={delay + index * STAGGER_MS}
                />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection
            delay={delay + result.groups.length * STAGGER_MS}
            className="w-full"
          >
            <SectionLabel>Questions for Your Doctor</SectionLabel>
            <div className="questions-list flex w-full flex-col gap-3">
              {result.questions.map((q, i) => (
                <div
                  key={i}
                  className="opacity-0"
                  style={{
                    animation: `fade-in-up 300ms ease ${delay + result.groups.length * STAGGER_MS + (i + 1) * STAGGER_MS}ms forwards`,
                  }}
                >
                  <QuestionCard question={q} index={i} />
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection
            delay={
              delay +
              result.groups.length * STAGGER_MS +
              (result.questions.length + 1) * STAGGER_MS
            }
          >
            <Disclaimer />
          </AnimatedSection>
        </div>
      </div>

      <ActionBar onExport={onExport} onSave={onSave} saveStatus={saveStatus} />
    </>
  );
}
