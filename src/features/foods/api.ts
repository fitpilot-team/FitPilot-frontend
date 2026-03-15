import { nutritionApi } from "@/api/clients/nutrition.client";
import { IFoodItem } from "./types";

const buildProfessionalParams = (professionalId?: number) => {
    if (!professionalId) {
        return undefined;
    }

    return {
        professionalId,
        professional_id: professionalId,
    };
};

/**
 * Fetches foods belonging to a specific exchange group.
 * Endpoint: /v1/foods/exchange-group/{groupId}
 */
export const getFoodsByExchangeGroup = async (
    groupId: number,
    professionalId?: number,
): Promise<IFoodItem[]> => {
    const { data } = await nutritionApi.get<IFoodItem[]>(`/v1/foods/exchange-group/${groupId}`, {
        params: buildProfessionalParams(professionalId),
    });
    return data;
};

/**
 * Fetches all foods.
 * Endpoint: /v1/foods
 */
export const getFoods = async (professionalId?: number): Promise<IFoodItem[]> => {
    const { data } = await nutritionApi.get<IFoodItem[]>("/v1/foods", {
        params: buildProfessionalParams(professionalId),
    });
    return data;
};
