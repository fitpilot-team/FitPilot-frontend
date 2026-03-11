import type { ClientMetricHistory } from './types';

export const MISSING_METRIC_DISPLAY = '-';

export const SNAPSHOT_FIELDS = [
  'weight_kg',
  'height_cm',
  'body_fat_pct',
  'muscle_mass_kg',
  'visceral_fat',
  'water_pct',
  'waist_cm',
  'hip_cm',
  'chest_cm',
  'arm_left_cm',
  'arm_right_cm',
  'thigh_left_cm',
  'thigh_right_cm',
  'calf_left_cm',
  'calf_right_cm',
] as const;

type SnapshotField = (typeof SNAPSHOT_FIELDS)[number];

export type ClientMetricSnapshot = Record<SnapshotField, number | null> & {
  waist_to_hip_ratio: number | null;
};

const parseDateRank = (value: string | null | undefined): number => {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
};

const parseIdRank = (value: string | number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
};

const parseMetricNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const sortMetricsForSnapshot = (
  metrics: ClientMetricHistory[],
): ClientMetricHistory[] => {
  return [...metrics].sort((a, b) => {
    const loggedAtDiff = parseDateRank(b.logged_at) - parseDateRank(a.logged_at);
    if (loggedAtDiff !== 0) {
      return loggedAtDiff;
    }

    const dateDiff = parseDateRank(b.date) - parseDateRank(a.date);
    if (dateDiff !== 0) {
      return dateDiff;
    }

    return parseIdRank(b.id) - parseIdRank(a.id);
  });
};

export const buildClientMetricSnapshot = (
  metrics: ClientMetricHistory[] | null | undefined,
): ClientMetricSnapshot => {
  const orderedMetrics = sortMetricsForSnapshot(metrics ?? []);

  const snapshot = SNAPSHOT_FIELDS.reduce(
    (accumulator, field) => {
      accumulator[field] = null;
      return accumulator;
    },
    {} as Record<SnapshotField, number | null>,
  );

  for (const metric of orderedMetrics) {
    for (const field of SNAPSHOT_FIELDS) {
      if (snapshot[field] !== null) {
        continue;
      }

      const parsedValue = parseMetricNumber(metric[field]);
      if (parsedValue !== null) {
        snapshot[field] = parsedValue;
      }
    }
  }

  const ratio =
    snapshot.waist_cm !== null &&
    snapshot.hip_cm !== null &&
    snapshot.hip_cm > 0
      ? Number((snapshot.waist_cm / snapshot.hip_cm).toFixed(2))
      : null;

  return {
    ...snapshot,
    waist_to_hip_ratio: ratio,
  };
};

export const displayMetricValue = (
  value: number | null | undefined,
  missingValue = MISSING_METRIC_DISPLAY,
): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return missingValue;
  }

  return `${value}`;
};
