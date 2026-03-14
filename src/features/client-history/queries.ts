
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClientHistory,
    getMeasurementDetail,
    saveClientMetric,
    saveClientHealthMetric,
    getClientMetrics,
    getClientHealthMetrics,
} from './api';
import { IHistoryClient, MeasurementDetailResponse } from './types';

export const useClientHistory = (clientId?: number | string, page: number = 1, limit: number = 10) => {
    return useQuery<IHistoryClient, Error>({
        queryKey: ['client-history', clientId, page, limit],
        queryFn: () => getClientHistory(clientId!, page, limit),
        enabled: !!clientId,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        placeholderData: (previousData) => previousData,
    });
};

export const useSaveClientMetric = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (metricData: any) => saveClientMetric(metricData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-history'] });
            queryClient.invalidateQueries({ queryKey: ['client-metrics'] });
        },
    });
};

export const useMeasurementDetail = (
    measurementId?: number | string,
    enabled: boolean = true,
) => {
    return useQuery<MeasurementDetailResponse, Error>({
        queryKey: ['measurement-detail', measurementId],
        queryFn: () => getMeasurementDetail(measurementId!),
        enabled: enabled && !!measurementId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useSaveClientHealthMetric = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (metricData: any) => saveClientHealthMetric(metricData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-history'] });
            queryClient.invalidateQueries({ queryKey: ['client-health-metrics'] });
        },
    });
};

export const useClientMetricsQuery = (userId?: number | string, page: number = 1, limit: number = 20) => {
    return useQuery<any, Error>({
        queryKey: ['client-metrics', userId, page, limit],
        queryFn: () => getClientMetrics(userId!, page, limit),
        enabled: !!userId,
    });
};

export const useClientHealthMetricsQuery = (userId?: number | string, page: number = 1, limit: number = 20) => {
    return useQuery<any, Error>({
        queryKey: ['client-health-metrics', userId, page, limit],
        queryFn: () => getClientHealthMetrics(userId!, page, limit),
        enabled: !!userId,
    });
};
