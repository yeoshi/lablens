/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FAFBFC',
        'bg-card': '#FFFFFF',
        'bg-panel': '#F4F6F8',
        'text-primary': '#1A2332',
        'text-secondary': '#5F6B7A',
        'accent-blue': '#2563EB',
        'status-normal': '#10B981',
        'status-borderline': '#F59E0B',
        'status-abnormal': '#EF4444',
        'status-normal-bg': '#ECFDF5',
        'status-borderline-bg': '#FFFBEB',
        'status-abnormal-bg': '#FEF2F2',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
