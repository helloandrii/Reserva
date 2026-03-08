import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface MapPinProps {
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    selected?: boolean;
}

export function MapPin({ iconName, selected }: MapPinProps) {
    const C = useThemeColors();

    // An elegant, modern sleek map pin design matching iOS/Android design standards
    return (
        <View style={styles.pinWrap}>
            <View style={[
                styles.pinBody,
                { backgroundColor: selected ? Palette.accent : C.surface, borderColor: selected ? Palette.accent : C.border },
                selected && styles.pinSelected
            ]}>
                <Ionicons
                    name={iconName}
                    size={selected ? 20 : 16}
                    color={selected ? '#FFFFFF' : Palette.accent}
                />
            </View>
            <View style={[styles.pinTail, { borderTopColor: selected ? Palette.accent : C.border }]} />
            <View style={[styles.pinTailInner, { borderTopColor: selected ? Palette.accent : C.surface }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    pinWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 52,
    },
    pinBody: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 2,
    },
    pinSelected: {
        width: 44,
        height: 44,
        borderRadius: 22,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    pinTail: {
        position: 'absolute',
        bottom: 2,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        zIndex: 1,
    },
    pinTailInner: {
        position: 'absolute',
        bottom: 4,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        zIndex: 3,
    }
});
