import { useQuery } from "@tanstack/react-query";
import { getFoods, getFoodsByExchangeGroup, searchFoods } from "./api";
import { FoodSearchResult, IFoodItem } from "./types";

/**
 * Hook to fetch foods by exchange group.
 */
export const useGetFoodsByExchangeGroup = (groupId?: number) => {
    return useQuery<IFoodItem[], Error>({
        queryKey: ["foods", "exchange-group", groupId],
        queryFn: () => getFoodsByExchangeGroup(groupId!),
        enabled: !!groupId,
    });
};

/**
 * Hook to fetch all foods.
 */
export const useGetFoods = () => {
    return useQuery<IFoodItem[], Error>({
        queryKey: ["foods"],
        queryFn: getFoods,
    });
};

export const useSearchFoods = (
    query: string,
    professionalId?: number,
    limit = 20,
    enabled = true,
) => {
    return useQuery<FoodSearchResult[], Error>({
        queryKey: ["foods", "search", query, professionalId, limit],
        queryFn: () => searchFoods(query, professionalId, limit),
        enabled,
        staleTime: 1000 * 30,
    });
};
