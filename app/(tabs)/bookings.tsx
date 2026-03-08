import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { updateUser, uploadProfilePhoto } from '@/src/services/userService';
import { useBookingsStore } from '@/src/store/bookingsStore';
import type { Booking } from '@/src/types';
import { formatDate, formatTime } from '@/src/utils/formatters';

// ─── Compact Profile Widget ───────────────────────────────────────────────────

function ProfileWidget() {
    const { user, profile } = useAuth();
    const C = useThemeColors();
    const [expanded, setExpanded] = useState(false);
    const [editingField, setEditingField] = useState<'displayName' | 'phoneNumber' | null>(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const expandAnim = useRef(new Animated.Value(0)).current;
    const colorScheme = useColorScheme();

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;
        setExpanded(!expanded);
        Animated.spring(expandAnim, { toValue, useNativeDriver: false, bounciness: 4 }).start();
    };

    const expandedHeight = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] });

    const handleEditField = (field: 'displayName' | 'phoneNumber') => {
        setEditingField(field);
        setEditValue(field === 'displayName' ? (profile?.displayName ?? '') : (profile?.phoneNumber ?? ''));
    };

    const handleSaveField = async () => {
        if (!user || !editingField) return;
        setSaving(true);
        try {
            await updateUser(user.uid, { [editingField]: editValue });
        } finally {
            setSaving(false);
            setEditingField(null);
        }
    };

    const handlePickPhoto = async () => {
        if (!user) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            await uploadProfilePhoto(user.uid, result.assets[0].uri);
        }
    };

    if (!user) {
        return (
            <View style={[styles.profileWidget, { backgroundColor: C.surface, borderColor: C.border }]}>
                <View style={styles.profileWidgetRow}>
                    <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: C.backgroundTertiary }]}>
                        <Ionicons name="person-outline" size={20} color={C.textTertiary} />
                    </View>
                    <View style={styles.profileWidgetInfo}>
                        <Text style={[styles.profileWidgetName, { color: C.text }]}>Sign in to continue</Text>
                        <Text style={[styles.profileWidgetSub, { color: C.textSecondary }]}>Access your bookings and profile</Text>
                    </View>
                    <TouchableOpacity style={[styles.signInChip, { backgroundColor: Palette.accent }]}>
                        <Text style={styles.signInChipText}>Sign in</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.profileWidget, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TouchableOpacity style={styles.profileWidgetRow} onPress={toggleExpand} activeOpacity={0.8}>
                <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrap}>
                    {profile?.photoURL ? (
                        <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: C.backgroundTertiary }]}>
                            <Text style={[styles.avatarInitial, { color: Palette.accent }]}>
                                {(profile?.displayName ?? 'U')[0].toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.avatarEditBadge, { backgroundColor: C.backgroundSecondary }]}>
                        <Ionicons name="camera" size={10} color={C.textSecondary} />
                    </View>
                </TouchableOpacity>

                <View style={styles.profileWidgetInfo}>
                    <Text style={[styles.profileWidgetName, { color: C.text }]} numberOfLines={1}>
                        {profile?.displayName ?? 'User'}
                    </Text>
                    <Text style={[styles.profileWidgetSub, { color: C.textSecondary }]} numberOfLines={1}>
                        {profile?.usedServicesCount ?? 0} bookings · {profile?.savedServiceIds?.length ?? 0} saved
                    </Text>
                </View>

                <Animated.View style={{
                    transform: [{
                        rotate: expandAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })
                    }]
                }}>
                    <Ionicons name="chevron-down" size={18} color={C.textSecondary} />
                </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[styles.profileExpanded, { maxHeight: expandedHeight, overflow: 'hidden' }]}>
                <View style={[styles.expandedDivider, { backgroundColor: C.border }]} />
                <EditableRow
                    icon="person-outline" label="Name" value={profile?.displayName ?? ''}
                    isEditing={editingField === 'displayName'} editValue={editValue}
                    onEdit={() => handleEditField('displayName')} onChangeText={setEditValue}
                    onSave={handleSaveField} onCancel={() => setEditingField(null)} saving={saving}
                    C={C} colorScheme={colorScheme}
                />
                <EditableRow
                    icon="call-outline" label="Phone" value={profile?.phoneNumber ?? '—'}
                    isEditing={editingField === 'phoneNumber'} editValue={editValue}
                    onEdit={() => handleEditField('phoneNumber')} onChangeText={setEditValue}
                    onSave={handleSaveField} onCancel={() => setEditingField(null)} saving={saving}
                    keyboardType="phone-pad" C={C} colorScheme={colorScheme}
                />
                <View style={styles.editRow}>
                    <Ionicons name="mail-outline" size={16} color={C.textSecondary} />
                    <View style={styles.editRowContent}>
                        <Text style={[styles.editRowLabel, { color: C.textTertiary }]}>Email</Text>
                        <Text style={[styles.editRowValue, { color: C.text }]} numberOfLines={1}>{profile?.email ?? '—'}</Text>
                    </View>
                </View>
                <View style={[styles.statsRow, { backgroundColor: C.backgroundSecondary }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statNum, { color: Palette.accent }]}>{profile?.usedServicesCount ?? 0}</Text>
                        <Text style={[styles.statLabel, { color: C.textSecondary }]}>Used</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: C.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNum, { color: Palette.accent }]}>{profile?.savedServiceIds?.length ?? 0}</Text>
                        <Text style={[styles.statLabel, { color: C.textSecondary }]}>Saved</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

