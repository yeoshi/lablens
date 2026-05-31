import type { LabValueStatus } from '../utils/types';

interface IconProps {
  className?: string;
}

export function LabLensLogo({ className = 'h-7 w-7' }: IconProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md bg-brand-primary ${className}`}
    >
      <span className="text-sm font-bold text-white">L</span>
    </div>
  );
}

export function DocumentSearchIcon({ className = 'h-12 w-12' }: IconProps) {
  return (
    <svg className={`${className} text-brand-primary`} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="6" width="24" height="32" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M14 16h12M14 22h12M14 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="34" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M39 39l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldAlertIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5l6.5 2.5v5c0 4.2-2.8 7.4-6.5 8.5C6.3 17.4 3.5 14.2 3.5 10V5L10 2.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 7v4M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckCircleIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InfoCircleIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v4M10 7v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 4.5h10M6 4.5V3.5h4v1M5.5 4.5v8h5v-8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronUpIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 8.5L7 5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CircleIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 6l14 24H6L20 6z" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 16v8M20 28v1" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function StatusDot({ status, className = '' }: { status: LabValueStatus; className?: string }) {
  const colors: Record<LabValueStatus, string> = {
    normal: 'bg-status-normal',
    borderline: 'bg-status-borderline',
    abnormal: 'bg-status-abnormal',
  };

  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors[status]} ${className}`}
      aria-hidden="true"
    />
  );
}

const SYSTEM_ABBR: Record<string, string> = {
  'Liver Health': 'LH',
  'Blood Count': 'BC',
  'Cholesterol & Heart': 'CH',
  'Kidney Function': 'KF',
  'Blood Sugar': 'BS',
  Thyroid: 'TH',
  'Other Results': 'OR',
};

export function SystemBadge({ system }: { system: string }) {
  const abbr = SYSTEM_ABBR[system] ?? system.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-primary-light text-xs font-semibold text-brand-primary">
      {abbr}
    </div>
  );
}

export function FileIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 2.5h5.5L12 5v8.5H4V2.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M9.5 2.5V5H12" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

export function HospitalIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 6.5v4M6 8.5h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function EmailIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2 5l6 4 6-4" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

export function ClipboardIcon({ className = 'h-8 w-8' }: IconProps) {
  return (
    <svg className={`${className} text-brand-primary`} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="8" y="6" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6V5a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 14h8M12 18h8M12 22h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SpinnerIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MessageIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 4.5h11v6h-3.5L6 13v-2.5H2.5v-6z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldCheckIcon({ className = 'h-8 w-8' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 4l10 4v7c0 6.5-4.5 11.5-10 13C10.5 26.5 6 21.5 6 15V8l10-4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M11 16l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroUrgencyIcon({ urgency, className = 'h-8 w-8' }: { urgency: string; className?: string }) {
  if (urgency === 'action_needed') return <ShieldAlertIcon className={className} />;
  if (urgency === 'worth_monitoring') return <InfoCircleIcon className={className} />;
  return <ShieldCheckIcon className={className} />;
}

export function UrgencyIcon({ urgency, className = 'h-5 w-5' }: { urgency: string; className?: string }) {
  if (urgency === 'action_needed') return <ShieldAlertIcon className={className} />;
  if (urgency === 'worth_monitoring') return <InfoCircleIcon className={className} />;
  return <CheckCircleIcon className={className} />;
}
