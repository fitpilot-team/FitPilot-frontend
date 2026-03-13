import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createRecipe,
    deleteRecipe,
    deleteRecipeImage,
    duplicateRecipe,
    getRecipeById,
    getRecipeCatalog,
    updateRecipe,
    uploadRecipeImage,
} from './api';
import type { RecipeDetail, RecipeListItem, RecipeScope, RecipeUpsertInput } from './types';

const recipeCatalogKey = (scope: RecipeScope) => ['recipes', 'catalog', scope] as const;
const recipeDetailKey = (id?: number) => ['recipes', 'detail', id] as const;

export const useRecipeCatalog = (scope: RecipeScope = 'all') => {
    return useQuery<RecipeListItem[], Error>({
        queryKey: recipeCatalogKey(scope),
        queryFn: () => getRecipeCatalog(scope),
    });
};

export const useRecipe = (id?: number) => {
    return useQuery<RecipeDetail, Error>({
        queryKey: recipeDetailKey(id),
        queryFn: () => getRecipeById(id!),
        enabled: Boolean(id),
    });
};

const invalidateRecipes = (queryClient: ReturnType<typeof useQueryClient>, id?: number) => {
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    if (id) {
        queryClient.invalidateQueries({ queryKey: recipeDetailKey(id) });
    }
};

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RecipeUpsertInput) => createRecipe(data),
        onSuccess: (recipe) => {
            invalidateRecipes(queryClient, recipe.id);
        },
    });
};

export const useUpdateRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RecipeUpsertInput }) => updateRecipe(id, data),
        onSuccess: (recipe) => {
            invalidateRecipes(queryClient, recipe.id);
        },
    });
};

export const useDeleteRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteRecipe(id),
        onSuccess: () => {
            invalidateRecipes(queryClient);
        },
    });
};

export const useDuplicateRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => duplicateRecipe(id),
        onSuccess: (recipe) => {
            invalidateRecipes(queryClient, recipe.id);
        },
    });
};

export const useUploadRecipeImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, imageBlob }: { id: number; imageBlob: Blob }) => uploadRecipeImage(id, imageBlob),
        onSuccess: (recipe) => {
            invalidateRecipes(queryClient, recipe.id);
        },
    });
};

export const useDeleteRecipeImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteRecipeImage(id),
        onSuccess: (recipe) => {
            invalidateRecipes(queryClient, recipe.id);
        },
    });
};
