import { formatRichText } from '../utils/format-summary';

interface OverviewSummaryProps {
  summary: string;
}

export function OverviewSummary({ summary }: OverviewSummaryProps) {
  return (
    <div className="overview-summary card">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
        Your Results Summary
      </h2>
      <p className="body-text text-text-primary">{formatRichText(summary)}</p>
    </div>
  );
}
