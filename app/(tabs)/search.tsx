import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSearchBar } from '@/components/GlassSearchBar';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

// ─── Data ─────────────────────────────────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Category {
    label: string;
    icon: IoniconName;
    color: string;
}

const CATEGORIES: Category[] = [
    { label: 'Hair', icon: 'cut-outline', color: '#E8D5F5' },
    { label: 'Beauty', icon: 'color-palette-outline', color: '#FFE4EC' },
    { label: 'Cleaning', icon: 'water-outline', color: '#D5EEF5' },
    { label: 'Fitness', icon: 'barbell-outline', color: '#D5F5E3' },
    { label: 'Language', icon: 'language-outline', color: '#FFF3CD' },
    { label: 'Spa', icon: 'leaf-outline', color: '#D5F5E3' },
    { label: 'Massage', icon: 'hand-left-outline', color: '#F5E6D5' },
    { label: 'Car Detailing', icon: 'car-outline', color: '#D5E8F5' },
    { label: 'Photography', icon: 'camera-outline', color: '#F5D5E8' },
    { label: 'Pet Care', icon: 'paw-outline', color: '#EAD5F5' },
    { label: 'Tutoring', icon: 'school-outline', color: '#FDECD5' },
    { label: 'More', icon: 'grid-outline', color: '#EBEBEB' },
];

interface TrendingService {
    id: string;
    title: string;
    subtitle: string;
    rating: string;
    reviews: number;
    icon: IoniconName;
    accent: string;
}

const TRENDING_SERVICES: TrendingService[] = [
    { id: '1', title: 'Haircut & Style', subtitle: '45 min · From €25', rating: '4.9', reviews: 318, icon: 'cut-outline', accent: '#B8AFE6' },
    { id: '2', title: 'Deep Tissue Massage', subtitle: '60 min · From €50', rating: '4.8', reviews: 204, icon: 'hand-left-outline', accent: '#F5A9C6' },
    { id: '3', title: 'House Cleaning', subtitle: '2-3 h · From €40', rating: '4.7', reviews: 150, icon: 'home-outline', accent: '#A9D8F5' },
    { id: '4', title: 'Personal Training', subtitle: '60 min · From €35', rating: '4.9', reviews: 92, icon: 'barbell-outline', accent: '#A9F5C3' },
    { id: '5', title: 'Portrait Session', subtitle: '90 min · From €80', rating: '5.0', reviews: 67, icon: 'camera-outline', accent: '#FAC9A9' },
];

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({ item }: { item: Category }) {
    const C = useThemeColors();
    return (
        <TouchableOpacity style={[styles.catCard, { backgroundColor: item.color }]} activeOpacity={0.8}>
            <View style={styles.catIconWrap}>
                <Ionicons name={item.icon} size={24} color={Palette.accentDark} />
            </View>
            <Text style={[styles.catLabel, { color: '#2D2D3E' }]} numberOfLines={2}>{item.label}</Text>
        </TouchableOpacity>
    );
}

// ─── Trending Card ─────────────────────────────────────────────────────────────

function TrendingCard({ item }: { item: TrendingService }) {
    const C = useThemeColors();
    return (
        <TouchableOpacity style={[styles.trendCard, { backgroundColor: C.surface }]} activeOpacity={0.8}>
            <View style={[styles.trendIconWrap, { backgroundColor: item.accent + '30' }]}>
                <Ionicons name={item.icon} size={28} color={item.accent} />
            </View>
            <Text style={[styles.trendTitle, { color: C.text }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.trendSubtitle, { color: C.textSecondary }]}>{item.subtitle}</Text>
            <View style={styles.trendRatingRow}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={[styles.trendRating, { color: C.text }]}>{item.rating}</Text>
                <Text style={[styles.trendReviews, { color: C.textTertiary }]}>({item.reviews})</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
    const inputRef = useRef<TextInput>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + Spacing.sm }]}>
            {/* Search bar */}
            <View style={styles.searchWrap}>
                <GlassSearchBar
                    value={searchQuery}
                    placeholder="Search services, providers..."
                    active={isSearchActive}
                    inputRef={inputRef}
                    onPress={() => setIsSearchActive(true)}
                    onChangeText={setSearchQuery}
                    onBlur={() => { if (!searchQuery) setIsSearchActive(false); }}
                    onBack={() => { setIsSearchActive(false); setSearchQuery(''); }}
                />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Categories ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: C.text }]}>Categories</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={CATEGORIES}
                        renderItem={({ item }) => <CategoryCard item={item} />}
                        keyExtractor={(item) => item.label}
                        numColumns={4}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.catRow}
                        contentContainerStyle={styles.catGrid}
                    />
                </View>

                {/* ── Trending Services ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: C.text }]}>Trending</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.trendRow}
                    >
                        {TRENDING_SERVICES.map((item) => (
                            <TrendingCard key={item.id} item={item} />
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchWrap: {
        marginBottom: Spacing.sm,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.lg,
    },

    // ── Sections
    section: {
        gap: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: '#1A1A2E',
        letterSpacing: -0.3,
    },
    seeAll: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.medium,
        color: Palette.accent,
    },

    // ── Category grid
    catGrid: {
        gap: Spacing.sm,
    },
    catRow: {
        gap: Spacing.sm,
        justifyContent: 'space-between',
    },
    catCard: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        padding: Spacing.sm,
        maxWidth: '23%',
    },
    catIconWrap: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    catLabel: {
        fontSize: 11,
        fontWeight: Typography.weight.semibold,
        color: '#2D2D3E',
        textAlign: 'center',
        lineHeight: 14,
    },

    // ── Trending
    trendRow: {
        gap: Spacing.md,
        paddingBottom: 4,
    },
    trendCard: {
        width: 150,
        borderRadius: Radius.xl,
        backgroundColor: '#FFFFFF',
        padding: Spacing.md,
        gap: Spacing.xs,
        shadowColor: '#B8AFE6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    trendIconWrap: {
        width: 52,
        height: 52,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    trendTitle: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.semibold,
        color: '#1A1A2E',
    },
    trendSubtitle: {
        fontSize: 11,
        color: '#7C7C9E',
    },
    trendRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    trendRating: {
        fontSize: 11,
        fontWeight: Typography.weight.semibold,
        color: '#1A1A2E',
    },
    trendReviews: {
        fontSize: 10,
        color: '#AEAEBE',
    },
});
