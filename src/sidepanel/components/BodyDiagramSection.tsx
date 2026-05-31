import { useState, useCallback } from 'react';
import type { BodySystemGroup } from '../utils/types';
import { sortGroupsByStatus } from '../utils/body-regions';
import { BodyDiagram } from './BodyDiagram';
import { BodySystemDetailCard } from './BodySystemDetailCard';

interface BodyDiagramSectionProps {
  groups: BodySystemGroup[];
}

export function BodyDiagramSection({ groups }: BodyDiagramSectionProps) {
  const sortedGroups = sortGroupsByStatus(groups);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  const handleSelect = useCallback((system: string) => {
    setSelectedSystem((prev) => (prev === system ? null : system));
  }, []);

  const selectedGroup = sortedGroups.find((g) => g.system === selectedSystem) ?? null;

  return (
    <div className="w-full overflow-visible">
      <BodyDiagram
        groups={sortedGroups}
        selectedSystem={selectedSystem}
        onSelect={handleSelect}
      />

      <div
        className={`detail-card-slide ${selectedGroup ? 'detail-card-slide-open' : ''}`}
        aria-hidden={!selectedGroup}
      >
        <div className="detail-card-slide-inner">
          {selectedGroup && <BodySystemDetailCard group={selectedGroup} />}
        </div>
      </div>
    </div>
  );
}
