import type { AnalysisUrgency } from './types';

export const URGENCY_CONFIG = {
  action_needed: {
    bg: '#FEF2F2',
    border: '#EF4444',
    headingColor: '#991B1B',
    bodyColor: '#7F1D1D',
    iconColor: '#991B1B',
    heading: 'Follow up recommended',
    preview: 'Follow up recommended',
  },
  worth_monitoring: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    headingColor: '#92400E',
    bodyColor: '#92400E',
    iconColor: '#92400E',
    heading: 'Worth monitoring',
    preview: 'Worth monitoring',
  },
  all_clear: {
    bg: '#ECFDF5',
    border: '#10B981',
    headingColor: '#065F46',
    bodyColor: '#065F46',
    iconColor: '#065F46',
    heading: 'Looking good',
    preview: 'Looking good',
  },
} as const;

export function getUrgencyPreview(urgency: AnalysisUrgency): string {
  return URGENCY_CONFIG[urgency].preview;
}
