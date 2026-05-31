import type { BodySystemGroup, LabValueStatus } from './types';
import { getSilhouetteDimensions } from '../assets/human-body-silhouette-path';

export type LabelSide = 'left' | 'right';

export interface HotspotPosition {
  x: number;
  y: number;
  label: string;
  labelSide?: LabelSide;
}

export function resolveLabelSide(x: number, labelSide?: LabelSide): LabelSide {
  return labelSide ?? (x >= 50 ? 'right' : 'left');
}

/** Hotspot positions as percentage of silhouette container (top/left) */
export const HOTSPOT_POSITIONS: Record<string, HotspotPosition> = {
  'Cholesterol & Heart': { x: 43, y: 30, label: 'Heart', labelSide: 'left' },
  'Blood Count': { x: 54, y: 27, label: 'Blood', labelSide: 'right' },
  'Liver Health': { x: 61, y: 37, label: 'Liver', labelSide: 'right' },
  'Kidney Function': { x: 44, y: 44, label: 'Kidneys', labelSide: 'left' },
  'Blood Sugar': { x: 47, y: 40, label: 'Sugar', labelSide: 'left' },
  Thyroid: { x: 50, y: 15, label: 'Thyroid', labelSide: 'right' },
  'Other Results': { x: 48, y: 49, label: 'Other', labelSide: 'left' },
};

export const HOTSPOT_DOT_SIZE = 12;
export const HOTSPOT_CONNECTOR_WIDTH = 28;

const { width: DIAGRAM_WIDTH, height: DIAGRAM_HEIGHT } = getSilhouetteDimensions();
export { DIAGRAM_WIDTH, DIAGRAM_HEIGHT };

export const STATUS_ORDER: Record<LabValueStatus, number> = {
  abnormal: 0,
  borderline: 1,
  normal: 2,
};

export function sortGroupsByStatus(groups: BodySystemGroup[]): BodySystemGroup[] {
  return [...groups].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export function getHotspotPosition(system: string): HotspotPosition {
  return (
    HOTSPOT_POSITIONS[system] ?? {
      x: 50,
      y: 50,
      label: system.split(' ')[0],
    }
  );
}

/** @deprecated Use getHotspotPosition */
export function getBodyRegion(system: string): HotspotPosition {
  return getHotspotPosition(system);
}

export const STATUS_COLORS: Record<LabValueStatus, string> = {
  abnormal: '#EF4444',
  borderline: '#F59E0B',
  normal: '#10B981',
};
