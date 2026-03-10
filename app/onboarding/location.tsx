import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function LocationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
    const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(28)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();

        // Pulse animation on icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handleAllow = async () => {
        setStatus('requesting');
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
        setStatus(permStatus === 'granted' ? 'granted' : 'denied');
        // Allow location prompt to show before moving forward
        setTimeout(async () => {
            await AsyncStorage.setItem('reserva_intended_role', 'user');
            router.push('/onboarding/auth')
        }, 600);
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('reserva_intended_role', 'user');
        router.push('/onboarding/auth');
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
                {/* Icon */}
                <Animated.View style={[
                    styles.iconRing,
                    { backgroundColor: Palette.accentLight, transform: [{ scale: pulseAnim }] },
                ]}>
                    <View style={[styles.iconInner, { backgroundColor: 'rgba(184,175,230,0.4)' }]}>
                        <Ionicons name="location" size={52} color={Palette.accentDark} />
                    </View>
                </Animated.View>

                {/* Text */}
                <View style={styles.textGroup}>
                    <Text style={[styles.title, { color: C.text }]}>Allow Location</Text>
                    <Text style={[styles.subtitle, { color: C.textSecondary }]}>
                        Reserva uses your location to show services near you on the map and help you find providers quickly.
                    </Text>
                </View>

                {/* Benefit pills */}
                {[
                    { icon: 'map-outline' as const, label: 'Find services near you' },
                    { icon: 'navigate-outline' as const, label: 'Center map on your position' },
                    { icon: 'shield-checkmark-outline' as const, label: 'Location never stored' },
                ].map((b) => (
                    <View key={b.label} style={[styles.benefit, { backgroundColor: C.backgroundSecondary, borderColor: C.border }]}>
                        <Ionicons name={b.icon} size={18} color={Palette.accent} />
                        <Text style={[styles.benefitText, { color: C.text }]}>{b.label}</Text>
                    </View>
                ))}

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.allowBtn, { backgroundColor: Palette.accent }, status === 'requesting' && { opacity: 0.7 }]}
                        onPress={handleAllow}
                        activeOpacity={0.85}
                        disabled={status === 'requesting'}
                    >
                        <Ionicons
                            name={status === 'granted' ? 'checkmark' : 'location'}
                            size={20} color="#fff"
                        />
                        <Text style={styles.allowBtnText}>
                            {status === 'requesting' ? 'Requesting…' : status === 'granted' ? 'Granted' : 'Allow Location Access'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                        <Text style={[styles.skipText, { color: C.textTertiary }]}>Not now</Text>
                    </TouchableOpacity>
                </View>
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
    content: {
        flex: 1,
        alignItems: 'center',
        gap: Spacing.lg,
        paddingTop: Spacing.lg,
    },
    iconRing: {
        width: 160, height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        ...Platform.select({
            ios: { shadowColor: Palette.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30 },
            android: { elevation: 8 },
        }),
    },
    iconInner: {
        width: 110, height: 110,
        borderRadius: 55,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textGroup: { alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md },
    title: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.size.body,
        textAlign: 'center',
        lineHeight: Typography.size.body * 1.6,
    },
    benefit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        width: '100%',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
        borderWidth: 1,
    },
    benefitText: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.medium,
    },
    actions: { width: '100%', gap: Spacing.sm, marginTop: Spacing.md },
    allowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: 56,
        borderRadius: Radius.lg,
    },
    allowBtnText: {
        fontSize: Typography.size.title,
        fontWeight: Typography.weight.semibold,
        color: '#fff',
    },
    skipBtn: { alignSelf: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
    skipText: { fontSize: Typography.size.body },
});
