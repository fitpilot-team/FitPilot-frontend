import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllergenCatalog,
  getGoalCatalog,
  submitClientIntake,
} from './api';
import type {
  AllergenCatalogItem,
  ClientOnboardingPayload,
  GoalCatalogItem,
} from './types';

export const useGoalCatalog = () => {
  return useQuery<GoalCatalogItem[], Error>({
    queryKey: ['client-intake', 'goals'],
    queryFn: getGoalCatalog,
    staleTime: 1000 * 60 * 60 * 12,
  });
};

export const useAllergenCatalog = () => {
  return useQuery<AllergenCatalogItem[], Error>({
    queryKey: ['client-intake', 'allergens'],
    queryFn: getAllergenCatalog,
    staleTime: 1000 * 60 * 60 * 12,
  });
};

export const useSubmitClientIntake = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientOnboardingPayload) => submitClientIntake(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['professional-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-history'] });
      queryClient.invalidateQueries({
        queryKey: ['client-history', variables.user_id],
      });
    },
  });
};

