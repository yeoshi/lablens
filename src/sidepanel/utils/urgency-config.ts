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
    heroGradient: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)',
    heroBorder: '#EF4444',
    heroInnerShadow: 'inset 0 1px 3px rgba(239, 68, 68, 0.08)',
    pillBg: '#FEE2E2',
    pillText: '#991B1B',
  },
  worth_monitoring: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    headingColor: '#92400E',
    bodyColor: '#92400E',
    iconColor: '#92400E',
    heading: 'Worth monitoring',
    preview: 'Worth monitoring',
    heroGradient: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFF0 100%)',
    heroBorder: '#F59E0B',
    heroInnerShadow: 'inset 0 1px 3px rgba(245, 158, 11, 0.08)',
    pillBg: '#FEF3C7',
    pillText: '#92400E',
  },
  all_clear: {
    bg: '#ECFDF5',
    border: '#10B981',
    headingColor: '#065F46',
    bodyColor: '#065F46',
    iconColor: '#065F46',
    heading: 'Looking good',
    preview: 'Looking good',
    heroGradient: 'linear-gradient(135deg, #ECFDF5 0%, #F0FFF4 100%)',
    heroBorder: '#10B981',
    heroInnerShadow: 'inset 0 1px 3px rgba(16, 185, 129, 0.08)',
    pillBg: '#D1FAE5',
    pillText: '#065F46',
  },
} as const;

export function getUrgencyPreview(urgency: AnalysisUrgency): string {
  return URGENCY_CONFIG[urgency].preview;
}
