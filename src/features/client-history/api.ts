
import { createClient } from '@/api/api.client';
import { IHistoryClient, MeasurementDetailResponse } from './types';

const client = createClient({ baseURL: import.meta.env.VITE_NUTRITION_API_URL });

export const getClientHistory = async (clientId: number | string, page: number = 1, limit: number = 10): Promise<IHistoryClient> => {
    const { data } = await client.get<IHistoryClient>(
        `/v1/professional-clients/history-client/${clientId}`,
        {
            params: { page, limit }
        }
    );
    return data;
};

export const saveClientMetric = async (metricData: any): Promise<any> => {
    const { data } = await client.post(
        '/v1/measurements',
        metricData
    );
    return data;
};

export const getMeasurementDetail = async (
    measurementId: number | string,
): Promise<MeasurementDetailResponse> => {
    const { data } = await client.get<MeasurementDetailResponse>(
        `/v1/measurements/${measurementId}`,
    );
    return data;
};

export const saveClientHealthMetric = async (metricData: any): Promise<any> => {
    const { data } = await client.post(
        '/v1/client-health-metrics',
        metricData
    );
    return data;
};

export const getClientMetrics = async (userId: number | string, page: number = 1, limit: number = 20): Promise<any> => {
    const { data } = await client.get<any>(
        `/v1/client-metrics`,
        {
            params: { user_id: userId, page, limit }
        }
    );
    return data;
};

export const getClientHealthMetrics = async (userId: number | string, page: number = 1, limit: number = 20): Promise<any> => {
    const { data } = await client.get<any>(
        `/v1/client-health-metrics`,
        {
            params: { user_id: userId, page, limit }
        }
    );
    return data;
};
