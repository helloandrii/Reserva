import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_SCROLL_INTERVAL = 4000;

const slides = Strings.onboarding.slides;

const SLIDE_ICONS: readonly string[] = ['calendar', 'map', 'checkmark-circle'];

// ─── Slide Item ───────────────────────────────────────────────────────────────

function SlideItem({ item, index }: { item: typeof slides[number]; index: number }) {
    const icon = SLIDE_ICONS[index] ?? 'star';
    return (
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.iconWrap}>
                <Ionicons name={icon as any} size={64} color="#fff" />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
    );
}

// ─── Dot ──────────────────────────────────────────────────────────────────────

function Dot({ active }: { active: boolean }) {
    return <View style={[styles.dot, active && styles.dotActive]} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingCarousel() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const listRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const userTouching = useRef(false);

    // Entrance animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    // Auto-scroll
    useEffect(() => {
        const id = setInterval(() => {
            if (userTouching.current) return;
            const next = (activeIndex + 1) % slides.length;
            listRef.current?.scrollToIndex({ index: next, animated: true });
            setActiveIndex(next);
        }, AUTO_SCROLL_INTERVAL);
        return () => clearInterval(id);
    }, [activeIndex]);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems[0]?.index != null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
    ).current;

    const isLast = activeIndex === slides.length - 1;

    const handleNext = () => {
        if (isLast) {
            router.push('/onboarding/user-type');
        } else {
            listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Background gradient circles */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Skip */}
            <Animated.View
                style={[styles.skipWrap, { paddingTop: insets.top + 12, opacity: fadeAnim }]}
            >
                <TouchableOpacity onPress={() => router.push('/onboarding/user-type')}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Slides */}
            <Animated.View
                style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
                <FlatList
                    ref={listRef}
                    data={slides as any[]}
                    renderItem={({ item, index }) => <SlideItem item={item} index={index} />}
                    keyExtractor={(_, i) => String(i)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                    onTouchStart={() => { userTouching.current = true; }}
                    onMomentumScrollEnd={() => { userTouching.current = false; }}
                    scrollEventThrottle={16}
                />
            </Animated.View>

            {/* Bottom: dots + button */}
            <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
                <View style={styles.dots}>
                    {slides.map((_, i) => <Dot key={i} active={i === activeIndex} />)}
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
                    {isLast ? (
                        <Text style={styles.nextButtonText}>{Strings.common.getStarted}</Text>
                    ) : (
                        <>
                            <Text style={styles.nextButtonText}>{Strings.common.next}</Text>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    bgCircle1: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#1a1a1a',
        top: -120,
        right: -120,
    },
    bgCircle2: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#111',
        bottom: 100,
        left: -80,
    },

    // ── Skip
    skipWrap: {
        position: 'absolute',
        right: Spacing.lg,
        zIndex: 10,
    },
    skipText: {
        color: Colors.dark.textSecondary,
        fontSize: Typography.size.md,
    },

    // ── Slide
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing['3xl'],
        gap: Spacing.lg,
        paddingTop: 80,
    },
    iconWrap: {
        width: 120,
        height: 120,
        borderRadius: Radius.xl,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
        ...Platform.select({
            ios: { shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 20 },
            android: { elevation: 4 },
        }),
    },
    slideTitle: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    slideSubtitle: {
        fontSize: Typography.size.md,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: Typography.size.md * 1.6,
    },

    // ── Bottom
    bottom: {
        paddingHorizontal: Spacing['2xl'],
        gap: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: Radius.full,
        backgroundColor: '#333',
    },
    dotActive: {
        width: 24,
        backgroundColor: Colors.dark.text,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: 56,
        borderRadius: Radius.lg,
        backgroundColor: Colors.dark.text, // white
    },
    nextButtonText: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: Colors.dark.textInverse, // black
    },
});
