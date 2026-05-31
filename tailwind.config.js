/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F0F4F8',
        'bg-card': '#FFFFFF',
        'bg-section': '#F1F5F9',
        'bg-panel': '#F1F5F9',
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
        'brand-primary': '#1E40AF',
        'brand-primary-light': '#DBEAFE',
        'brand-bg': '#EFF6FF',
        'brand-border': '#93C5FD',
        'brand-dark': '#1E3A8A',
        'brand-secondary': '#2563EB',
        'status-normal': '#10B981',
        'status-borderline': '#F59E0B',
        'status-abnormal': '#EF4444',
        'status-normal-bg': '#ECFDF5',
        'status-borderline-bg': '#FFFBEB',
        'status-abnormal-bg': '#FEF2F2',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '14px',
        card: '14px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(30, 41, 59, 0.04), 0 1px 2px rgba(30, 41, 59, 0.06)',
        md: '0 2px 8px rgba(30, 41, 59, 0.06)',
        hover: '0 4px 6px rgba(30, 41, 59, 0.07), 0 2px 4px rgba(30, 41, 59, 0.05)',
        card: '0 1px 3px rgba(30, 41, 59, 0.04), 0 1px 2px rgba(30, 41, 59, 0.06)',
        'card-hover':
          '0 4px 6px rgba(30, 41, 59, 0.07), 0 2px 4px rgba(30, 41, 59, 0.05)',
        'action-bar': '0 -2px 8px rgba(30, 41, 59, 0.04)',
        header: '0 1px 3px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
