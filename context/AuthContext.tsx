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
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import { auth } from '@/firebase/auth';
import { db } from '@/firebase/firestore';

// Required to dismiss the browser popup after OAuth redirect on native
WebBrowser.maybeCompleteAuthSession();

// ─── AsyncStorage key ─────────────────────────────────────────────────────────
const PROFILE_CACHE_KEY = 'reserva_user_profile';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string | null;
    photoURL: string | null;
}

interface AuthContextValue {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    promptGoogleSignIn: () => Promise<void>;
    signOut: () => Promise<void>;
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

    // expo-auth-session Google provider.
    const [, response, promptAsync] = Google.useAuthRequest({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    });

    // ── Load cached profile on startup so user name appears instantly ──────────
    useEffect(() => {
        AsyncStorage.getItem(PROFILE_CACHE_KEY)
            .then((raw) => {
                if (raw) {
                    try {
                        const cached = JSON.parse(raw) as UserProfile;
                        setProfile(cached);
                    } catch {
                        // ignore corrupt cache
                    }
                }
            })
            .catch(console.error);
    }, []);

    // ── Handle Google OAuth response ───────────────────────────────────────────
    useEffect(() => {
        if (response?.type !== 'success') return;

        const idToken = response.params?.id_token;
        const accessToken =
            response.params?.access_token ?? response.authentication?.accessToken;

        if (!idToken && !accessToken) {
            console.warn('[Auth] Google response succeeded but no id_token or access_token found.');
            return;
        }

        const credential = GoogleAuthProvider.credential(idToken ?? null, accessToken ?? null);
        signInWithCredential(auth, credential).catch(console.error);
    }, [response]);

    // ── Listen to Firebase auth state ─────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                await syncUserProfile(firebaseUser);
            } else {
                setProfile(null);
                await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // ── Sync / create user profile in Firestore and local cache ───────────────
    async function syncUserProfile(firebaseUser: User) {
        try {
            const ref = doc(db, 'users', firebaseUser.uid);
            const snap = await getDoc(ref);

            let resolvedProfile: UserProfile;

            if (!snap.exists()) {
                // First login — create the profile document
                resolvedProfile = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName ?? 'User',
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                };
                await setDoc(ref, { ...resolvedProfile, createdAt: serverTimestamp() });
            } else {
                // Subsequent login — use whatever is stored in Firestore
                const data = snap.data();
                resolvedProfile = {
                    uid: firebaseUser.uid,
                    displayName: data.displayName ?? firebaseUser.displayName ?? 'User',
                    email: data.email ?? firebaseUser.email,
                    photoURL: data.photoURL ?? firebaseUser.photoURL,
                };
            }

            setProfile(resolvedProfile);

            // Persist locally so the name is available immediately on next open
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolvedProfile));
        } catch (err) {
            console.error('[Auth] Failed to sync user profile:', err);
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────
    const promptGoogleSignIn = async () => {
        await promptAsync();
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, promptGoogleSignIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
