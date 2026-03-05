import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface GlassChipProps {
    label: string;
    icon?: IoniconName;
    selected?: boolean;
    onPress?: () => void;
}

export function GlassChip({ label, icon, selected = false, onPress }: GlassChipProps) {
    const scheme = useColorScheme() ?? 'light';
    const isDark = scheme === 'dark';

    // Adaptive colours
    const iconColor = selected
        ? Palette.accent
        : isDark
            ? 'rgba(255,255,255,0.80)'
            : 'rgba(0,0,0,0.65)';
    const labelColor = selected
        ? Palette.accentDark
        : isDark
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(0,0,0,0.75)';

    const content = (
        <TouchableOpacity
            style={[styles.touchable, selected && styles.touchableSelected]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={14}
                    color={iconColor}
                    style={styles.icon}
                />
            )}
            <Text style={[styles.label, { color: labelColor }, selected && styles.labelSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (Platform.OS === 'ios') {
        return (
            <GlassView
                style={[styles.glass, selected && styles.glassSelected]}
                glassEffectStyle="regular"
            >
                {content}
            </GlassView>
        );
    }

    // Android / Web fallback
    return (
        <View style={[
            styles.fallback,
            isDark && styles.fallbackDark,
            selected && styles.fallbackSelected,
        ]}>
            {content}
        </View>
    );
}

const styles = StyleSheet.create({
    glass: {
        height: 36,
        borderRadius: Radius.full,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    glassSelected: {
        borderWidth: 1.5,
        borderColor: Palette.accent,
        borderRadius: Radius.full,
    },
    fallback: {
        height: 36,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(255,255,255,0.88)',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'transparent',
        ...Platform.select({
            android: { elevation: 3 },
        }),
    },
    fallbackDark: {
        backgroundColor: 'rgba(50,50,55,0.90)',
    },
    fallbackSelected: {
        backgroundColor: Palette.accentLight,
        borderWidth: 1.5,
        borderColor: Palette.accent,
    },
    touchable: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        height: '100%',
    },
    touchableSelected: {},
    icon: {
        marginRight: Spacing.xs,
    },
    label: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.medium,
    },
    labelSelected: {
        fontWeight: Typography.weight.semibold,
    },
});
