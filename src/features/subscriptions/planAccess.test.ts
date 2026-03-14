import { describe, expect, it } from 'vitest';
import { resolveSubscriptionPlanAction, resolveSubscriptionState } from './planAccess';
import type { User } from '@/types/api';

describe('resolveSubscriptionState', () => {
  it('returns active when subscription access is currently valid', () => {
    const user = {
      has_active_subscription: true,
      current_subscription: {
        name: 'FitPilot Ultimate',
        cancel_at_period_end: false,
        current_period_end: '2026-03-20T12:00:00.000Z',
      },
    } as User;

    expect(resolveSubscriptionState(user)).toMatchObject({
      status: 'active',
      hasSubscriptionAccess: true,
      isCancellationScheduled: false,
      accessEndsAt: '2026-03-20T12:00:00.000Z',
    });
  });

  it('returns scheduled_cancelation when access is active but ends at period close', () => {
    const user = {
      has_active_subscription: true,
      current_subscription: {
        name: 'FitPilot Ultimate',
        cancel_at_period_end: true,
        current_period_end: '2026-03-20T12:00:00.000Z',
      },
    } as User;

    expect(resolveSubscriptionState(user)).toMatchObject({
      status: 'scheduled_cancelation',
      hasSubscriptionAccess: true,
      isCancellationScheduled: true,
    });
  });

  it('returns expired when the last known plan exists but access is no longer valid', () => {
    const user = {
      has_active_subscription: false,
      current_subscription: {
        name: 'FitPilot Ultimate',
        cancel_at_period_end: false,
        ended_at: '2026-03-14T16:46:34.000Z',
      },
    } as User;

    expect(resolveSubscriptionState(user)).toMatchObject({
      status: 'expired',
      hasSubscriptionAccess: false,
      accessEndsAt: '2026-03-14T16:46:34.000Z',
    });
  });

  it('returns none when there is no subscription history', () => {
    expect(resolveSubscriptionState(null)).toMatchObject({
      status: 'none',
      hasSubscriptionAccess: false,
      accessEndsAt: null,
    });
  });
});

describe('resolveSubscriptionPlanAction', () => {
  it('returns already_active for the current plan when access is active', () => {
    const user = {
      has_active_subscription: true,
      current_subscription: {
        plan_id: 4,
        name: 'FitPilot Ultimate',
        cancel_at_period_end: false,
      },
    } as User;

    expect(
      resolveSubscriptionPlanAction({ id: 4, name: 'FitPilot Ultimate' }, user),
    ).toBe('already_active');
  });

  it('returns resume for the current plan when cancellation is scheduled', () => {
    const user = {
      has_active_subscription: true,
      current_subscription: {
        plan_id: 4,
        name: 'FitPilot Ultimate',
        cancel_at_period_end: true,
      },
    } as User;

    expect(
      resolveSubscriptionPlanAction({ id: 4, name: 'FitPilot Ultimate' }, user),
    ).toBe('resume');
  });

  it('returns portal when the user picks a different plan while access is active', () => {
    const user = {
      has_active_subscription: true,
      current_subscription: {
        plan_id: 4,
        name: 'FitPilot Ultimate',
        cancel_at_period_end: false,
      },
    } as User;

    expect(
      resolveSubscriptionPlanAction({ id: 3, name: 'Training Pro' }, user),
    ).toBe('portal');
  });

  it('returns checkout when the current plan is expired', () => {
    const user = {
      has_active_subscription: false,
      current_subscription: {
        plan_id: 4,
        name: 'FitPilot Ultimate',
        cancel_at_period_end: false,
        ended_at: '2026-03-14T16:46:34.000Z',
      },
    } as User;

    expect(
      resolveSubscriptionPlanAction({ id: 4, name: 'FitPilot Ultimate' }, user),
    ).toBe('checkout');
  });
});
