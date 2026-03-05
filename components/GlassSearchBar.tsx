import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/theme';

interface GlassSearchBarProps {
    value: string;
    placeholder?: string;
    active: boolean;
    onPress?: () => void;
    onChangeText?: (text: string) => void;
    onBack?: () => void;
    onBlur?: () => void;
    inputRef?: React.RefObject<TextInput | null>;
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
}: GlassSearchBarProps) {
    const inner = (
        <View style={styles.row}>
            {/* Left: back btn or logo */}
            {active ? (
                <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                    <Ionicons name="chevron-back" size={22} color="rgba(0,0,0,0.7)" />
                </TouchableOpacity>
            ) : (
                <View style={styles.logoBox}>
                    <Ionicons name="calendar" size={17} color="rgba(0,0,0,0.7)" />
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
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        value={value}
                        onChangeText={onChangeText}
                        onBlur={onBlur}
                        returnKeyType="search"
                        autoFocus
                        autoCorrect={false}
                    />
                ) : (
                    <Text style={styles.placeholder}>{placeholder}</Text>
                )}
            </TouchableOpacity>

            {/* Right: mic */}
            {!active && (
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="mic" size={20} color="rgba(0,0,0,0.6)" />
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

    return <View style={styles.fallback}>{inner}</View>;
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
        backgroundColor: 'rgba(255,255,255,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
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
        color: 'rgba(0,0,0,0.38)',
    },
    input: {
        fontSize: Typography.size.md,
        color: 'rgba(0,0,0,0.85)',
        paddingVertical: 0,
    },
});
