import { describe, expect, it } from 'vitest';
import type { ClientMetricHistory } from './types';
import {
  buildClientMetricSnapshot,
  displayMetricValue,
  sortMetricsForSnapshot,
} from './metricSnapshot';

const metricFactory = (
  partial: Partial<ClientMetricHistory>,
): ClientMetricHistory => ({
  id: '1',
  user_id: 8,
  date: '2026-03-01',
  logged_at: '2026-03-01T10:00:00.000Z',
  weight_kg: '',
  height_cm: '',
  body_fat_pct: '',
  muscle_mass_kg: '',
  visceral_fat: null,
  water_pct: null,
  waist_cm: null,
  hip_cm: null,
  chest_cm: null,
  arm_left_cm: null,
  arm_right_cm: null,
  thigh_left_cm: null,
  thigh_right_cm: null,
  calf_left_cm: null,
  calf_right_cm: null,
  notes: '',
  recorded_by_user_id: null,
  ...partial,
});

describe('buildClientMetricSnapshot', () => {
  it('takes waist and hip from older records when latest row is partial', () => {
    const metrics = [
      metricFactory({
        id: '30',
        logged_at: '2026-03-10T10:00:00.000Z',
        date: '2026-03-10',
        chest_cm: '104',
      }),
      metricFactory({
        id: '29',
        logged_at: '2026-03-09T10:00:00.000Z',
        date: '2026-03-09',
        waist_cm: '102',
        hip_cm: '110',
      }),
    ];

    const snapshot = buildClientMetricSnapshot(metrics);

    expect(snapshot.chest_cm).toBe(104);
    expect(snapshot.waist_cm).toBe(102);
    expect(snapshot.hip_cm).toBe(110);
    expect(snapshot.waist_to_hip_ratio).toBe(0.93);
  });

  it('respects tie-break order: logged_at desc, then date desc, then id desc', () => {
    const metrics = [
      metricFactory({
        id: '25',
        logged_at: '2026-03-01T10:00:00.000Z',
        date: '2026-03-01',
        chest_cm: '100',
      }),
      metricFactory({
        id: '26',
        logged_at: '2026-03-01T10:00:00.000Z',
        date: '2026-03-01',
        chest_cm: '101',
      }),
      metricFactory({
        id: '27',
        logged_at: '2026-03-01T11:00:00.000Z',
        date: '2026-03-01',
        chest_cm: '102',
      }),
    ];

    const ordered = sortMetricsForSnapshot(metrics);
    const snapshot = buildClientMetricSnapshot(metrics);

    expect(ordered.map((metric) => metric.id)).toEqual(['27', '26', '25']);
    expect(snapshot.chest_cm).toBe(102);
  });

  it('returns null waist-to-hip ratio when data is missing or invalid', () => {
    const missingHip = buildClientMetricSnapshot([
      metricFactory({
        id: '41',
        logged_at: '2026-03-10T10:00:00.000Z',
        waist_cm: '88',
      }),
    ]);
    expect(missingHip.waist_to_hip_ratio).toBeNull();

    const zeroHip = buildClientMetricSnapshot([
      metricFactory({
        id: '42',
        logged_at: '2026-03-10T10:00:00.000Z',
        waist_cm: '88',
        hip_cm: '0',
      }),
    ]);
    expect(zeroHip.waist_to_hip_ratio).toBeNull();
    expect(displayMetricValue(undefined)).toBe('-');
  });
});
