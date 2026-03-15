import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    createMenu,
    deleteMenu,
    generateMenuAI,
    getDraftById,
    getDrafts,
    getMenuById,
    getMenuPoolCalendarSummary,
    getMenuPoolSummary,
    getReusableMenuSummary,
    saveMenuDraft,
    swapDailyMenu,
    updateMenu,
    updateMenuDraft,
} from './api';

const resolveErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'object' && error !== null) {
        const responseData = (error as {
            response?: {
                data?: {
                    message?: string | string[];
                };
            };
        }).response?.data;

        const responseMessage = responseData?.message;
        if (Array.isArray(responseMessage)) {
            const message = responseMessage.filter(Boolean).join(', ');
            if (message.trim()) {
                return message;
            }
        }

        if (typeof responseMessage === 'string' && responseMessage.trim()) {
            return responseMessage;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
            return message;
        }
    }

    return fallback;
};

export const useGetReusableMenuSummary = (professionalId?: number, clientId?: number) => {
    return useQuery({
        queryKey: ['menus-reusable-summary', professionalId, clientId],
        queryFn: () => getReusableMenuSummary(professionalId!, clientId),
        enabled: !!professionalId,
    });
};

export const useGetDrafts = (professionalId?: number, clientId?: number | null) => {
    return useQuery({
        queryKey: ['menus-drafts', professionalId, clientId],
        queryFn: () => getDrafts(professionalId!, clientId),
        enabled: !!professionalId,
    });
};

export const useGetDraftById = (id?: string | null) => {
    return useQuery({
        queryKey: ['menu-draft', id],
        queryFn: () => getDraftById(id!),
        enabled: !!id,
    });
};

export const useGetMenuById = (id: number) => {
    return useQuery({
        queryKey: ['menus', id],
        queryFn: () => getMenuById(id),
        enabled: !!id,
    });
};

export const useCreateMenu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createMenu,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
            queryClient.invalidateQueries({ queryKey: ['menus-reusable-summary'] });
            queryClient.invalidateQueries({ queryKey: ['menus-pool-summary'] });
            queryClient.invalidateQueries({ queryKey: ['menus-pool-calendar-summary'] });
            toast.success('Menu creado correctamente');
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, 'Error al crear el menu'));
        },
    });
};

export const useUpdateMenu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateMenu(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
            queryClient.invalidateQueries({ queryKey: ['menus-reusable-summary'] });
            queryClient.invalidateQueries({ queryKey: ['menus-pool-summary'] });
            queryClient.invalidateQueries({ queryKey: ['menus-pool-calendar-summary'] });
            toast.success('Menu actualizado correctamente');
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, 'Error al actualizar el menu'));
        },
    });
};

export const useDeleteMenu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMenu,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
            queryClient.invalidateQueries({ queryKey: ['menus-reusable-summary'] });
            queryClient.invalidateQueries({ queryKey: ['menus-pool-summary'] });
            queryClient.invalidateQueries({ queryKey: ['menus-pool-calendar-summary'] });
            toast.success('Menu eliminado correctamente');
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, 'Error al eliminar el menu'));
        },
    });
};

export const useSwapDailyMenu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: swapDailyMenu,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['menus'] });
            await queryClient.invalidateQueries({ queryKey: ['menus-pool-summary'] });
            await queryClient.invalidateQueries({ queryKey: ['menus-pool-calendar-summary'] });
        },
    });
};

export const useGetMenuPoolSummary = (professionalId?: number, clientId?: number, date?: string) => {
    return useQuery({
        queryKey: ['menus-pool-summary', professionalId, clientId, date],
        queryFn: () => getMenuPoolSummary(professionalId!, clientId, date),
        enabled: !!professionalId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useGetMenuPoolCalendarSummary = (professionalId?: number, clientId?: number, date?: string) => {
    return useQuery({
        queryKey: ['menus-pool-calendar-summary', professionalId, clientId, date],
        queryFn: () => getMenuPoolCalendarSummary(professionalId!, clientId, date),
        enabled: !!professionalId,
    });
};

export const useGenerateMenuAI = () => {
    return useMutation({
        mutationFn: generateMenuAI,
        onSuccess: () => {
            toast.success('Solicitud enviada para generar menu con IA');
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, 'Error al solicitar generacion con IA'));
        },
    });
};

export const useSaveMenuDraft = () => {
    return useMutation({
        mutationFn: saveMenuDraft,
        onError: () => {
            console.error('Error auto-saving draft');
        },
    });
};

export const useUpdateMenuDraft = () => {
    return useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: any }) => updateMenuDraft(id, data),
        onError: () => {
            console.error('Error updating draft');
        },
    });
};
