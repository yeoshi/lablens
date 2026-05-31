import type { LabValueStatus } from './types';

export interface LegacyGroupInput {
  name: string;
  originalValue: string;
  referenceRange: string;
  status: LabValueStatus;
  explanation: string;
  analogy?: string;
}

export interface BodySystemDefinition {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  order: number;
}

export interface LegacyBodySystemGroup {
  id: string;
  name: string;
  icon: string;
  status: LabValueStatus;
  values: LegacyGroupInput[];
  abnormalCount: number;
  borderlineCount: number;
  summary: string;
}

export const BODY_SYSTEMS: BodySystemDefinition[] = [
  {
    id: 'liver',
    name: 'Liver Health',
    icon: '🫁',
    keywords: [
      'alt',
      'ast',
      'alp',
      'bilirubin',
      'albumin',
      'sgpt',
      'sgot',
      'alanine',
      'aspartate',
      'alkaline phosphatase',
      'liver',
    ],
    order: 1,
  },
  {
    id: 'blood',
    name: 'Blood Count',
    icon: '🩸',
    keywords: [
      'hemoglobin',
      'wbc',
      'white blood',
      'rbc',
      'red blood',
      'platelet',
      'hematocrit',
      'mcv',
      'mch',
      'mchc',
      'cbc',
      'neutrophil',
      'lymphocyte',
    ],
    order: 2,
  },
  {
    id: 'cholesterol',
    name: 'Cholesterol & Heart',
    icon: '💛',
    keywords: ['cholesterol', 'hdl', 'ldl', 'triglyceride', 'lipid', 'vldl'],
    order: 3,
  },
  {
    id: 'kidney',
    name: 'Kidney Function',
    icon: '🦴',
    keywords: ['creatinine', 'bun', 'egfr', 'urea', 'gfr', 'kidney'],
    order: 4,
  },
  {
    id: 'blood-sugar',
    name: 'Blood Sugar',
    icon: '🍬',
    keywords: ['glucose', 'hba1c', 'a1c', 'fasting blood sugar', 'blood sugar'],
    order: 5,
  },
  {
    id: 'thyroid',
    name: 'Thyroid',
    icon: '🦋',
    keywords: ['tsh', 't3', 't4', 'thyroid'],
    order: 6,
  },
  {
    id: 'other',
    name: 'Other Results',
    icon: '📋',
    keywords: [],
    order: 99,
  },
];

function matchSystem(testName: string): BodySystemDefinition {
  const lower = testName.toLowerCase();
  for (const system of BODY_SYSTEMS) {
    if (system.id === 'other') continue;
    if (system.keywords.some((kw) => lower.includes(kw))) {
      return system;
    }
  }
  return BODY_SYSTEMS.find((s) => s.id === 'other')!;
}

function worstStatus(values: LegacyGroupInput[]): LabValueStatus {
  if (values.some((v) => v.status === 'abnormal')) return 'abnormal';
  if (values.some((v) => v.status === 'borderline')) return 'borderline';
  return 'normal';
}

function formatTestNames(values: LegacyGroupInput[]): string {
  return values.map((v) => v.name.split('(')[0].trim()).join(', ');
}

function buildGroupSummary(group: Omit<LegacyBodySystemGroup, 'summary'>): string {
  const { name, status, values, abnormalCount, borderlineCount } = group;
  const flagged = values.filter((v) => v.status !== 'normal');
  const flaggedNames = formatTestNames(flagged);

  if (status === 'normal') {
    return `Your ${name.toLowerCase()} looks healthy — all ${values.length} value${values.length !== 1 ? 's are' : ' is'} within the normal range.`;
  }

  if (status === 'abnormal') {
    return `Your ${name.toLowerCase()} needs attention — ${abnormalCount} value${abnormalCount !== 1 ? 's are' : ' is'} outside the normal range${flaggedNames ? ` (${flaggedNames})` : ''}.`;
  }

  return `Your ${name.toLowerCase()} is mostly okay, but ${borderlineCount} borderline value${borderlineCount !== 1 ? 's' : ''} worth monitoring${flaggedNames ? `: ${flaggedNames}` : ''}.`;
}

const STATUS_ORDER: Record<LabValueStatus, number> = {
  abnormal: 0,
  borderline: 1,
  normal: 2,
};

export function groupLabValuesBySystem(values: LegacyGroupInput[]): LegacyBodySystemGroup[] {
  const buckets = new Map<string, LegacyBodySystemGroup>();

  for (const value of values) {
    const system = matchSystem(value.name);
    const existing = buckets.get(system.id);

    if (existing) {
      existing.values.push(value);
    } else {
      buckets.set(system.id, {
        id: system.id,
        name: system.name,
        icon: system.icon,
        status: 'normal',
        values: [value],
        abnormalCount: 0,
        borderlineCount: 0,
        summary: '',
      });
    }
  }

  const groups = Array.from(buckets.values()).map((group) => {
    const abnormalCount = group.values.filter((v) => v.status === 'abnormal').length;
    const borderlineCount = group.values.filter((v) => v.status === 'borderline').length;
    const status = worstStatus(group.values);
    const withCounts = { ...group, abnormalCount, borderlineCount, status };
    return { ...withCounts, summary: buildGroupSummary(withCounts) };
  });

  return groups.sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    const orderA = BODY_SYSTEMS.find((s) => s.id === a.id)?.order ?? 50;
    const orderB = BODY_SYSTEMS.find((s) => s.id === b.id)?.order ?? 50;
    return orderA - orderB;
  });
}
