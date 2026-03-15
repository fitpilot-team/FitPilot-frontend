import { describe, expect, it } from 'vitest';
import type { User } from '@/types/api';
import {
  resolveProfessionalUserSnapshot,
  shouldFetchProfessionalUser,
  shouldRequireSubscriptionSelection,
} from './professionalSession';

describe('professionalSession helpers', () => {
  it('does not expose stored user data before the current session has been resolved', () => {
    const storedUser = {
      id: 7,
      role: 'PROFESSIONAL',
      has_active_subscription: false,
    } as User;

    expect(
      resolveProfessionalUserSnapshot({
        authUser: null,
        storedUserData: storedUser,
        hasResolvedSessionUser: false,
      }),
    ).toBeNull();
  });

  it('uses the stored user snapshot after the current session has been resolved', () => {
    const storedUser = {
      id: 7,
      role: 'PROFESSIONAL',
      has_active_subscription: false,
    } as User;

    expect(
      resolveProfessionalUserSnapshot({
        authUser: null,
        storedUserData: storedUser,
        hasResolvedSessionUser: true,
      }),
    ).toEqual(storedUser);
  });

  it('forces a fresh user fetch while the current token has not been resolved yet', () => {
    expect(
      shouldFetchProfessionalUser({
        authUser: {
          id: 7,
        } as User,
        decodedUserId: 7,
        forceRefresh: false,
        hasResolvedSessionUser: false,
      }),
    ).toBe(true);
  });

  it('skips the fetch only when the current token already has a matching fresh snapshot', () => {
    expect(
      shouldFetchProfessionalUser({
        authUser: {
          id: 7,
        } as User,
        decodedUserId: 7,
        forceRefresh: false,
        hasResolvedSessionUser: true,
      }),
    ).toBe(false);
  });

  it('does not require subscription selection before the current session has been resolved', () => {
    expect(
      shouldRequireSubscriptionSelection({
        user: {
          id: 7,
          role: 'PROFESSIONAL',
          has_active_subscription: false,
        } as User,
        hasResolvedSessionUser: false,
      }),
    ).toBe(false);
  });

  it('requires subscription selection for resolved professional users without active access', () => {
    expect(
      shouldRequireSubscriptionSelection({
        user: {
          id: 7,
          role: 'PROFESSIONAL',
          has_active_subscription: false,
        } as User,
        hasResolvedSessionUser: true,
      }),
    ).toBe(true);
  });
});
