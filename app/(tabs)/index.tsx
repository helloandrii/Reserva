import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<TextInput | null>(null);
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const animatedBottom = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Location permission required',
                    'We need access to your location to show your position on the map.',
                );
                setHasLocationPermission(false);
                return;
            }

            setHasLocationPermission(true);
        })();
    }, []);

    useEffect(() => {
        const showEvent =
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent =
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        if (isSearchActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchActive]);

    const isKeyboardVisible = keyboardHeight > 0;

    useEffect(() => {
        const targetBottom = isKeyboardVisible
            ? keyboardHeight + 16
            : insets.bottom + 64;

        Animated.timing(animatedBottom, {
            toValue: targetBottom,
            duration: 160,
            easing: undefined,
            useNativeDriver: false,
        }).start();
    }, [animatedBottom, insets.bottom, isKeyboardVisible, keyboardHeight]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation={hasLocationPermission === true}
                initialRegion={{
                    latitude: 48.1486,
                    longitude: 17.1077,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />
            <Animated.View
                style={[
                    styles.searchContainer,
                    { bottom: animatedBottom },
                ]}
            >
                <GlassView glassEffectStyle="regular" style={styles.searchGlass}>
                    {isSearchActive ? (
                        <View style={styles.searchContent}>
                            <Ionicons name="search" size={20} color="#000" />
                            <TextInput
                                ref={inputRef}
                                style={styles.searchInput}
                                placeholder="Search services"
                                placeholderTextColor="rgba(0,0,0,0.5)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                            />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.searchContent}
                            activeOpacity={0.9}
                            onPress={() => setIsSearchActive(true)}
                        >
                            <Ionicons name="search" size={20} color="#000" />
                            <Text style={styles.searchPlaceholder}>Search services</Text>
                        </TouchableOpacity>
                    )}
                </GlassView>
                {isSearchActive && (
                    <TouchableOpacity
                        style={styles.closeGlass}
                        activeOpacity={0.9}
                        onPress={() => {
                            setIsSearchActive(false);
                            setSearchQuery('');
                            Keyboard.dismiss();
                        }}
                    >
                        <GlassView
                            glassEffectStyle="regular"
                            style={StyleSheet.absoluteFillObject}
                        />
                        <Ionicons name="close" size={22} color="#000" />
                    </TouchableOpacity>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    searchContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchGlass: {
        flex: 1,
        borderRadius: 99,
        overflow: 'hidden',
        minHeight: 54,
        maxWidth: 640,
        alignSelf: 'center',
    },
    searchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 8,
        height: 54,
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: 16,
        textAlign: 'left',
        color: 'rgba(0,0,0,0.7)',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
        color: '#000',
    },
    closeGlass: {
        marginLeft: 12,
        width: 54,
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
