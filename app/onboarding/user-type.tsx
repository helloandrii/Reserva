import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

export default function UserTypeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
        <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.bgCircle} />

            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.heading}>{userType.heading}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.cards}>
                    {/* User — large prominent */}
                    <TouchableOpacity
                        style={styles.userCard}
                        activeOpacity={0.85}
                        onPress={() => router.push('/onboarding/auth')}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="person" size={36} color="#000" />
                        </View>
                        <Text style={styles.userCardTitle}>{userType.userButton}</Text>
                        <Text style={styles.userCardSubtitle}>{userType.userSubtitle}</Text>
                        <View style={styles.cardArrow}>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </View>
                    </TouchableOpacity>

                    {/* Business — smaller */}
                    <TouchableOpacity
                        style={styles.businessCard}
                        activeOpacity={0.85}
                        onPress={() => router.push('/onboarding/business')}
                    >
                        <View style={styles.businessCardInner}>
                            <View style={styles.businessIcon}>
                                <Ionicons name="briefcase-outline" size={24} color="#fff" />
                            </View>
                            <View style={styles.businessText}>
                                <Text style={styles.businessCardTitle}>{userType.businessButton}</Text>
                                <Text style={styles.businessCardSubtitle}>{userType.businessSubtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#555" />
                        </View>
                    </TouchableOpacity>
                </View>
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
    bgCircle: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
        backgroundColor: '#111',
        top: -200,
        left: -100,
    },

    // ── Header
    header: {
        marginBottom: Spacing['4xl'],
    },
    heading: {
        fontSize: Typography.size['4xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
        letterSpacing: -1,
        lineHeight: Typography.size['4xl'] * 1.15,
    },

    // ── Cards
    cards: {
        gap: Spacing.md,
    },

    // User
    userCard: {
        backgroundColor: '#fff',
        borderRadius: Radius['2xl'],
        padding: Spacing['2xl'],
        gap: Spacing.xs,
        ...Platform.select({
            ios: { shadowColor: '#fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 20 },
            android: { elevation: 8 },
        }),
    },
    cardIcon: {
        width: 60,
        height: 60,
        borderRadius: Radius.lg,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    userCardTitle: {
        fontSize: Typography.size['2xl'],
        fontWeight: Typography.weight.bold,
        color: '#000',
        letterSpacing: -0.5,
    },
    userCardSubtitle: {
        fontSize: Typography.size.md,
        color: '#666',
    },
    cardArrow: {
        position: 'absolute',
        right: Spacing['2xl'],
        top: Spacing['2xl'],
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Business
    businessCard: {
        backgroundColor: '#111',
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: '#222',
    },
    businessCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
    },
    businessIcon: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    businessText: {
        flex: 1,
    },
    businessCardTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: Colors.dark.text,
    },
    businessCardSubtitle: {
        fontSize: Typography.size.sm,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
});
