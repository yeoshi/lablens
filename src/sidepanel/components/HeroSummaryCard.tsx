import { HeroUrgencyIcon } from './icons';
import type { AnalysisUrgency, BodySystemGroup } from '../utils/types';
import { URGENCY_CONFIG } from '../utils/urgency-config';
import { formatRichText } from '../utils/format-summary';
import { getHotspotPosition, sortGroupsByStatus } from '../utils/body-regions';

interface HeroSummaryCardProps {
  urgency: AnalysisUrgency;
  summary: string;
  groups: BodySystemGroup[];
}

export function HeroSummaryCard({ urgency, summary, groups }: HeroSummaryCardProps) {
  const config = URGENCY_CONFIG[urgency];
  const flaggedGroups = sortGroupsByStatus(groups).filter((g) => g.status !== 'normal');

  return (
    <div
      className="hero-summary-card w-full rounded-[14px] p-5"
      style={{
        background: config.heroGradient,
        borderLeft: `4px solid ${config.heroBorder}`,
        boxShadow: `${config.heroInnerShadow}, var(--shadow-card)`,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0" style={{ color: config.iconColor }}>
          <HeroUrgencyIcon urgency={urgency} />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className="text-lg font-bold uppercase tracking-wide"
            style={{ color: config.headingColor }}
          >
            {config.heading}
          </h2>
          <p className="body-text mt-2 text-text-primary">{formatRichText(summary)}</p>

          {flaggedGroups.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {flaggedGroups.map((group) => {
                const { label } = getHotspotPosition(group.system);
                const isAbnormal = group.status === 'abnormal';

                return (
                  <span
                    key={group.system}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      background: isAbnormal ? '#FEF2F2' : '#FFFBEB',
                      color: isAbnormal ? '#EF4444' : '#F59E0B',
                      border: '1px solid currentColor',
                    }}
                  >
                    {isAbnormal ? '🔴' : '🟡'} {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
