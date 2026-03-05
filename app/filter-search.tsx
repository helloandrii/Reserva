import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSearchBar } from '@/components/GlassSearchBar';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/useThemeColors';

// ─── Dummy Custom Slider (Since @react-native-community/slider isn't installed) ───

function CustomSlider({ label, value, min, max, format, C, isDark }: any) {
    const progress = (value - min) / (max - min);

    return (
        <View style={styles.sliderWrap}>
            <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: C.textSecondary }]}>{label}</Text>
                <Text style={[styles.sliderValue, { color: C.text }]}>{format(value)}</Text>
            </View>
            <View style={styles.sliderTrackWrap}>
                <View style={[styles.sliderTrackBg, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]} />
                <View style={[styles.sliderTrackFill, { width: `${progress * 100}%`, backgroundColor: Palette.accent }]} />
                <View style={[styles.sliderThumb, { left: `${progress * 100}%`, backgroundColor: C.surface, borderColor: Palette.accent }]} />
            </View>
        </View>
    );
}

// ─── Filter Screen ─────────────────────────────────────────────────────────────

export default function FilterSearchScreen() {
    const { category, section, service } = useLocalSearchParams<{ category?: string, section?: string, service?: string }>();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const C = useThemeColors();
    const isDark = useColorScheme() === 'dark';

    const [searchQuery, setSearchQuery] = useState(category || '');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Available Today', 'Top Rated', 'Near Me', 'Offers'];

    return (
        <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top }]}>
            {/* Header / Search */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={C.text} />
                </TouchableOpacity>
                <View style={styles.searchFlex}>
                    <GlassSearchBar
                        value={searchQuery}
                        placeholder="Search services..."
                        active={false}
                        onChangeText={setSearchQuery}
                        onPress={() => { }}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + Spacing['4xl'] }}>
                {/* Horizontal Quick Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickFiltersContainer}
                >
                    {filters.map(f => {
                        const isActive = activeFilter === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.quickFilterChip,
                                    { backgroundColor: isActive ? Palette.accent : (isDark ? '#2C2C2E' : '#F0F0F0') },
                                    isActive && { borderColor: Palette.accent }
                                ]}
                                onPress={() => setActiveFilter(f)}
                            >
                                <Text style={[
                                    styles.quickFilterText,
                                    { color: isActive ? '#FFF' : C.textSecondary },
                                    isActive && { fontWeight: '600' }
                                ]}>{f}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Adjustments Section */}
                <View style={[styles.section, { borderTopColor: C.border }]}>
                    <Text style={[styles.sectionTitle, { color: C.text }]}>Filters</Text>

                    <CustomSlider
                        label="Price Range"
                        value={45} min={0} max={200}
                        format={(v: number) => `Up to €${v}`}
                        C={C} isDark={isDark}
                    />

                    <CustomSlider
                        label="Minimum Rating"
                        value={4.5} min={3} max={5}
                        format={(v: number) => `${v.toFixed(1)} ★`}
                        C={C} isDark={isDark}
                    />

                    <CustomSlider
                        label="Distance"
                        value={10} min={1} max={50}
                        format={(v: number) => `Within ${v} km`}
                        C={C} isDark={isDark}
                    />
                </View>

                {/* Apply Button */}
                <View style={styles.applyWrap}>
                    <TouchableOpacity style={[styles.applyBtn, { backgroundColor: Palette.accent }]}>
                        <Text style={styles.applyBtnText}>Show 24 Results</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    backBtn: {
        padding: Spacing.sm,
    },
    searchFlex: {
        flex: 1,
        marginLeft: -Spacing.sm, // offsets the GlassSearchBar default margin
    },
    quickFiltersContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    quickFilterChip: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    quickFilterText: {
        fontSize: Typography.size.sm,
    },
    section: {
        padding: Spacing.lg,
        marginTop: Spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    sectionTitle: {
        fontSize: Typography.size.xl,
        fontWeight: 'bold',
        marginBottom: Spacing.xl,
    },

    // Custom Slider Styles
    sliderWrap: {
        marginBottom: Spacing.xl,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    sliderLabel: {
        fontSize: Typography.size.sm,
        fontWeight: '500',
    },
    sliderValue: {
        fontSize: Typography.size.sm,
        fontWeight: '600',
    },
    sliderTrackWrap: {
        height: 24,
        justifyContent: 'center',
    },
    sliderTrackBg: {
        position: 'absolute',
        width: '100%',
        height: 6,
        borderRadius: 3,
    },
    sliderTrackFill: {
        position: 'absolute',
        height: 6,
        borderRadius: 3,
    },
    sliderThumb: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        marginLeft: -12, // center thumb
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    applyWrap: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
    },
    applyBtn: {
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#FFF',
        fontSize: Typography.size.md,
        fontWeight: 'bold',
    },
});
