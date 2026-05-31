import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">
      {children}
    </h2>
  );
}
