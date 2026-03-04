import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Typography } from '@/constants/theme';

export default function PrivacyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 32) }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.updated}>Last updated: March 2026</Text>

                <Section title="1. Information We Collect">
                    We collect information you provide directly (name, email, profile photo) and
                    information generated through your use of the app (bookings, search history,
                    location data).
                </Section>

                <Section title="2. How We Use Your Information">
                    We use your information to operate the app, process bookings, personalise your
                    experience, and improve our services. We do not sell your personal data.
                </Section>

                <Section title="3. Location Data">
                    We request access to your location to show nearby services. Location is only
                    collected while the app is in use and is not stored on our servers.
                </Section>

                <Section title="4. Third-Party Services">
                    We use Firebase (Google) for authentication, database, and storage. Your data
                    is stored securely in Google Cloud. See Google's Privacy Policy for details.
                </Section>

                <Section title="5. Data Retention">
                    We retain your data for as long as your account is active. You can delete your
                    account and all associated data at any time from the Profile screen.
                </Section>

                <Section title="6. Cookies and Analytics">
                    We use Firebase Analytics to understand how users interact with the app. This
                    data is anonymised and aggregated.
                </Section>

                <Section title="7. Your Rights">
                    You have the right to access, correct, or delete your personal data. Contact
                    us at privacy@reserva.app to exercise these rights.
                </Section>

                <Section title="8. Changes to This Policy">
                    We may update this Privacy Policy. We will notify you of significant changes
                    via the app.
                </Section>

                <Section title="9. Contact">
                    For privacy inquiries, contact us at privacy@reserva.app.
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
