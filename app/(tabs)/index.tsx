import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassChip } from '@/components/GlassChip';
import { GlassSearchBar } from '@/components/GlassSearchBar';
import { MapPin } from '@/components/MapPin';
import { Strings } from '@/constants/strings';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { MapPoint, fetchMapPoints } from '@/src/services/mapServices';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/useThemeColors';

// ─── Category icon mapping ────────────────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_ICONS: Record<string, IoniconName> = {
    'Hair': 'cut-outline',
    'Beauty': 'color-palette-outline',
    'Cleaning': 'water-outline',
    'Fitness Classes': 'barbell-outline',
    'Language': 'language-outline',
    'Spa': 'leaf-outline',
    'Massage': 'hand-left-outline',
    'Car Detailing': 'car-outline',
    'Photography': 'camera-outline',
};

const CATEGORIES = Strings.map.categories;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MapScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ category?: string }>();
    const mapRef = useRef<MapView>(null);
    const inputRef = useRef<TextInput>(null);

    const [hasLocation, setHasLocation] = useState<boolean | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [sortFilter, setSortFilter] = useState<'rating' | 'reviews' | null>(null);
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
    const [points, setPoints] = useState<MapPoint[]>([]);

    const flatListRef = useRef<FlatList>(null);

    // Request location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { setHasLocation(false); return; }
            setHasLocation(true);
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        })();
    }, []);

    // Sync route parameters to local state
    useEffect(() => {
        if (params.category && typeof params.category === 'string') {
            setSelectedCategory(params.category);
            // Optionally clear the param so it doesn't stick permanently, 
            // but router.setParams isn't available exactly like this.
        }
    }, [params.category]);

    // Fetch mock points based on selected category and filter and search query
    // Debounce search slightly to avoid spamming Supabase while typing
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        let mounted = true;
        fetchMapPoints(selectedCategory, sortFilter, debouncedSearch).then((data: MapPoint[]) => {
            if (mounted) {
                setPoints(data);
                
                // If the currently selected pin is no longer in the results, drop the selection
                if (selectedServiceId && !data.some((p: MapPoint) => p.id === selectedServiceId)) {
                    setSelectedServiceId(null);
                }

                if (data.length > 0 && mapRef.current) {
                    // Only auto-center if we're filtering by a specific category OR actively searching
                    if (selectedCategory || debouncedSearch.trim() !== '') {
                         mapRef.current.fitToCoordinates(
                             data.map((p: MapPoint) => ({ latitude: p.latitude, longitude: p.longitude })),
                             { edgePadding: { top: 150, right: 50, bottom: 250, left: 50 }, animated: true }
                         );
                    }
                }
            }
        });
        return () => { mounted = false; };
    }, [selectedCategory, sortFilter, debouncedSearch]);

    const C = useThemeColors();
    const isDark = useColorScheme() === 'dark';

    const mapRegion = userLocation
        ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
        : { latitude: 48.1486, longitude: 17.1077, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

    const handleCenterOnUser = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion(
                { ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 },
                500
            );
        }
    };

    const handleSelectPoint = (point: MapPoint) => {
        setSelectedServiceId(point.id);
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: point.latitude, // Exactly center on screen
                longitude: point.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            }, 400);
        }
        if (selectedCategory && flatListRef.current) {
            const index = points.findIndex(p => p.id === point.id);
            if (index !== -1) {
                flatListRef.current.scrollToIndex({ index, animated: true });
            }
        }
    };

    const handleSearchBlur = () => {
        if (!searchQuery) setIsSearchActive(false);
    };

    const headerTop = insets.top + Spacing.sm;

    return (
        <View style={styles.container}>
            {/* Full-screen map */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                showsUserLocation={hasLocation === true}
                showsMyLocationButton={false}
                showsCompass={true}
                mapPadding={{ top: insets.top + 50, right: Spacing.lg, bottom: 0, left: 0 }}
                region={mapRegion}
                mapType={mapType}
                onPress={() => {
                    // Deselect pin or category when tapping empty space on the map
                    if (selectedServiceId) setSelectedServiceId(null);
                    if (selectedCategory) setSelectedCategory(null);
                    if (isSearchActive) setIsSearchActive(false);
                }}
            >
                {points.map(p => (
                    <Marker
                        key={p.id}
                        coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                        onPress={() => handleSelectPoint(p)}
                        style={{ zIndex: selectedServiceId === p.id ? 2 : 1 }}
                    >
                        <MapPin
                            iconName={CATEGORY_ICONS[p.category] || "location"}
                            selected={selectedServiceId === p.id}
                        />
                    </Marker>
                ))}
            </MapView>

            {/* ── Top overlay: search + categories ── */}
            <View style={[styles.topOverlay, { top: headerTop }]}>

                {/* Glass Search bar */}
                <GlassSearchBar
                    value={searchQuery}
                    placeholder={Strings.map.searchPlaceholder}
                    active={isSearchActive}
                    inputRef={inputRef}
                    onPress={() => setIsSearchActive(true)}
                    onChangeText={setSearchQuery}
                    onBlur={handleSearchBlur}
                    onBack={() => { setIsSearchActive(false); setSearchQuery(''); }}
                    onMicPress={() => {
                        setIsSearchActive(true);
                        setTimeout(() => inputRef.current?.focus(), 80);
                    }}
                />

                {/* Glass Category chips — hidden when search is active */}
                {!isSearchActive && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                        keyboardShouldPersistTaps="handled"
                    >
                        {CATEGORIES.map((cat) => (
                            <GlassChip
                                key={cat}
                                label={cat}
                                icon={CATEGORY_ICONS[cat]}
                                selected={selectedCategory === cat}
                                onPress={() =>
                                    setSelectedCategory(selectedCategory === cat ? null : cat)
                                }
                            />
                        ))}

                        {/* More categories button */}
                        <GlassChip
                            label="More"
                            icon="grid-outline"
                            onPress={() => router.push('/categories-sheet')}
                        />
                    </ScrollView>
                )}

                {/* Filter chip below categories when active */}
                {!isSearchActive && selectedCategory && (
                    <View style={styles.filterRow}>
                        <GlassView style={styles.glassFilterRow} glassEffectStyle="regular">
                            <TouchableOpacity
                                style={[styles.filterBtn, sortFilter === 'rating' && styles.filterBtnActive]}
                                onPress={() => setSortFilter(s => s === 'rating' ? null : 'rating')}
                            >
                                <Ionicons name="star" size={14} color={sortFilter === 'rating' ? '#fff' : C.text} />
                                <Text style={[styles.filterBtnText, { color: sortFilter === 'rating' ? '#fff' : C.text }]}>Top Rated</Text>
                            </TouchableOpacity>
                            <View style={styles.filterDivider} />
                            <TouchableOpacity
                                style={[styles.filterBtn, sortFilter === 'reviews' && styles.filterBtnActive]}
                                onPress={() => setSortFilter(s => s === 'reviews' ? null : 'reviews')}
                            >
                                <Ionicons name="people" size={14} color={sortFilter === 'reviews' ? '#fff' : C.text} />
                                <Text style={[styles.filterBtnText, { color: sortFilter === 'reviews' ? '#fff' : C.text }]}>Most Reviewed</Text>
                            </TouchableOpacity>
                        </GlassView>
                    </View>
                )}
            </View>

            {/* ── FAB Group (Layers & Location) ── */}
            {!isSearchActive && (
                <View style={[styles.locationFabWrap, { bottom: insets.bottom + (selectedCategory ? 210 : 100) }]}>
                    {Platform.OS === 'ios' ? (
                        <GlassView style={styles.fabGlass} glassEffectStyle="regular">
                            <TouchableOpacity
                                style={styles.fabInner}
                                onPress={() => setMapType(p => p === 'standard' ? 'satellite' : 'standard')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="layers" size={20} color={mapType === 'satellite' ? Palette.accent : C.textSecondary} />
                            </TouchableOpacity>
                            <View style={[styles.fabDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
                            <TouchableOpacity style={styles.fabInner} onPress={handleCenterOnUser} activeOpacity={0.7}>
                                <Ionicons name="navigate" size={20} color={Palette.accent} />
                            </TouchableOpacity>
                        </GlassView>
                    ) : (
                        <View style={[styles.fabFallback, { backgroundColor: isDark ? 'rgba(40,40,45,0.92)' : 'rgba(255,255,255,0.92)' }]}>
                            <TouchableOpacity
                                style={styles.fabInner}
                                onPress={() => setMapType(p => p === 'standard' ? 'satellite' : 'standard')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="layers" size={20} color={mapType === 'satellite' ? Palette.accent : C.textSecondary} />
                            </TouchableOpacity>
                            <View style={[styles.fabDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
                            <TouchableOpacity style={styles.fabInner} onPress={handleCenterOnUser} activeOpacity={0.7}>
                                <Ionicons name="navigate" size={20} color={Palette.accent} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* ── Bottom Services Tab (When category selected OR pin selected) ── */}
            {(selectedCategory || selectedServiceId) && !isSearchActive && (
                <View style={[styles.bottomServicesWrap, { bottom: insets.bottom + 80 }]}>
                    <FlatList
                        ref={flatListRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.bottomServicesScroll}
                        data={selectedCategory ? points : points.filter(p => p.id === selectedServiceId)}
                        keyExtractor={p => p.id}
                        onScrollToIndexFailed={(info) => {
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                            });
                        }}
                        renderItem={({ item: p }) => (
                            <TouchableOpacity
                                style={styles.serviceCardWrap}
                                onPress={() => router.push(`/service/${p.id}`)}
                                activeOpacity={0.9}
                            >
                                <GlassView
                                    style={[
                                        styles.serviceCard,
                                        selectedServiceId === p.id && { borderColor: Palette.accent, borderWidth: 1.5 }
                                    ]}
                                    glassEffectStyle="regular"
                                >
                                    <Text style={[styles.serviceTitle, { color: C.text }]} numberOfLines={1}>{p.title}</Text>
                                    <Text style={[styles.serviceCategory, { color: C.textSecondary }]}>{p.category}</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={12} color={Palette.accent} />
                                        <Text style={[styles.ratingText, { color: C.textSecondary }]}>{p.rating} ({p.reviews})</Text>
                                    </View>
                                </GlassView>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },

    // ── Top overlay
    topOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        gap: Spacing.sm,
    },

    // ── Chips row
    chipsRow: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        paddingVertical: 2,
    },

    // ── Filter Row
    filterRow: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.xs,
        alignItems: 'flex-start',
    },
    glassFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: Radius.lg,
        overflow: 'hidden',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Radius.md,
    },
    filterBtnActive: {
        backgroundColor: Palette.accent,
    },
    filterBtnText: {
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.semibold,
    },
    filterDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(150,150,150,0.3)',
        marginHorizontal: 4,
    },

    // ── FAB Group
    locationFabWrap: {
        position: 'absolute',
        right: Spacing.lg,
        width: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    fabGlass: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    fabFallback: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    fabInner: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabDivider: {
        height: 1,
        width: '100%',
    },

    // ── Bottom Services Card
    bottomServicesWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 110,
    },
    bottomServicesScroll: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    serviceCardWrap: {
        width: 200,
        transform: [{ scale: 1 }],
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
            android: { elevation: 4 },
        }),
    },
    serviceCard: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)', // Base border for glass
        overflow: 'hidden',
    },
    serviceTitle: {
        fontSize: Typography.size.title,
        fontWeight: Typography.weight.semibold,
        marginBottom: 2,
    },
    serviceCategory: {
        fontSize: Typography.size.caption,
        marginBottom: Spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 'auto',
    },
    ratingText: {
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.medium,
    },
});
