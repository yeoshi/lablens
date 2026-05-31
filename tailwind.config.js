/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F8FAFB',
        'bg-card': '#FFFFFF',
        'bg-section': '#F1F5F9',
        'bg-panel': '#F1F5F9',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
        'brand-primary': '#0D9488',
        'brand-primary-light': '#CCFBF1',
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
        lg: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
        md: '0 2px 8px rgba(15, 23, 42, 0.06)',
        hover: '0 4px 12px rgba(15, 23, 42, 0.08)',
        'action-bar': '0 -2px 8px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
