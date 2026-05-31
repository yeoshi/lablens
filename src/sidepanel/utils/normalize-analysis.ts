import type {
  AnalysisResult,
  AnalysisUrgency,
  BodySystemGroup,
  GroupLabValue,
  LabValueStatus,
  LegacyLabValue,
} from './types';
import { BODY_SYSTEMS, groupLabValuesBySystem } from './group-lab-values';

const DEFAULT_DISCLAIMER =
  'This is not medical advice. Please consult your healthcare provider for interpretation of your results.';

const STATUS_ORDER: Record<LabValueStatus, number> = {
  abnormal: 0,
  borderline: 1,
  normal: 2,
};

function worstStatus(values: GroupLabValue[]): LabValueStatus {
  if (values.some((v) => v.status === 'abnormal')) return 'abnormal';
  if (values.some((v) => v.status === 'borderline')) return 'borderline';
  return 'normal';
}

function deriveUrgency(groups: BodySystemGroup[]): AnalysisUrgency {
  if (groups.some((g) => g.status === 'abnormal')) return 'action_needed';
  if (groups.some((g) => g.status === 'borderline')) return 'worth_monitoring';
  return 'all_clear';
}

function normalizeStatus(status: string | undefined): LabValueStatus {
  if (status === 'abnormal' || status === 'borderline') return status;
  return 'normal';
}

function normalizeGroupValue(raw: Record<string, unknown>): GroupLabValue {
  const value = String(raw.value ?? '');
  const unit = String(raw.unit ?? '');
  const originalValue = String(raw.originalValue ?? '');

  if (value && unit) {
    return {
      name: String(raw.name ?? 'Unknown'),
      fullName: raw.fullName ? String(raw.fullName) : undefined,
      value,
      unit,
      referenceRange: String(raw.referenceRange ?? ''),
      status: normalizeStatus(String(raw.status)),
    };
  }

  const parts = originalValue.trim().split(/\s+/);
  const parsedUnit = parts.length > 1 ? parts.slice(1).join(' ') : '';

  return {
    name: String(raw.name ?? 'Unknown'),
    fullName: raw.fullName ? String(raw.fullName) : undefined,
    value: parts[0] ?? originalValue,
    unit: parsedUnit,
    referenceRange: String(raw.referenceRange ?? ''),
    status: normalizeStatus(String(raw.status)),
  };
}

function normalizeGroup(raw: Record<string, unknown>): BodySystemGroup {
  const values = ((raw.values as Record<string, unknown>[]) || []).map(normalizeGroupValue);
  const status = normalizeStatus(String(raw.status)) || worstStatus(values);

  return {
    system: String(raw.system ?? 'Other Results'),
    icon: String(raw.icon ?? '📋'),
    status: values.length > 0 ? worstStatus(values) : status,
    topline: String(raw.topline ?? raw.summary ?? ''),
    analogy: raw.analogy ? String(raw.analogy) : undefined,
    values: values.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
  };
}

export function sortGroups(groups: BodySystemGroup[]): BodySystemGroup[] {
  return [...groups].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;

    const orderA = BODY_SYSTEMS.find((s) => s.name === a.system)?.order ?? 50;
    const orderB = BODY_SYSTEMS.find((s) => s.name === b.system)?.order ?? 50;
    return orderA - orderB;
  });
}

function matchSystemIcon(systemName: string): string {
  return BODY_SYSTEMS.find((s) => s.name === systemName)?.icon ?? '📋';
}

function parseLegacyValue(originalValue: string): { value: string; unit: string } {
  const parts = originalValue.trim().split(/\s+/);
  if (parts.length <= 1) return { value: originalValue, unit: '' };
  return { value: parts[0], unit: parts.slice(1).join(' ') };
}

function legacyValuesToGroups(values: LegacyLabValue[]): BodySystemGroup[] {
  const legacyGroups = groupLabValuesBySystem(
    values.map((v) => ({
      name: v.name,
      originalValue: v.originalValue,
      referenceRange: v.referenceRange,
      status: v.status,
      explanation: v.explanation ?? '',
      analogy: v.analogy,
    }))
  );

  return legacyGroups.map((g) => ({
    system: g.name,
    icon: g.icon,
    status: g.status,
    topline: g.summary,
    analogy: g.values.find((v) => v.analogy)?.analogy,
    values: g.values.map((v) => {
      const { value, unit } = parseLegacyValue(v.originalValue);
      return {
        name: v.name.split('(')[0].trim(),
        fullName: v.name.includes('(') ? v.name : undefined,
        value,
        unit,
        referenceRange: v.referenceRange,
        status: v.status,
      };
    }),
  }));
}

export function countFlaggedValues(result: AnalysisResult): {
  abnormalCount: number;
  borderlineCount: number;
  normalCount: number;
  flaggedCount: number;
} {
  return countValueStatuses(result);
}

export function countValueStatuses(result: AnalysisResult): {
  abnormalCount: number;
  borderlineCount: number;
  normalCount: number;
  flaggedCount: number;
} {
  let abnormalCount = 0;
  let borderlineCount = 0;
  let normalCount = 0;

  for (const group of result.groups) {
    for (const v of group.values) {
      if (v.status === 'abnormal') abnormalCount++;
      else if (v.status === 'borderline') borderlineCount++;
      else normalCount++;
    }
  }

  return { abnormalCount, borderlineCount, normalCount, flaggedCount: abnormalCount + borderlineCount };
}

export function normalizeAnalysisResult(raw: Record<string, unknown>): AnalysisResult {
  let groups: BodySystemGroup[] = [];

  if (Array.isArray(raw.groups) && raw.groups.length > 0) {
    groups = sortGroups((raw.groups as Record<string, unknown>[]).map(normalizeGroup));
  } else if (Array.isArray(raw.values) && raw.values.length > 0) {
    groups = sortGroups(legacyValuesToGroups(raw.values as LegacyLabValue[]));
  }

  const urgency = raw.urgency
    ? (String(raw.urgency) as AnalysisUrgency)
    : deriveUrgency(groups);

  const validUrgency: AnalysisUrgency =
    urgency === 'action_needed' || urgency === 'worth_monitoring' || urgency === 'all_clear'
      ? urgency
      : deriveUrgency(groups);

  return {
    summary: String(raw.summary ?? ''),
    urgency: validUrgency,
    groups: groups.map((g) => ({
      ...g,
      icon: g.icon || matchSystemIcon(g.system),
    })),
    questions: Array.isArray(raw.questions)
      ? (raw.questions as AnalysisResult['questions'])
      : [],
    disclaimer: String(raw.disclaimer ?? DEFAULT_DISCLAIMER),
    sourceUrl: raw.sourceUrl ? String(raw.sourceUrl) : undefined,
    sourceTitle: raw.sourceTitle ? String(raw.sourceTitle) : undefined,
    analyzedAt: raw.analyzedAt ? String(raw.analyzedAt) : undefined,
  };
}

export function getFirstFlaggedGroupIndex(groups: BodySystemGroup[]): number {
  const abnormalIdx = groups.findIndex((g) => g.status === 'abnormal');
  if (abnormalIdx >= 0) return abnormalIdx;
  return groups.findIndex((g) => g.status === 'borderline');
}
