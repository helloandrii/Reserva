import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface GlassChipProps {
    label: string;
    icon?: IoniconName;
    selected?: boolean;
    onPress?: () => void;
}

export function GlassChip({ label, icon, selected = false, onPress }: GlassChipProps) {
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
                    color={selected ? Palette.accent : 'rgba(0,0,0,0.65)'}
                    style={styles.icon}
                />
            )}
            <Text style={[styles.label, selected && styles.labelSelected]}>
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
        <View style={[styles.fallback, selected && styles.fallbackSelected]}>
            {content}
        </View>
    );
}

const styles = StyleSheet.create({
    glass: {
        height: 36,
        borderRadius: Radius.full,
        overflow: 'hidden',
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
        ...Platform.select({
            android: { elevation: 3 },
        }),
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
        color: 'rgba(0,0,0,0.75)',
    },
    labelSelected: {
        color: Palette.accentDark,
        fontWeight: Typography.weight.semibold,
    },
});
