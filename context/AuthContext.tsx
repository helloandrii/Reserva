import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

import type { UserProfile } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { supabase } from '@/utils/supabase';

const PROFILE_CACHE_KEY = 'reserva_user_profile';
const ONBOARDING_KEY = 'reserva_onboarding_complete';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    onboardingComplete: boolean;
    onboardingChecked: boolean;
    signOut: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    skipAuthDev: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [onboardingChecked, setOnboardingChecked] = useState(false);

    // Load onboarding flag from AsyncStorage on mount
    useEffect(() => {
        const DEV_ALWAYS_SHOW_ONBOARDING = true; // TODO: set false before release
        (async () => {
            if (DEV_ALWAYS_SHOW_ONBOARDING) {
                // Clear flag each session so onboarding always shows (dev mode)
                await AsyncStorage.removeItem(ONBOARDING_KEY);
                setOnboardingComplete(false);
                setOnboardingChecked(true);
                return;
            }
            const val = await AsyncStorage.getItem(ONBOARDING_KEY);
            setOnboardingComplete(val === 'true');
            setOnboardingChecked(true);
        })();
    }, []);

    // Load cached profile on startup for instant display
    useEffect(() => {
        AsyncStorage.getItem(PROFILE_CACHE_KEY)
            .then((raw) => {
                if (raw) {
                    try { setProfile(JSON.parse(raw)); } catch { /* ignore */ }
                }
            })
            .catch((e) => logger.warn('Auth', 'Cache load failed', e));
    }, []);

    // Listen to Supabase auth state
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function handleSession(supabaseUser: User | null) {
        setUser(supabaseUser);
        
        if (supabaseUser) {
            await syncUserProfile(supabaseUser);
            await completeOnboarding(); // auto-mark onboarding done on sign-in
        } else {
            setProfile(null);
            await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
        }
        setLoading(false);
    }

    // Build the user profile out of Supabase User Metadata
    async function syncUserProfile(supabaseUser: User) {
        try {
            // Check if there is a pending intended role from signup
            const intendedRole = await AsyncStorage.getItem('reserva_intended_role');
            let role = supabaseUser.user_metadata?.role;
            
            // If they just signed up and we have an intended role, save it to their metadata
            if (intendedRole && !role) {
                role = intendedRole === 'business' ? 'business' : 'user';
                await supabase.auth.updateUser({
                    data: { role }
                });
                await AsyncStorage.removeItem('reserva_intended_role');
            } else if (!role) {
                // Fallback
                role = 'user';
            }

            const resolvedProfile: UserProfile = {
                uid: supabaseUser.id, // mapping Supabase ID to Firebase UID field to maintain compatibility
                displayName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
                email: supabaseUser.email || null,
                photoURL: supabaseUser.user_metadata?.avatar_url || null,
                phoneNumber: supabaseUser.phone || null,
                role: role,
                usedServicesCount: 0, // In Supabase, you might compute this separately or store in a public users table
                savedServiceIds: [],
                createdAt: supabaseUser.created_at ?? null,
                updatedAt: supabaseUser.updated_at ?? null,
            };

            setProfile(resolvedProfile);
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolvedProfile));
        } catch (e) {
            logger.error('Auth', 'Failed to sync user profile', e);
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
        await AsyncStorage.removeItem(ONBOARDING_KEY);
        setUser(null);
        setProfile(null);
        setOnboardingComplete(false);
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        setOnboardingComplete(true); // update state immediately so guard reacts
    };

    const skipAuthDev = async () => {
        const intendedRole = await AsyncStorage.getItem('reserva_intended_role');
        const mockProfile: UserProfile = {
            uid: 'dev-mock-uid',
            displayName: 'Dev User',
            email: 'dev@reserva.app',
            photoURL: null,
            phoneNumber: null,
            role: intendedRole === 'business' ? 'business' : 'user',
            usedServicesCount: 0,
            savedServiceIds: [],
            createdAt: null,
            updatedAt: null,
        };
        setProfile(mockProfile);
        await completeOnboarding();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, onboardingComplete, onboardingChecked, signOut, completeOnboarding, skipAuthDev }}>
            {children}
        </AuthContext.Provider>
    );
}
