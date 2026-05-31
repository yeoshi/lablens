import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
      {children}
    </h2>
  );
}
