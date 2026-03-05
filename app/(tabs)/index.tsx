import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassChip } from '@/components/GlassChip';
import { GlassSearchBar } from '@/components/GlassSearchBar';
import { Strings } from '@/constants/strings';
import { Palette, Spacing } from '@/constants/theme';
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
    const mapRef = useRef<MapView>(null);
    const inputRef = useRef<TextInput>(null);

    const [hasLocation, setHasLocation] = useState<boolean | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

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
                region={mapRegion}
                mapType={mapType}
            />

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
            </View>

            {/* ── FAB Group (Layers & Location) ── */}
            {!isSearchActive && (
                <View style={[styles.locationFabWrap, { bottom: insets.bottom + 100 }]}>
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

    // ── FAB Group
    locationFabWrap: {
        position: 'absolute',
        right: Spacing.lg,
        width: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    fabGlass: {
        borderRadius: 22,
        overflow: 'hidden',
    },
    fabFallback: {
        borderRadius: 22,
        overflow: 'hidden',
    },
    fabInner: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabDivider: {
        height: 1,
        width: '100%',
    },
});
