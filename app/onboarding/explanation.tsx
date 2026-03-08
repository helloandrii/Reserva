import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function ExplanationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: C.backgroundSecondary }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={22} color={C.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.iconWrap, { backgroundColor: C.backgroundSecondary, borderColor: C.border }]}>
                    <Ionicons name="help-circle" size={48} color={C.textSecondary} />
                </View>

                <Text style={[styles.title, { color: C.text }]}>Which one are you?</Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: C.text }]}>I want to book services</Text>
                    <Text style={[styles.bodyText, { color: C.textSecondary }]}>
                        If you are looking for places to get a haircut, get your house cleaned, book a massage, or find a language tutor, you are a <Text style={{ fontWeight: Typography.weight.bold, color: C.text }}>User</Text>.
                        You will use Reserva to explore the map, find service providers near you, and schedule appointments effortlessly.
                    </Text>
                </View>

                <View style={styles.dividerWrap}>
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: C.text }]}>I provide services</Text>
                    <Text style={[styles.bodyText, { color: C.textSecondary }]}>
                        If you own a salon, offer freelance photography, clean houses, or provide any other service, you are a <Text style={{ fontWeight: Typography.weight.bold, color: C.text }}>Business</Text>.
                        You will use Reserva to list your business on the map, manage your schedule, and accept bookings from clients automatically.
                    </Text>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.okButton, { backgroundColor: C.text }]}
                    onPress={() => router.back()}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.okButtonText, { color: C.background }]}>Got it!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: Spacing['2xl'] },
    header: { marginBottom: Spacing.xl },
    backButton: {
        width: 40, height: 40,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { paddingBottom: Spacing['4xl'] },
    iconWrap: {
        width: 80, height: 80,
        borderRadius: Radius.xl,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.5,
        marginBottom: Spacing['2xl'],
    },
    section: { gap: Spacing.sm },
    sectionTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.5,
    },
    bodyText: {
        fontSize: Typography.size.body,
        lineHeight: Typography.size.body * 1.6,
    },
    dividerWrap: { paddingVertical: Spacing.xl },
    divider: { height: 1, width: '100%' },
    footer: { paddingTop: Spacing.md },
    okButton: {
        height: 56,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    okButtonText: {
        fontSize: Typography.size.title,
        fontWeight: Typography.weight.semibold,
    },
});
