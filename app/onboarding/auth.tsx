import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { promptGoogleSignIn, completeOnboarding } = useAuth();
    const [signingIn, setSigningIn] = useState<'google' | 'apple' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    const { auth } = Strings.onboarding;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleGoogle = async () => {
        setError(null);
        setSigningIn('google');
        try {
            await promptGoogleSignIn();
            // AuthContext handles the redirect via onAuthStateChanged
        } catch {
            setError('Sign-in failed. Please try again.');
        } finally {
            setSigningIn(null);
        }
    };

    // TODO: remove before release
    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 32) }]}>
            {/* Back */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color={Colors.dark.text} />
            </TouchableOpacity>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Logo */}
                <View style={styles.logoWrap}>
                    <Ionicons name="calendar" size={40} color="#fff" />
                </View>
                <Text style={styles.heading}>{auth.heading}</Text>

                {/* Error */}
                {error ? (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={15} color="#FF3B30" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Auth buttons */}
                <View style={styles.buttons}>
                    {/* Google */}
                    <TouchableOpacity
                        style={[styles.authButton, styles.googleButton, signingIn && styles.buttonDisabled]}
                        activeOpacity={0.82}
                        onPress={handleGoogle}
                        disabled={!!signingIn}
                    >
                        {signingIn === 'google' ? (
                            <ActivityIndicator size="small" color="#111" />
                        ) : (
                            <>
                                <View style={styles.googleLogo}>
                                    <Text style={styles.googleG}>G</Text>
                                </View>
                                <Text style={styles.googleText}>{auth.google}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Apple — UI only */}
                    <TouchableOpacity
                        style={[styles.authButton, styles.appleButton]}
                        activeOpacity={0.82}
                        disabled // TODO: implement Apple Sign-In in dev build
                    >
                        <Ionicons name="logo-apple" size={20} color="#fff" />
                        <Text style={styles.appleText}>{auth.apple}</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Email — future-ready */}
                    <TouchableOpacity style={[styles.authButton, styles.emailButton]} disabled>
                        <Ionicons name="mail-outline" size={20} color="#555" />
                        <Text style={styles.emailText}>{auth.email}</Text>
                        <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText}>Soon</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text style={styles.termsText}>
                    {auth.terms}{' '}
                    <Text style={styles.termsLink} onPress={() => router.push('/legal/terms')}>
                        {auth.termsLink}
                    </Text>
                    {' '}{auth.and}{' '}
                    <Text style={styles.termsLink} onPress={() => router.push('/legal/privacy')}>
                        {auth.privacyLink}
                    </Text>
                </Text>

                {/* ⚠️ Temporary skip — remove before release */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip for now (dev only)</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: Spacing['2xl'],
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    content: {
        flex: 1,
        gap: Spacing.lg,
    },

    // ── Logo
    logoWrap: {
        width: 72,
        height: 72,
        borderRadius: Radius.xl,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    heading: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
        letterSpacing: -0.5,
        marginBottom: Spacing.sm,
    },

    // ── Error
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: '#1a0000',
        borderWidth: 1,
        borderColor: '#3a0000',
        borderRadius: Radius.md,
        padding: Spacing.md,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: Typography.size.sm,
        flex: 1,
    },

    // ── Buttons
    buttons: {
        gap: Spacing.sm,
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        height: 56,
        borderRadius: Radius.lg,
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // Google
    googleButton: {
        backgroundColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: '#fff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 4 },
        }),
    },
    googleLogo: {
        width: 26,
        height: 26,
        borderRadius: Radius.full,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleG: {
        color: '#fff',
        fontSize: 14,
        fontWeight: Typography.weight.heavy,
    },
    googleText: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: '#111',
    },

    // Apple
    appleButton: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        opacity: 0.7,
    },
    appleText: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: Colors.dark.text,
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginVertical: Spacing.xs,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#222',
    },
    dividerText: {
        color: '#555',
        fontSize: Typography.size.sm,
    },

    // Email
    emailButton: {
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#1a1a1a',
        opacity: 0.5,
    },
    emailText: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: '#555',
        flex: 1,
    },
    comingSoonBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        backgroundColor: '#1a1a1a',
        alignSelf: 'center',
    },
    comingSoonText: {
        fontSize: 10,
        color: '#555',
        fontWeight: Typography.weight.semibold,
    },

    // ── Terms
    termsText: {
        fontSize: Typography.size.xs,
        color: Colors.dark.textTertiary,
        textAlign: 'center',
        lineHeight: Typography.size.xs * 1.7,
        marginTop: 'auto',
    },
    termsLink: {
        color: Colors.dark.textSecondary,
        textDecorationLine: 'underline',
    },
    // TODO: remove before release
    skipButton: {
        alignSelf: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.sm,
    },
    skipText: {
        fontSize: Typography.size.sm,
        color: '#444',
        textDecorationLine: 'underline',
    },
});