// ─── Editable Row ─────────────────────────────────────────────────────────────

function EditableRow({
    icon, label, value, isEditing, editValue,
    onEdit, onChangeText, onSave, onCancel, saving, keyboardType, C, colorScheme,
}: {
    icon: any; label: string; value: string;
    isEditing: boolean; editValue: string;
    onEdit: () => void; onChangeText: (v: string) => void;
    onSave: () => void; onCancel: () => void;
    saving?: boolean; keyboardType?: any;
    C: ReturnType<typeof useThemeColors>;
    colorScheme: ReturnType<typeof useColorScheme>;
}) {
    return (
        <View style={styles.editRow}>
            <Ionicons name={icon} size={16} color={C.textSecondary} />
            <View style={styles.editRowContent}>
                <Text style={[styles.editRowLabel, { color: C.textTertiary }]}>{label}</Text>
                {isEditing ? (
                    <View style={styles.editInputRow}>
                        <TextInput
                            style={[styles.editInput, { color: C.text, borderBottomColor: C.tint }]}
                            value={editValue}
                            onChangeText={onChangeText}
                            autoFocus
                            keyboardType={keyboardType}
                            keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                        />
                        {saving ? (
                            <ActivityIndicator size="small" color={C.tint} />
                        ) : (
                            <>
                                <TouchableOpacity onPress={onSave}>
                                    <Ionicons name="checkmark" size={18} color={C.success} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onCancel}>
                                    <Ionicons name="close" size={18} color={C.error} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                ) : (
                    <Text style={[styles.editRowValue, { color: C.text }]} numberOfLines={1}>{value}</Text>
                )}
            </View>
            {!isEditing && (
                <TouchableOpacity onPress={onEdit} style={styles.editPencil}>
                    <Ionicons name="pencil" size={14} color={C.textTertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
    const C = useThemeColors();
    const S = Strings.bookings;
    const statusColor =
        booking.status === 'upcoming' ? C.success :
            booking.status === 'cancelled' ? C.error : C.textSecondary;

    return (
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.cardAvatar, { backgroundColor: C.backgroundSecondary }]}>
                    <Ionicons name="storefront-outline" size={22} color={C.textSecondary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardService, { color: C.text }]} numberOfLines={1}>{booking.serviceName}</Text>
                    <Text style={[styles.cardBusiness, { color: C.textSecondary }]} numberOfLines={1}>{booking.businessName}</Text>
                </View>
                <View style={[styles.statusPill, { borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {S.status[booking.status] ?? booking.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardMeta}>
                <MetaRow icon="calendar-outline" text={formatDate(booking.startTime)} C={C} />
                <MetaRow icon="time-outline" text={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} C={C} />
                <MetaRow icon="location-outline" text={booking.address} C={C} />
                {booking.notes ? <MetaRow icon="document-text-outline" text={booking.notes} C={C} /> : null}
            </View>

            {booking.status === 'upcoming' && (
                <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.calendarBtn, {
                        borderColor: C.tintBackground,
                        backgroundColor: C.tintBackground,
                    }]}>
                        <Ionicons name="calendar-outline" size={14} color={C.tint} />
                        <Text style={[styles.calendarBtnText, { color: C.tint }]}>Add to Calendar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cancelButton, {
                        borderColor: C.error + '44',
                        backgroundColor: C.error + '11',
                    }]} onPress={() => onCancel(booking.id)}>
                        <Text style={[styles.cancelText, { color: C.error }]}>{S.cancel}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

function MetaRow({ icon, text, C }: { icon: any; text: string; C: ReturnType<typeof useThemeColors> }) {
    return (
        <View style={styles.metaRow}>
            <Ionicons name={icon} size={14} color={C.textTertiary} />
            <Text style={[styles.metaText, { color: C.textSecondary }]} numberOfLines={2}>{text}</Text>
        </View>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: 'upcoming' | 'past' }) {
    const C = useThemeColors();
    const S = Strings.bookings.empty;
    return (
        <View style={styles.emptyWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: C.backgroundSecondary, borderColor: C.border }]}>
                <Ionicons name="calendar-outline" size={40} color={C.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.text }]}>{tab === 'upcoming' ? S.upcoming : S.past}</Text>
            <Text style={[styles.emptySubtitle, { color: C.textSecondary }]}>{tab === 'upcoming' ? S.upcomingSubtitle : S.pastSubtitle}</Text>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BookingsScreen() {
    const insets = useSafeAreaInsets();
    const C = useThemeColors();
    const router = useRouter();
    const { user } = useAuth();
    const { bookings, activeTab, loadingState, fetchBookings, cancelBooking, setActiveTab } = useBookingsStore();

    useEffect(() => {
        if (user) fetchBookings(user.uid);
    }, [user, activeTab]);

    const tabs = [
        { key: 'upcoming' as const, label: Strings.bookings.upcoming },
        { key: 'past' as const, label: Strings.bookings.past },
    ];

    const filteredBookings = bookings.filter((b) =>
        activeTab === 'upcoming' ? b.status === 'upcoming' : b.status !== 'upcoming',
    );

    return (
        <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: C.text }]}>{Strings.bookings.title}</Text>
                <Link href="/settings" asChild>
                    <TouchableOpacity
                        style={[styles.settingsBtn, { backgroundColor: C.backgroundSecondary }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={20} color={C.textSecondary} />
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Profile widget */}
            <ProfileWidget />

            {/* Segmented control */}
            <View style={[styles.segmentedWrap, { backgroundColor: C.backgroundSecondary }]}>
                {tabs.map((t) => (
                    <TouchableOpacity
                        key={t.key}
                        style={[
                            styles.segmentBtn,
                            activeTab === t.key && { backgroundColor: C.background },
                        ]}
                        onPress={() => setActiveTab(t.key)}
                    >
                        <Text style={[
                            styles.segmentText,
                            { color: C.textSecondary },
                            activeTab === t.key && { color: C.text, fontWeight: Typography.weight.semibold },
                        ]}>
                            {t.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bookings list */}
            {loadingState === 'loading' && bookings.length === 0 ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={C.tint} />
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={(b) => b.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loadingState === 'loading'}
                            onRefresh={() => user && fetchBookings(user.uid)}
                            tintColor={C.tint}
                        />
                    }
                    renderItem={({ item }) => <BookingCard booking={item} onCancel={cancelBooking} />}
                    ListEmptyComponent={<EmptyState tab={activeTab} />}
                />
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    settingsBtn: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Typography.size.display,
        fontWeight: Typography.weight.bold,
        letterSpacing: -1,
    },

    // ── Profile widget
    profileWidget: {
        marginHorizontal: Spacing['2xl'],
        marginBottom: Spacing.md,
        borderRadius: Radius.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },
    profileWidgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.md,
    },
    avatarWrap: { position: 'relative' },
    avatar: { width: 44, height: 44, borderRadius: Radius.full },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: Typography.size.title, fontWeight: Typography.weight.bold },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0, right: 0,
        width: 16, height: 16,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileWidgetInfo: { flex: 1 },
    profileWidgetName: { fontSize: Typography.size.body, fontWeight: Typography.weight.semibold },
    profileWidgetSub: { fontSize: Typography.size.caption, marginTop: 2 },

    signInChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
    },
    signInChipText: { fontSize: Typography.size.caption, fontWeight: Typography.weight.semibold, color: '#fff' },

    profileExpanded: {},
    expandedDivider: { height: 1, marginHorizontal: Spacing.md },

    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    editRowContent: { flex: 1 },
    editRowLabel: { fontSize: Typography.size.xs, marginBottom: 2 },
    editRowValue: { fontSize: Typography.size.body },
    editInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    editInput: {
        flex: 1,
        fontSize: Typography.size.body,
        borderBottomWidth: 1,
        paddingVertical: 2,
    },
    editPencil: { padding: Spacing.sm },

    statsRow: {
        flexDirection: 'row',
        marginHorizontal: Spacing.md,
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
        borderRadius: Radius.md,
        overflow: 'hidden',
    },
    statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    statNum: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
    statLabel: { fontSize: Typography.size.xs, marginTop: 2 },
    statDivider: { width: 1, marginVertical: Spacing.sm },

    segmentedWrap: {
        flexDirection: 'row',
        marginHorizontal: Spacing['2xl'],
        borderRadius: Radius.lg,
        padding: 4,
        marginBottom: Spacing.lg,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: Radius.md,
    },
    segmentText: { fontSize: Typography.size.body, fontWeight: Typography.weight.medium },

    listContent: { paddingHorizontal: Spacing['2xl'], gap: Spacing.md, flexGrow: 1 },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    card: {
        borderRadius: Radius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    cardAvatar: {
        width: 44, height: 44,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: { flex: 1 },
    cardService: { fontSize: Typography.size.title, fontWeight: Typography.weight.semibold },
    cardBusiness: { fontSize: Typography.size.caption, marginTop: 2 },
    statusPill: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    statusText: { fontSize: 11, fontWeight: Typography.weight.semibold },
    cardMeta: { gap: Spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
    metaText: { fontSize: Typography.size.caption, flex: 1 },

    cardActions: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
    calendarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
    },
    calendarBtnText: { fontSize: Typography.size.caption, fontWeight: Typography.weight.medium },
    cancelButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
    },
    cancelText: { fontSize: Typography.size.caption, fontWeight: Typography.weight.medium },

    emptyWrap: {
        alignItems: 'center',
        gap: Spacing.lg,
        paddingHorizontal: Spacing['3xl'],
        paddingTop: Spacing['3xl'],
    },
    emptyIcon: {
        width: 80, height: 80,
        borderRadius: Radius.xl,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, textAlign: 'center' },
    emptySubtitle: { fontSize: Typography.size.body, textAlign: 'center', lineHeight: Typography.size.body * 1.6 },
});
