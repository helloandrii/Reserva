/**
 * Skeleton loader — animated shimmer placeholder for loading states.
 * Usage: <Skeleton width={200} height={20} borderRadius={8} />
 */

import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
    width: DimensionValue;
    height: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: false }),
                Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: false }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const backgroundColor = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: ['#1a1a1a', '#2a2a2a'],
    });

    return (
        <Animated.View
            style={[{ height, borderRadius, backgroundColor }, style as any, { width }]}
        />
    );
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export function ServiceCardSkeleton() {
    return (
        <View style={styles.cardSkeleton}>
            <Skeleton width="100%" height={120} borderRadius={12} />
            <Skeleton width="70%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
            <Skeleton width="40%" height={12} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
    );
}

export function BookingCardSkeleton() {
    return (
        <View style={styles.bookingSkeleton}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Skeleton width={44} height={44} borderRadius={10} />
                <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton width="60%" height={14} borderRadius={6} />
                    <Skeleton width="40%" height={12} borderRadius={6} />
                </View>
            </View>
            <Skeleton width="80%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
            <Skeleton width="60%" height={12} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    cardSkeleton: {
        width: '100%',
        padding: 4,
    },
    bookingSkeleton: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
    },
});
