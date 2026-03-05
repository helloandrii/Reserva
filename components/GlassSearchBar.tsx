import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassSearchBarProps {
    value: string;
    placeholder?: string;
    active: boolean;
    onPress?: () => void;
    onChangeText?: (text: string) => void;
    onBack?: () => void;
    onBlur?: () => void;
    inputRef?: React.RefObject<TextInput | null>;
    onMicPress?: () => void;
}

export function GlassSearchBar({
    value,
    placeholder = 'Search...',
    active,
    onPress,
    onChangeText,
    onBack,
    onBlur,
    inputRef,
    onMicPress,
}: GlassSearchBarProps) {
    const scheme = useColorScheme() ?? 'light';
    const isDark = scheme === 'dark';

    const shineAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shineAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(shineAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, [shineAnim]);

    // Adaptive colours
    const iconColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.70)';
    const placeholderColor = isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.35)';
    const inputColor = isDark ? 'rgba(255,255,255,0.90)' : 'rgba(0,0,0,0.85)';
    const placeholderText = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)';

    const handleMicPress = () => {
        // Open OS keyboard (which has built-in mic dictation) and activate search
        if (onMicPress) {
            onMicPress();
        } else if (onPress) {
            onPress();
            // Focus the input after a tick so it becomes active
            setTimeout(() => inputRef?.current?.focus(), 50);
        }
    };

    const inner = (
        <View style={styles.row}>
            {/* Left: back btn or logo */}
            {active ? (
                <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                    <Ionicons name="chevron-back" size={22} color={iconColor} />
                </TouchableOpacity>
            ) : (
                <View style={styles.logoBox}>
                    <Text style={[styles.staticR, { color: Palette.accent }]}>R</Text>
                </View>
            )}

            {/* Input / placeholder */}
            <TouchableOpacity
                style={styles.inputArea}
                activeOpacity={1}
                onPress={!active ? onPress : undefined}
            >
                {active ? (
                    <TextInput
                        ref={inputRef}
                        style={[styles.input, { color: inputColor }]}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderColor}
                        value={value}
                        onChangeText={onChangeText}
                        onBlur={onBlur}
                        returnKeyType="search"
                        autoFocus
                        autoCorrect={false}
                        keyboardAppearance={isDark ? 'dark' : 'light'}
                    />
                ) : (
                    <Text style={[styles.placeholder, { color: placeholderText }]}>{placeholder}</Text>
                )}
            </TouchableOpacity>

            {/* Right: mic */}
            {!active && (
                <TouchableOpacity style={styles.iconBtn} onPress={handleMicPress}>
                    <Ionicons name="mic" size={20} color={iconColor} />
                </TouchableOpacity>
            )}
        </View>
    );

    if (Platform.OS === 'ios') {
        return (
            <GlassView style={styles.glass} glassEffectStyle="regular">
                {inner}
            </GlassView>
        );
    }

    return (
        <View style={[styles.fallback, isDark && styles.fallbackDark]}>
            {inner}
        </View>
    );
}

const styles = StyleSheet.create({
    glass: {
        height: 52,
        borderRadius: Radius.full,
        marginHorizontal: Spacing.lg,
        overflow: 'hidden',
    },
    fallback: {
        height: 52,
        borderRadius: Radius.full,
        marginHorizontal: Spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.92)',
        ...Platform.select({
            android: { elevation: 6 },
        }),
    },
    fallbackDark: {
        backgroundColor: 'rgba(40,40,45,0.92)',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        gap: Spacing.xs,
        height: '100%',
    },
    logoBox: {
        width: 34,
        height: 34,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    staticR: {
        color: Palette.accent,
        fontSize: 22,
        fontWeight: '900',
        paddingHorizontal: 12, // More padding on bottom to offset Android/iOS font baseline
        textAlign: 'center',
        textShadowColor: Palette.accent,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    iconBtn: {
        width: 34,
        height: 34,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputArea: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    placeholder: {
        fontSize: Typography.size.md,
    },
    input: {
        fontSize: Typography.size.md,
        paddingVertical: 0,
    },
});
