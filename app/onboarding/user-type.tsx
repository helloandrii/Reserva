import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function UserTypeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const { userType } = Strings.onboarding;

    return (
        <View style={[styles.container, {
            backgroundColor: C.background,
            paddingTop: insets.top + 32,
            paddingBottom: Math.max(insets.bottom, 24),
        }]}>
            <View style={[styles.bgCircle, { backgroundColor: C.backgroundSecondary }]} />

            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <View style={styles.header}>
                    <Text style={[styles.heading, { color: C.text }]}>{userType.heading}</Text>
                </View>

                <View style={styles.cards}>
                    {/* User card */}
                    <TouchableOpacity
                        style={[styles.userCard, { backgroundColor: Palette.accentLight }]}
                        activeOpacity={0.85}
                        onPress={() => router.push('/onboarding/location')}
                    >
                        <View style={[styles.cardIcon, { backgroundColor: 'rgba(184,175,230,0.25)' }]}>
                            <Ionicons name="person" size={36} color={Palette.accentDark} />
                        </View>
                        <Text style={[styles.userCardTitle, { color: Palette.accentDark }]}>{userType.userButton}</Text>
                        <Text style={[styles.userCardSubtitle, { color: Palette.accent }]}>{userType.userSubtitle}</Text>
                        <View style={[styles.cardArrow, { backgroundColor: 'rgba(184,175,230,0.3)' }]}>
                            <Ionicons name="arrow-forward" size={18} color={Palette.accentDark} />
                        </View>
                    </TouchableOpacity>

                    {/* Business card */}
                    <TouchableOpacity
                        style={[styles.businessCard, { backgroundColor: C.surface, borderColor: C.border }]}
                        activeOpacity={0.85}
                        onPress={async () => {
                            await AsyncStorage.setItem('reserva_intended_role', 'business');
                            router.push('/onboarding/auth');
                        }}
                    >
                        <View style={styles.businessCardInner}>
                            <View style={[styles.businessIcon, { backgroundColor: C.backgroundTertiary }]}>
                                <Ionicons name="briefcase-outline" size={24} color={C.textSecondary} />
                            </View>
                            <View style={styles.businessText}>
                                <Text style={[styles.businessCardTitle, { color: C.text }]}>{userType.businessButton}</Text>
                                <Text style={[styles.businessCardSubtitle, { color: C.textSecondary }]}>{userType.businessSubtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={C.textTertiary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Not sure link */}
                <TouchableOpacity
                    style={styles.notSureButton}
                    onPress={() => router.push('/onboarding/explanation')}
                >
                    <Text style={[styles.notSureText, { color: C.textTertiary }]}>Not sure which one you are?</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: Spacing['2xl'] },
    bgCircle: {
        position: 'absolute',
        width: 500, height: 500, borderRadius: 250,
        top: -200, left: -100,
    },
    header: { marginBottom: Spacing['4xl'] },
    heading: {
        fontSize: Typography.size.display,
        fontWeight: Typography.weight.bold,
        letterSpacing: -1,
        lineHeight: Typography.size.display * 1.15,
    },
    cards: { gap: Spacing.md },
    userCard: {
        borderRadius: Radius['2xl'],
        padding: Spacing['2xl'],
        gap: Spacing.xs,
        ...Platform.select({
            ios: { shadowColor: Palette.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 20 },
            android: { elevation: 8 },
        }),
    },
    cardIcon: {
        width: 60, height: 60,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    userCardTitle: {
        fontSize: Typography.size.heading,
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.5,
    },
    userCardSubtitle: { fontSize: Typography.size.body },
    cardArrow: {
        position: 'absolute',
        right: Spacing['2xl'],
        top: Spacing['2xl'],
        width: 36, height: 36,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    businessCard: {
        borderRadius: Radius.xl,
        borderWidth: 1,
    },
    businessCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
    },
    businessIcon: {
        width: 44, height: 44,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    businessText: { flex: 1 },
    businessCardTitle: {
        fontSize: Typography.size.title,
        fontWeight: Typography.weight.semibold,
    },
    businessCardSubtitle: {
        fontSize: Typography.size.caption,
        marginTop: 2,
    },
    notSureButton: {
        alignSelf: 'center',
        paddingVertical: Spacing.xl,
    },
    notSureText: {
        fontSize: Typography.size.body,
        textDecorationLine: 'underline',
    },
});
