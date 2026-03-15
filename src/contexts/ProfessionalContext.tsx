import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/newAuthStore';
import { JWTPayload, ProfessionalContextType, User } from '../types/api';
import { getUserRequest } from '../api/auth/auth.api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initializeAuthSession } from '@/api/api.client';
import {
    resolveProfessionalUserSnapshot,
    shouldFetchProfessionalUser,
    shouldRequireSubscriptionSelection,
} from './professionalSession';

const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);

/**
 * Decodes a JWT token without external libraries
 */
const decodeToken = (token: string): JWTPayload | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

export const ProfessionalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user: authUser, setUser, authChecked } = useAuthStore();
    const [professional, setProfessional] = useState<JWTPayload | null>(null);
    const [storedUserData, setStoredUserData] = useLocalStorage<User | null>('user_data', null);
    const [hasResolvedSessionUser, setHasResolvedSessionUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authChecked) return;
        initializeAuthSession(import.meta.env.VITE_NUTRITION_API_URL).catch(() => {
            // Session stays unauthenticated when refresh cookie is missing/expired.
        });
    }, [authChecked]);

    useEffect(() => {
        if (!authChecked) return;

        if (!token) {
            setHasResolvedSessionUser(true);
            return;
        }

        setHasResolvedSessionUser(false);
    }, [authChecked, token]);

    const refreshProfessional = useCallback(async (forceRefresh = false) => {
        if (!authChecked) {
            setIsLoading(true);
            return;
        }

        if (!token) {
            setProfessional(null);
            setStoredUserData(null);
            setHasResolvedSessionUser(true);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const decoded = decodeToken(token);
            setProfessional(decoded);

            if (shouldFetchProfessionalUser({
                forceRefresh,
                authUser,
                decodedUserId: decoded?.sub ?? null,
                hasResolvedSessionUser,
            })) {
                const user = await getUserRequest();
                setUser(user);
            }
        } catch (error) {
            console.error('Failed to fetch user details', error);
            setError(error instanceof Error ? error.message : 'Failed to refresh professional data');
        } finally {
            setHasResolvedSessionUser(true);
            setIsLoading(false);
        }
    }, [authChecked, token, authUser, hasResolvedSessionUser, setUser, setStoredUserData]);

    useEffect(() => {
        if (!authChecked) {
            setIsLoading(true);
            return;
        }

        refreshProfessional();
    }, [token, authChecked]); // Keep this scoped to auth session state changes

    // Sync authUser to localStorage
    useEffect(() => {
        if (authUser) {
            setStoredUserData(authUser);
        }
    }, [authUser, setStoredUserData]);

    const activeUser = resolveProfessionalUserSnapshot({
        authUser,
        storedUserData,
        hasResolvedSessionUser,
    });
    const requiresSubscriptionSelection = shouldRequireSubscriptionSelection({
        user: activeUser,
        hasResolvedSessionUser,
    });

    return (
        <ProfessionalContext.Provider
            value={{
                professional,
                userData: activeUser,
                isLoading: isLoading,
                error,
                requiresSubscriptionSelection,
                refreshProfessional,
            }}
        >
            {children}
        </ProfessionalContext.Provider>
    );
};

export const useProfessional = () => {
    const context = useContext(ProfessionalContext);
    if (context === undefined) {
        throw new Error('useProfessional must be used within a ProfessionalProvider');
    }
    return context;
};
