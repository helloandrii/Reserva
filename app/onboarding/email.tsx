import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function EmailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
    const { completeOnboarding } = useAuth();
    const [email, setEmail] = useState('');

    const handleContinue = () => {
        if (email) router.push('/onboarding/password');
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.header}>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: C.backgroundSecondary }]} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color={C.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: C.text }]}>What's your email?</Text>
                <Text style={[styles.subtitle, { color: C.textSecondary }]}>We'll use this to safely log you in or create your account.</Text>

                <View style={[styles.inputWrap, { borderColor: C.border, backgroundColor: C.backgroundSecondary }]}>
                    <Ionicons name="mail-outline" size={20} color={C.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="you@example.com"
                        placeholderTextColor={C.textTertiary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                        autoFocus
                    />
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: email ? Palette.accent : C.border }]}
                    disabled={!email}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueText}>Continue</Text>
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
