import type { BodySystemGroup } from '../utils/types';
import {
  getHotspotPosition,
  HOTSPOT_CONNECTOR_WIDTH,
  HOTSPOT_DOT_SIZE,
  STATUS_COLORS,
} from '../utils/body-regions';
import { getSilhouetteDimensions, HumanBodySilhouette } from './HumanBodySilhouette';

interface BodyDiagramProps {
  groups: BodySystemGroup[];
  selectedSystem: string | null;
  onSelect: (system: string) => void;
}

function Hotspot({
  group,
  isSelected,
  onSelect,
}: {
  group: BodySystemGroup;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { x, y, label, labelSide } = getHotspotPosition(group.system);
  const effectiveLabelSide = labelSide ?? (x >= 50 ? 'right' : 'left');
  const color = STATUS_COLORS[group.status];
  const isAbnormal = group.status === 'abnormal';

  const dot = (
    <span
      className={`body-hotspot-dot shrink-0 rounded-full ${
        isAbnormal && !isSelected ? 'animate-abnormal-pulse' : ''
      } ${isSelected ? 'body-hotspot-dot-selected' : ''}`}
      style={{
        width: HOTSPOT_DOT_SIZE,
        height: HOTSPOT_DOT_SIZE,
        backgroundColor: color,
        ['--hotspot-color' as string]: color,
      }}
    />
  );

  const connector = (
    <span
      className="shrink-0"
      style={{
        width: HOTSPOT_CONNECTOR_WIDTH,
        height: 1,
        backgroundColor: color,
        opacity: 0.5,
      }}
    />
  );

  const labelPill = (
    <span
      className="shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors duration-150"
      style={
        isSelected
          ? { backgroundColor: color, borderColor: color, color: '#ffffff' }
          : { backgroundColor: '#ffffff', borderColor: color, color }
      }
    >
      {label}
    </span>
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${label}: ${group.status}`}
      aria-pressed={isSelected}
      className="body-hotspot-group absolute z-10 flex cursor-pointer items-center border-0 bg-transparent p-0"
      style={{
        top: `${y}%`,
        left: `${x}%`,
        transform: 'translate(-50%, -50%)',
        gap: 0,
        flexDirection: 'row',
      }}
    >
      {effectiveLabelSide === 'left' ? (
        <>
          {labelPill}
          {connector}
          {dot}
        </>
      ) : (
        <>
          {dot}
          {connector}
          {labelPill}
        </>
      )}
    </button>
  );
}

export function BodyDiagram({ groups, selectedSystem, onSelect }: BodyDiagramProps) {
  const { width, height } = getSilhouetteDimensions();

  return (
    <div className="flex justify-center overflow-visible py-2">
      <div
        className="relative overflow-visible"
        style={{ width, height, cursor: 'crosshair' }}
        aria-label="Human body diagram showing lab result regions"
        role="img"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
          const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
          console.log(`x: ${x}, y: ${y}`);
        }}
      >
        <HumanBodySilhouette />
        {groups.map((group) => (
          <Hotspot
            key={group.system}
            group={group}
            isSelected={selectedSystem === group.system}
            onSelect={() => onSelect(group.system)}
          />
        ))}
      </div>
    </div>
  );
}
