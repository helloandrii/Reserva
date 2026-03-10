import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/utils/supabase';

export default function PasswordScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
    const { completeOnboarding } = useAuth();

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!email || !password) return;
        setLoading(true);

        try {
            // 1. Try to Login
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (!signInError) {
                // Login successful
                await completeOnboarding();
                router.replace('/(tabs)');
                return;
            }

            // 2. If login fails (user likely does not exist), try to sign up
            if (signInError.message.includes('Invalid login credentials')) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (signUpError) {
                    Alert.alert('Registration Failed', signUpError.message);
                    return;
                }

                if (signUpData.user && !signUpData.session) {
                    // Supabase forces email confirmation (session is null)
                    router.push({
                        pathname: '/onboarding/verify',
                        params: { email }
                    });
                } else if (signUpData.session) {
                    // Logged in immediately
                    await completeOnboarding();
                    router.replace('/(tabs)');
                }
            } else {
                Alert.alert('Login Failed', signInError.message);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.header}>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: C.backgroundSecondary }]} onPress={() => router.back()} disabled={loading}>
                    <Ionicons name="chevron-back" size={22} color={C.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: C.text }]}>Enter a secure password</Text>
                <Text style={[styles.subtitle, { color: C.textSecondary }]}>Make sure it's at least 6 characters long.</Text>

                <View style={[styles.inputWrap, { borderColor: C.border, backgroundColor: C.backgroundSecondary }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={C.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="••••••••"
                        placeholderTextColor={C.textTertiary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoFocus
                    />
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: password.length >= 6 ? Palette.accent : C.border }, loading && { opacity: 0.7 }]}
                    disabled={password.length < 6 || loading}
                    onPress={handleContinue}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.continueText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={[styles.skipText, { color: C.textTertiary }]}>Skip for now (dev only)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: Spacing['2xl'] },
    header: { marginBottom: Spacing.xl },
    backButton: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, gap: Spacing.md },
    title: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, letterSpacing: -0.5 },
    subtitle: { fontSize: Typography.size.body, marginBottom: Spacing.lg },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, height: 56, gap: Spacing.sm },
    input: { flex: 1, fontSize: Typography.size.md },
    continueButton: { height: 56, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
    continueText: { fontSize: Typography.size.title, fontWeight: Typography.weight.semibold, color: '#fff' },
    footer: { alignItems: 'center', paddingTop: Spacing.lg },
    skipButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
    skipText: { fontSize: Typography.size.caption, textDecorationLine: 'underline' },
});

