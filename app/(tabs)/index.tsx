import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Radius, Spacing, Typography } from '@/constants/theme';

const CATEGORIES = Strings.map.categories;

// ─── Category Chip ────────────────────────────────────────────────────────────

function CategoryChip({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MapScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [hasLocation, setHasLocation] = useState<boolean | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const inputRef = useRef<TextInput>(null);
    const searchBarAnim = useRef(new Animated.Value(0)).current;

    // Request location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setHasLocation(false);
                return;
            }
            setHasLocation(true);
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        })();
    }, []);

    // Search focus animation
    useEffect(() => {
        Animated.timing(searchBarAnim, {
            toValue: isSearchActive ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        if (isSearchActive) inputRef.current?.focus();
    }, [isSearchActive]);

    const handleSearchBlur = () => {
        if (!searchQuery) {
            setIsSearchActive(false);
            Keyboard.dismiss();
        }
    };

    const mapRegion = userLocation
        ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
        : { latitude: 48.1486, longitude: 17.1077, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

    const headerTop = insets.top + Spacing.sm;

    return (
        <View style={styles.container}>
            {/* Full-screen map */}
            <MapView
                style={StyleSheet.absoluteFillObject}
                showsUserLocation={hasLocation === true}
                showsMyLocationButton={false}
                region={mapRegion}
                mapType="standard"
            />

            {/* ── Top overlay: search + categories ── */}
            <View style={[styles.topOverlay, { top: headerTop }]}>

                {/* Search bar */}
                <View style={styles.searchBar}>
                    {/* Left: Logo / back when active */}
                    {isSearchActive ? (
                        <TouchableOpacity
                            style={styles.searchIconBtn}
                            onPress={() => {
                                setIsSearchActive(false);
                                setSearchQuery('');
                                Keyboard.dismiss();
                            }}
                        >
                            <Ionicons name="chevron-back" size={22} color="#000" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.logoBox}>
                            <Ionicons name="calendar" size={18} color="#000" />
                        </View>
                    )}

                    {/* Input */}
                    <TouchableOpacity
                        style={styles.searchInputArea}
                        activeOpacity={1}
                        onPress={() => setIsSearchActive(true)}
                    >
                        {isSearchActive ? (
                            <TextInput
                                ref={inputRef}
                                style={styles.searchInput}
                                placeholder={Strings.map.searchPlaceholder}
                                placeholderTextColor="rgba(0,0,0,0.4)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onBlur={handleSearchBlur}
                                returnKeyType="search"
                                autoCorrect={false}
                            />
                        ) : (
                            <Text style={styles.searchPlaceholder}>
                                {Strings.map.searchPlaceholder}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Right: mic */}
                    <TouchableOpacity style={styles.searchIconBtn}>
                        <Ionicons name="mic" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Category chips — hidden when search is active */}
                {!isSearchActive && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                        keyboardShouldPersistTaps="handled"
                    >
                        {CATEGORIES.map((cat) => (
                            <CategoryChip
                                key={cat}
                                label={cat}
                                selected={selectedCategory === cat}
                                onPress={() =>
                                    setSelectedCategory(selectedCategory === cat ? null : cat)
                                }
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
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

    // ── Search bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.lg,
        height: 52,
        borderRadius: Radius.full,
        backgroundColor: '#fff',
        paddingHorizontal: Spacing.sm,
        gap: Spacing.xs,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
            },
            android: { elevation: 6 },
        }),
    },
    logoBox: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchIconBtn: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInputArea: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    searchPlaceholder: {
        fontSize: Typography.size.md,
        color: 'rgba(0,0,0,0.45)',
    },
    searchInput: {
        fontSize: Typography.size.md,
        color: '#000',
        paddingVertical: 0,
    },

    // ── Category chips
    chipsRow: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        paddingVertical: 2,
    },
    chip: {
        height: 36,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radius.full,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: { elevation: 3 },
        }),
    },
    chipSelected: {
        backgroundColor: '#000',
    },
    chipText: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.medium,
        color: '#111',
    },
    chipTextSelected: {
        color: '#fff',
    },
});
