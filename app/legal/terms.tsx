import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Typography } from '@/constants/theme';

export default function TermsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 32) }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.updated}>Last updated: March 2026</Text>

                <Section title="1. Acceptance of Terms">
                    By using Reserva, you agree to these Terms of Service. If you do not agree,
                    please do not use the app.
                </Section>

                <Section title="2. Use of the Service">
                    Reserva allows users to discover and book local services. You agree to use the
                    platform only for lawful purposes and in a way that does not infringe the rights
                    of others.
                </Section>

                <Section title="3. User Accounts">
                    You are responsible for maintaining the confidentiality of your account
                    credentials and for all activities that occur under your account.
                </Section>

                <Section title="4. Bookings">
                    Reserva facilitates bookings between users and service providers. We are not
                    responsible for the quality of services provided by third parties.
                </Section>

                <Section title="5. Intellectual Property">
                    All content, branding, and software in Reserva is owned by or licensed to us.
                    You may not reproduce or distribute it without our consent.
                </Section>

                <Section title="6. Termination">
                    We reserve the right to suspend or terminate your account if you violate these
                    Terms.
                </Section>

                <Section title="7. Changes to Terms">
                    We may update these Terms from time to time. Continued use of the app
                    constitutes acceptance of the updated Terms.
                </Section>

                <Section title="8. Contact">
                    For questions about these Terms, contact us at legal@reserva.app.
                </Section>
            </ScrollView>
        </View>
    );
}

function Section({ title, children }: { title: string; children: string }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionBody}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#111',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: Colors.dark.text,
    },
    scroll: { flex: 1 },
    content: { padding: Spacing['2xl'], gap: Spacing.xl },
    updated: {
        fontSize: Typography.size.sm,
        color: Colors.dark.textTertiary,
        marginBottom: Spacing.sm,
    },
    section: { gap: Spacing.sm },
    sectionTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: Colors.dark.text,
    },
    sectionBody: {
        fontSize: Typography.size.md,
        color: Colors.dark.textSecondary,
        lineHeight: Typography.size.md * 1.6,
    },
});
