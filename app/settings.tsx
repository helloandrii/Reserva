import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/useThemeColors';
import * as Linking from 'expo-linking';
import { useState } from 'react';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, profile } = useAuth();
    const C = useThemeColors();
    const isDark = useColorScheme() === 'dark';

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: C.backgroundSecondary, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={C.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: C.text }]}>Settings</Text>
                <View style={{ width: 44 }} /> {/* Spacer */}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + Spacing['2xl'] }}>
                {/* Account Section */}
                <Text style={[styles.sectionHeader, { color: C.textSecondary }]}>ACCOUNT</Text>
                <View style={[styles.sectionGroup, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <SettingRow icon="person-outline" label="Name" value={profile?.displayName || 'User'} C={C} />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SettingRow icon="mail-outline" label="Email" value={profile?.email || '—'} C={C} />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SettingRow icon="call-outline" label="Phone" value={profile?.phoneNumber || '—'} C={C} />
                </View>

                {/* Preferences Section */}
                <Text style={[styles.sectionHeader, { color: C.textSecondary }]}>PREFERENCES</Text>
                <View style={[styles.sectionGroup, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <SettingToggle
                        icon="notifications-outline" label="Push Notifications"
                        value={pushEnabled} onValueChange={setPushEnabled} C={C}
                    />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SettingToggle
                        icon="mail-unread-outline" label="Email Updates"
                        value={emailEnabled} onValueChange={setEmailEnabled} C={C}
                    />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SettingRow
                        icon="moon-outline" label="Theme"
                        value={isDark ? 'Dark Mode' : 'Light Mode'}
                        subValue="System Default" C={C}
                    />
                </View>

                {/* System Settings Section (For OS Level overrides) */}
                <Text style={[styles.sectionHeader, { color: C.textSecondary }]}>SYSTEM SETTINGS</Text>
                <View style={[styles.sectionGroup, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <SettingLink
                        icon="settings-outline"
                        label="Open Device Settings"
                        onPress={() => Linking.openSettings()}
                        C={C}
                    />
                </View>

                {/* About Section */}
                <Text style={[styles.sectionHeader, { color: C.textSecondary }]}>ABOUT</Text>
                <View style={[styles.sectionGroup, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <SettingRow icon="information-circle-outline" label="App Version" value="1.0.0 (Build 42)" C={C} />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SettingLink icon="document-text-outline" label="Terms of Service" C={C} />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SettingLink icon="shield-checkmark-outline" label="Privacy Policy" C={C} />
                </View>

                {/* Danger Zone */}
                {user && (
                    <TouchableOpacity style={[styles.signOutBtn, { backgroundColor: C.surface, borderColor: C.border }]} activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={20} color={Palette.error} />
                        <Text style={[styles.signOutText, { color: Palette.error }]}>Sign Out</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SettingRow({ icon, label, value, subValue, C }: any) {
    return (
        <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: C.backgroundSecondary }]}>
                <Ionicons name={icon} size={18} color={C.textSecondary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
            <View style={styles.valueWrap}>
                <Text style={[styles.rowValue, { color: C.textSecondary }]}>{value}</Text>
                {subValue && <Text style={[styles.rowSubValue, { color: C.textTertiary }]}>{subValue}</Text>}
            </View>
        </View>
    );
}

function SettingToggle({ icon, label, value, onValueChange, C }: any) {
    return (
        <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: C.backgroundSecondary }]}>
                <Ionicons name={icon} size={18} color={C.textSecondary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: C.border, true: Palette.accent }}
            />
        </View>
    );
}

function SettingLink({ icon, label, onPress, C }: any) {
    return (
        <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
            <View style={[styles.iconWrap, { backgroundColor: C.backgroundSecondary }]}>
                <Ionicons name={icon} size={18} color={C.textSecondary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.textTertiary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: {
        padding: Spacing.sm,
        width: 44,
        alignItems: 'center',
    },
    title: {
        fontSize: Typography.size.lg,
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: Typography.size.xs,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginLeft: Spacing['2xl'],
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    sectionGroup: {
        marginHorizontal: Spacing.lg,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: Spacing['3xl'] + 20, // aligns with text
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    rowLabel: {
        flex: 1,
        fontSize: Typography.size.md,
    },
    valueWrap: {
        alignItems: 'flex-end',
    },
    rowValue: {
        fontSize: Typography.size.md,
    },
    rowSubValue: {
        fontSize: Typography.size.xs,
        marginTop: 2,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.lg,
        marginTop: Spacing['2xl'],
        paddingVertical: Spacing.lg,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        gap: Spacing.sm,
    },
    signOutText: {
        fontSize: Typography.size.md,
        fontWeight: '600',
    },
});
