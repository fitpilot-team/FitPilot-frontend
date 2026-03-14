import type { User } from '@/types/api';

type ResolveProfessionalUserSnapshotInput = {
  authUser: User | null | undefined;
  storedUserData: User | null | undefined;
  hasResolvedSessionUser: boolean;
};

type ShouldFetchProfessionalUserInput = {
  authUser: User | null | undefined;
  decodedUserId: number | string | null | undefined;
  forceRefresh: boolean;
  hasResolvedSessionUser: boolean;
};

type ShouldRequireSubscriptionSelectionInput = {
  user: User | null | undefined;
  hasResolvedSessionUser: boolean;
};

export const resolveProfessionalUserSnapshot = ({
  authUser,
  storedUserData,
  hasResolvedSessionUser,
}: ResolveProfessionalUserSnapshotInput): User | null => {
  if (authUser) {
    return authUser;
  }

  return hasResolvedSessionUser ? storedUserData ?? null : null;
};

export const shouldFetchProfessionalUser = ({
  authUser,
  decodedUserId,
  forceRefresh,
  hasResolvedSessionUser,
}: ShouldFetchProfessionalUserInput): boolean => {
  if (forceRefresh || !hasResolvedSessionUser || !authUser) {
    return true;
  }

  if (!decodedUserId) {
    return true;
  }

  return Number(authUser.id) !== Number(decodedUserId);
};

export const shouldRequireSubscriptionSelection = ({
  user,
  hasResolvedSessionUser,
}: ShouldRequireSubscriptionSelectionInput): boolean => {
  if (!hasResolvedSessionUser || !user) {
    return false;
  }

  const hasSubscriptionAccess =
    user.has_active_subscription === true || user.subscription_vigency?.is_vigent === true;

  return String(user.role ?? '').toUpperCase() === 'PROFESSIONAL' && !hasSubscriptionAccess;
};
