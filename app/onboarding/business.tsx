import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

export default function BusinessScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color={Colors.dark.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconWrap}>
                    <Ionicons name="construct-outline" size={48} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.heading}>{Strings.onboarding.business.heading}</Text>
                <Text style={styles.subtitle}>{Strings.onboarding.business.subtitle}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: Spacing['2xl'],
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    iconWrap: {
        width: 100,
        height: 100,
        borderRadius: Radius.xl,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    heading: {
        fontSize: Typography.size['2xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: Typography.size.md,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: Typography.size.md * 1.6,
    },
});
