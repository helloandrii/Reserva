import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();

        // Subtle logo pulse
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.07,
                    duration: 2200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Navigate to app once authenticated
    useEffect(() => {
        if (!loading && user) {
            router.replace('/(tabs)');
        }
    }, [user, loading]);

    const handleGoogleSignIn = async () => {
        setError(null);
        setSigningIn(true);
        try {
            alert('Google authentication will be available soon.');
        } catch (e: any) {
            setError('Sign-in failed. Please try again.');
            console.error('[Login] Google sign-in error:', e);
        } finally {
            setSigningIn(false);
        }
    };

    // Loading state while checking existing session
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                    <View style={styles.loadingLogo}>
                        <Ionicons name="calendar" size={36} color="#fff" />
                    </View>
                </Animated.View>
                <ActivityIndicator size="large" color="#5B8FF9" style={{ marginTop: 32 }} />
                <Text style={styles.loadingText}>Restoring your session…</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Background decorative circles */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Top — Branding */}
            <Animated.View
                style={[
                    styles.hero,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.logoGlow} />
                    <View style={styles.logoCircle}>
                        <Ionicons name="calendar" size={42} color="#fff" />
                    </View>
                </Animated.View>

                <Text style={styles.appName}>Reserva</Text>
                <Text style={styles.tagline}>Book what you need,{'\n'}wherever you are.</Text>

                {/* Feature pills */}
                <View style={styles.pills}>
                    <Pill icon="flash" label="Instant booking" />
                    <Pill icon="location" label="Location-aware" />
                    <Pill icon="shield-checkmark" label="Secure" />
                </View>
            </Animated.View>

            {/* Bottom — Sign-in card */}
            <Animated.View
                style={[
                    styles.card,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Text style={styles.welcomeText}>Welcome back</Text>
                <Text style={styles.subtitleText}>Sign in to manage your reservations</Text>

                {error ? (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={16} color="#E53935" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.googleButton, signingIn && styles.googleButtonPressed]}
                    activeOpacity={0.82}
                    onPress={handleGoogleSignIn}
                    disabled={signingIn}
                >
                    {signingIn ? (
                        <ActivityIndicator size="small" color="#5B8FF9" />
                    ) : (
                        <>
                            {/* Official Google G */}
                            <View style={styles.googleLogoBox}>
                                <Text style={styles.googleG}>G</Text>
                            </View>
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.termsText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
            </Animated.View>
        </View>
    );
}

function Pill({ icon, label }: { icon: any; label: string }) {
    return (
        <View style={styles.pill}>
            <Ionicons name={icon} size={13} color="#5B8FF9" />
            <Text style={styles.pillText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    // ── Loading ────────────────────────────────────────────────
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0A0E1A',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingLogo: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#5B8FF9',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5B8FF9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    loadingText: {
        color: '#6B7A9E',
        fontSize: 14,
        marginTop: 8,
    },

    // ── Main container ─────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: '#0A0E1A',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    bgCircle1: {
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: 170,
        backgroundColor: '#1a2a6c',
        opacity: 0.35,
        top: -100,
        right: -100,
    },
    bgCircle2: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#2563EB',
        opacity: 0.12,
        bottom: 80,
        left: -80,
    },

    // ── Hero / branding ────────────────────────────────────────
    hero: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingTop: 20,
    },
    logoWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    logoGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#5B8FF9',
        opacity: 0.18,
    },
    logoCircle: {
        width: 96,
        height: 96,
        borderRadius: 28,
        backgroundColor: '#5B8FF9',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5B8FF9',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
        elevation: 16,
    },
    appName: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        color: '#6B7A9E',
        textAlign: 'center',
        lineHeight: 24,
    },

    // ── Feature pills ──────────────────────────────────────────
    pills: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(91,143,249,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(91,143,249,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
    },
    pillText: {
        fontSize: 12,
        color: '#8BAAF5',
        fontWeight: '500',
    },

    // ── Sign-in card ───────────────────────────────────────────
    card: {
        backgroundColor: '#111827',
        borderRadius: 28,
        padding: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: { elevation: 10 },
        }),
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.4,
    },
    subtitleText: {
        fontSize: 14,
        color: '#6B7A9E',
        marginBottom: 4,
    },

    // ── Error banner ───────────────────────────────────────────
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
    },
    errorText: {
        color: '#EF5350',
        fontSize: 13,
        flex: 1,
    },

    // ── Google button ──────────────────────────────────────────
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 58,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#5B8FF9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    googleButtonPressed: {
        opacity: 0.7,
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

    // ── Terms ──────────────────────────────────────────────────
    termsText: {
        fontSize: 12,
        color: '#3D4F72',
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: '#5B8FF9',
    },
});
