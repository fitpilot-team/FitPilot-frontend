import { createClient } from '@/api/api.client';
import type {
  AllergenCatalogItem,
  ClientOnboardingPayload,
  GoalCatalogItem,
} from './types';

const client = createClient({ baseURL: import.meta.env.VITE_NUTRITION_API_URL });

export const getGoalCatalog = async (): Promise<GoalCatalogItem[]> => {
  const { data } = await client.get<GoalCatalogItem[]>('/v1/goals');
  return data;
};

export const getAllergenCatalog = async (): Promise<AllergenCatalogItem[]> => {
  const { data } = await client.get<AllergenCatalogItem[]>('/v1/allergens');
  return data;
};

export const submitClientIntake = async (
  payload: ClientOnboardingPayload,
): Promise<{ success: boolean }> => {
  const { data } = await client.post<{ success: boolean }>(
    '/v1/professional-clients/onboarding',
    payload,
  );

  return data;
};
