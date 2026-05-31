import { UrgencyIcon } from './icons';
import type { AnalysisUrgency } from '../utils/types';
import { URGENCY_CONFIG } from '../utils/urgency-config';

interface UrgencyBannerProps {
  urgency: AnalysisUrgency;
  abnormalCount: number;
  borderlineCount: number;
}

function scrollToFirstFlagged() {
  document.getElementById('first-flagged-value')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function UrgencyBanner({ urgency, abnormalCount, borderlineCount }: UrgencyBannerProps) {
  const config = URGENCY_CONFIG[urgency];
  const count = urgency === 'action_needed' ? abnormalCount : borderlineCount;

  const body =
    urgency === 'action_needed'
      ? `Your results show ${count} value${count !== 1 ? 's' : ''} outside the normal range. We recommend discussing these with your doctor.`
      : urgency === 'worth_monitoring'
        ? `Your results are mostly normal with ${count} borderline value${count !== 1 ? 's' : ''} to keep an eye on.`
        : 'All your values are within the normal range.';

  return (
    <div
      className="urgency-banner w-full rounded-md p-4 transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: config.bg,
        borderLeft: `3px solid ${config.border}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div style={{ color: config.iconColor }}>
          <UrgencyIcon urgency={urgency} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: config.headingColor }}>
            {config.heading}
          </p>
          <p className="body-text mt-1" style={{ color: config.bodyColor }}>
            {body}
          </p>
          {urgency === 'action_needed' && (
            <button
              type="button"
              onClick={scrollToFirstFlagged}
              className="btn-ghost mt-2 h-auto px-0 text-xs"
              style={{ color: config.bodyColor }}
            >
              See flagged systems ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
