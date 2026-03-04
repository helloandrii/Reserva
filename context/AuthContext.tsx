import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { auth } from '@/firebase/auth';
import { db } from '@/firebase/firestore';
import type { UserProfile } from '@/src/types';
import { logger } from '@/src/utils/logger';

WebBrowser.maybeCompleteAuthSession();

const PROFILE_CACHE_KEY = 'reserva_user_profile';
const ONBOARDING_KEY = 'reserva_onboarding_complete';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    promptGoogleSignIn: () => Promise<void>;
    signOut: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
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

    const [, response, promptAsync] = Google.useAuthRequest({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    });

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

    // Handle Google OAuth response
    useEffect(() => {
        if (response?.type !== 'success') return;
        const idToken = response.params?.id_token;
        const accessToken = response.params?.access_token ?? response.authentication?.accessToken;
        if (!idToken && !accessToken) {
            logger.warn('Auth', 'Google response success but no token found');
            return;
        }
        const credential = GoogleAuthProvider.credential(idToken ?? null, accessToken ?? null);
        signInWithCredential(auth, credential).catch((e) => logger.error('Auth', 'signInWithCredential failed', e));
    }, [response]);

    // Listen to Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await syncUserProfile(firebaseUser);
                await completeOnboarding(); // auto-mark onboarding done on sign-in
            } else {
                setProfile(null);
                await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Sync / create Firestore user document
    async function syncUserProfile(firebaseUser: User) {
        try {
            const ref = doc(db, 'users', firebaseUser.uid);
            const snap = await getDoc(ref);
            let resolvedProfile: UserProfile;

            if (!snap.exists()) {
                resolvedProfile = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName ?? 'User',
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    phoneNumber: null,
                    usedServicesCount: 0,
                    savedServiceIds: [],
                    createdAt: null,
                    updatedAt: null,
                };
                await setDoc(ref, { ...resolvedProfile, createdAt: serverTimestamp() });
            } else {
                const data = snap.data();
                resolvedProfile = {
                    uid: firebaseUser.uid,
                    displayName: data.displayName ?? firebaseUser.displayName ?? 'User',
                    email: data.email ?? firebaseUser.email,
                    photoURL: data.photoURL ?? firebaseUser.photoURL,
                    phoneNumber: data.phoneNumber ?? null,
                    usedServicesCount: data.usedServicesCount ?? 0,
                    savedServiceIds: data.savedServiceIds ?? [],
                    createdAt: data.createdAt ?? null,
                    updatedAt: data.updatedAt ?? null,
                };
            }

            setProfile(resolvedProfile);
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolvedProfile));
        } catch (e) {
            logger.error('Auth', 'Failed to sync user profile', e);
        }
    }

    const promptGoogleSignIn = async () => {
        await promptAsync();
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
        setUser(null);
        setProfile(null);
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, promptGoogleSignIn, signOut, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
}
