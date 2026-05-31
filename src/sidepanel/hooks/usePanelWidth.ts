import { useEffect, useRef, useState } from 'react';

export type PanelWidth = 'narrow' | 'medium' | 'wide';

function getPanelWidth(width: number): PanelWidth {
  if (width >= 700) return 'wide';
  if (width > 420) return 'medium';
  return 'narrow';
}

export function usePanelWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<PanelWidth>('narrow');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setPanelWidth(getPanelWidth(width));
    });

    observer.observe(el);
    setPanelWidth(getPanelWidth(el.getBoundingClientRect().width));

    return () => observer.disconnect();
  }, []);

  return { containerRef, panelWidth };
}
