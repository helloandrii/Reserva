import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/utils/supabase';

export default function VerifyScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
    const { completeOnboarding } = useAuth();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (code.length !== 6 || !email) return;
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'signup',
            });

            if (error) {
                Alert.alert('Verification Failed', error.message);
                return;
            }

            if (data.session) {
                // Successfully verified and logged in
                await completeOnboarding();
                router.replace('/(tabs)');
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
                <Text style={[styles.title, { color: C.text }]}>Check your email</Text>
                <Text style={[styles.subtitle, { color: C.textSecondary }]}>We sent a 6-digit code to verify your account.</Text>

                <View style={[styles.inputWrap, { borderColor: C.border, backgroundColor: C.backgroundSecondary }]}>
                    <Ionicons name="keypad-outline" size={20} color={C.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: C.text, letterSpacing: 8 }]}
                        placeholder="000000"
                        placeholderTextColor={C.textTertiary}
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                    />
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: code.length === 6 ? Palette.accent : C.border }, loading && { opacity: 0.7 }]}
                    disabled={code.length < 6 || loading}
                    onPress={handleContinue}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.continueText}>Verify & Continue</Text>
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
    input: { flex: 1, fontSize: Typography.size.heading, fontWeight: Typography.weight.bold, textAlign: 'center' },
    continueButton: { height: 56, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
    continueText: { fontSize: Typography.size.title, fontWeight: Typography.weight.semibold, color: '#fff' },
    footer: { alignItems: 'center', paddingTop: Spacing.lg },
    skipButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
    skipText: { fontSize: Typography.size.caption, textDecorationLine: 'underline' },
});
