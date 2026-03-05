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
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AuthScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
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
        <View style={[styles.container, {
            backgroundColor: C.background,
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, 32),
        }]}>
            {/* Back */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: C.backgroundSecondary }]}
                onPress={() => router.back()}
            >
                <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Logo */}
                <View style={[styles.logoWrap, { backgroundColor: C.backgroundSecondary, borderColor: C.border }]}>
                    <Ionicons name="calendar" size={40} color={Palette.accent} />
                </View>
                <Text style={[styles.heading, { color: C.text }]}>{auth.heading}</Text>

                {/* Error */}
                {error ? (
                    <View style={[styles.errorBanner, { backgroundColor: C.backgroundSecondary, borderColor: C.error + '44' }]}>
                        <Ionicons name="alert-circle" size={15} color={C.error} />
                        <Text style={[styles.errorText, { color: C.error }]}>{error}</Text>
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

                    {/* Apple */}
                    <TouchableOpacity
                        style={[styles.authButton, styles.appleButton]}
                        activeOpacity={0.82}
                        disabled
                    >
                        <Ionicons name="logo-apple" size={20} color="#fff" />
                        <Text style={styles.appleText}>{auth.apple}</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
                        <Text style={[styles.dividerText, { color: C.textTertiary }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
                    </View>

                    {/* Email — future-ready */}
                    <TouchableOpacity
                        style={[styles.authButton, styles.emailButton, {
                            backgroundColor: C.backgroundSecondary,
                            borderColor: C.border,
                        }]}
                        disabled
                    >
                        <Ionicons name="mail-outline" size={20} color={C.textTertiary} />
                        <Text style={[styles.emailText, { color: C.textTertiary }]}>{auth.email}</Text>
                        <View style={[styles.comingSoonBadge, { backgroundColor: C.backgroundTertiary }]}>
                            <Text style={[styles.comingSoonText, { color: C.textTertiary }]}>Soon</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text style={[styles.termsText, { color: C.textTertiary }]}>
                    {auth.terms}{' '}
                    <Text style={[styles.termsLink, { color: C.textSecondary }]} onPress={() => router.push('/legal/terms')}>
                        {auth.termsLink}
                    </Text>
                    {' '}{auth.and}{' '}
                    <Text style={[styles.termsLink, { color: C.textSecondary }]} onPress={() => router.push('/legal/privacy')}>
                        {auth.privacyLink}
                    </Text>
                </Text>

                {/* ⚠️ Temporary skip — remove before release */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={[styles.skipText, { color: C.textTertiary }]}>Skip for now (dev only)</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: Spacing['2xl'] },
    backButton: {
        width: 40, height: 40,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    content: { flex: 1, gap: Spacing.lg },
    logoWrap: {
        width: 72, height: 72,
        borderRadius: Radius.xl,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    heading: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.5,
        marginBottom: Spacing.sm,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        borderRadius: Radius.md,
        padding: Spacing.md,
    },
    errorText: { fontSize: Typography.size.caption, flex: 1 },
    buttons: { gap: Spacing.sm },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        height: 56,
        borderRadius: Radius.lg,
    },
    buttonDisabled: { opacity: 0.6 },
    googleButton: {
        backgroundColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 4 },
        }),
    },
    googleLogo: {
        width: 26, height: 26,
        borderRadius: Radius.full,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleG: { color: '#fff', fontSize: 14, fontWeight: Typography.weight.heavy },
    googleText: { fontSize: Typography.size.title, fontWeight: Typography.weight.semibold, color: '#111' },
    appleButton: { backgroundColor: '#000', borderWidth: 1, borderColor: '#222', opacity: 0.9 },
    appleText: { fontSize: Typography.size.title, fontWeight: Typography.weight.semibold, color: '#fff' },
    divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.xs },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: Typography.size.caption },
    emailButton: { borderWidth: 1, opacity: 0.5 },
    emailText: { fontSize: Typography.size.title, fontWeight: Typography.weight.semibold, flex: 1 },
    comingSoonBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        alignSelf: 'center',
    },
    comingSoonText: { fontSize: 10, fontWeight: Typography.weight.semibold },
    termsText: {
        fontSize: Typography.size.xs,
        textAlign: 'center',
        lineHeight: Typography.size.xs * 1.7,
        marginTop: 'auto',
    },
    termsLink: { textDecorationLine: 'underline' },
    skipButton: { alignSelf: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, marginTop: Spacing.sm },
    skipText: { fontSize: Typography.size.caption, textDecorationLine: 'underline' },
});
