import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
    const { user, profile, loading, promptGoogleSignIn, signOut } = useAuth();
    const insets = useSafeAreaInsets();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [user]); // re-animate on sign-in/out

    const handleSignIn = async () => {
        setError(null);
        setSigningIn(true);
        try {
            await promptGoogleSignIn();
        } catch {
            setError('Sign-in failed. Please try again.');
        } finally {
            setSigningIn(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#5B8FF9" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                {user && profile ? (
                    /* ── Signed-in state ─────────────────────────────── */
                    <View style={styles.signedIn}>
                        {/* Avatar */}
                        <View style={styles.avatarWrap}>
                            {profile.photoURL ? (
                                <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarInitial}>
                                        {profile.displayName?.[0]?.toUpperCase() ?? '?'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.onlineDot} />
                        </View>

                        {/* Name & email */}
                        <Text style={styles.displayName}>{profile.displayName}</Text>
                        {profile.email ? (
                            <Text style={styles.email}>{profile.email}</Text>
                        ) : null}

                        {/* Info cards */}
                        <View style={styles.infoCard}>
                            <InfoRow icon="person-outline" label="Name" value={profile.displayName} />
                            <View style={styles.divider} />
                            <InfoRow icon="mail-outline" label="Email" value={profile.email ?? '—'} />
                        </View>

                        {/* Sign out */}
                        <TouchableOpacity style={styles.signOutButton} onPress={signOut} activeOpacity={0.8}>
                            <Ionicons name="log-out-outline" size={18} color="#EF5350" />
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* ── Signed-out state ────────────────────────────── */
                    <View style={styles.signedOut}>
                        {/* Icon */}
                        <View style={styles.guestIcon}>
                            <Ionicons name="person-outline" size={44} color="#5B8FF9" />
                        </View>

                        <Text style={styles.guestTitle}>Your Profile</Text>
                        <Text style={styles.guestSubtitle}>
                            Sign in with Google to save your reservations and access your account across devices.
                        </Text>

                        {error ? (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={15} color="#E53935" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.googleButton, signingIn && { opacity: 0.7 }]}
                            activeOpacity={0.82}
                            onPress={handleSignIn}
                            disabled={signingIn}
                        >
                            {signingIn ? (
                                <ActivityIndicator size="small" color="#5B8FF9" />
                            ) : (
                                <>
                                    <View style={styles.googleLogoBox}>
                                        <Text style={styles.googleG}>G</Text>
                                    </View>
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Apple Sign-In — UI only, implementation coming */}
                        <TouchableOpacity
                            style={styles.appleButton}
                            activeOpacity={0.82}
                            disabled
                        >
                            <Ionicons name="logo-apple" size={20} color="#fff" />
                            <Text style={styles.appleButtonText}>Continue with Apple</Text>
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text>
                            {' '}and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>.
                        </Text>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
                <Ionicons name={icon} size={16} color="#5B8FF9" />
            </View>
            <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E1A',
        paddingHorizontal: 24,
    },
    centered: {
        flex: 1,
        backgroundColor: '#0A0E1A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Signed-in ─────────────────────────────────────────────
    signedIn: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 32,
        gap: 8,
    },
    avatarWrap: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: '#5B8FF9',
    },
    avatarFallback: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#1E2D52',
        borderWidth: 3,
        borderColor: '#5B8FF9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 38,
        fontWeight: '700',
        color: '#5B8FF9',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#34D399',
        borderWidth: 2.5,
        borderColor: '#0A0E1A',
    },
    displayName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginTop: 4,
    },
    email: {
        fontSize: 14,
        color: '#6B7A9E',
        marginBottom: 8,
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#111827',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        marginTop: 16,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    infoIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(91,143,249,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#6B7A9E',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(239,83,80,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239,83,80,0.25)',
    },
    signOutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#EF5350',
    },

    // ── Signed-out ────────────────────────────────────────────
    signedOut: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 8,
    },
    guestIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(91,143,249,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(91,143,249,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    guestTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    guestSubtitle: {
        fontSize: 14,
        color: '#6B7A9E',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(229,57,53,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(229,57,53,0.3)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        width: '100%',
    },
    errorText: {
        color: '#EF5350',
        fontSize: 13,
        flex: 1,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 58,
        width: '100%',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#5B8FF9',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
            },
            android: { elevation: 6 },
        }),
    },
    googleLogoBox: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleG: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },
    appleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 58,
        width: '100%',
        borderRadius: 16,
        backgroundColor: '#000',
        opacity: 0.9,
    },
    appleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    termsText: {
        fontSize: 12,
        color: '#3D4F72',
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 4,
    },
    termsLink: {
        color: '#5B8FF9',
    },
});
