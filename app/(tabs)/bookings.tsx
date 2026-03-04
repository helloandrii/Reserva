import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { updateUser, uploadProfilePhoto } from '@/src/services/userService';
import { useBookingsStore } from '@/src/store/bookingsStore';
import type { Booking } from '@/src/types';
import { formatDate, formatTime } from '@/src/utils/formatters';

// ─── Compact Profile Widget ───────────────────────────────────────────────────

function ProfileWidget() {
    const { user, profile } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [editingField, setEditingField] = useState<'displayName' | 'phoneNumber' | null>(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const expandAnim = useRef(new Animated.Value(0)).current;

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;
        setExpanded(!expanded);
        Animated.spring(expandAnim, { toValue, useNativeDriver: false, bounciness: 4 }).start();
    };

    const expandedHeight = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 220],
    });

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
        // Not signed in — show sign-in prompt
        return (
            <View style={styles.profileWidget}>
                <View style={styles.profileWidgetRow}>
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person-outline" size={20} color="#888" />
                    </View>
                    <View style={styles.profileWidgetInfo}>
                        <Text style={styles.profileWidgetName}>Sign in to continue</Text>
                        <Text style={styles.profileWidgetSub}>Access your bookings and profile</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.signInChip}
                        onPress={() => {/* navigate to onboarding/auth */ }}
                    >
                        <Text style={styles.signInChipText}>Sign in</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.profileWidget}>
            {/* Collapsed row — always visible */}
            <TouchableOpacity style={styles.profileWidgetRow} onPress={toggleExpand} activeOpacity={0.8}>
                {/* Avatar */}
                <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrap}>
                    {profile?.photoURL ? (
                        <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>
                                {(profile?.displayName ?? 'U')[0].toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.avatarEditBadge}>
                        <Ionicons name="camera" size={10} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Name + subtitle */}
                <View style={styles.profileWidgetInfo}>
                    <Text style={styles.profileWidgetName} numberOfLines={1}>
                        {profile?.displayName ?? 'User'}
                    </Text>
                    <Text style={styles.profileWidgetSub} numberOfLines={1}>
                        {profile?.usedServicesCount ?? 0} bookings · {profile?.savedServiceIds?.length ?? 0} saved
                    </Text>
                </View>

                {/* Chevron */}
                <Animated.View style={{
                    transform: [{
                        rotate: expandAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })
                    }]
                }}>
                    <Ionicons name="chevron-down" size={18} color={Colors.dark.textSecondary} />
                </Animated.View>
            </TouchableOpacity>

            {/* Expanded details */}
            <Animated.View style={[styles.profileExpanded, { maxHeight: expandedHeight, overflow: 'hidden' }]}>
                <View style={styles.expandedDivider} />

                {/* Name edit */}
                <EditableRow
                    icon="person-outline"
                    label="Name"
                    value={profile?.displayName ?? ''}
                    isEditing={editingField === 'displayName'}
                    editValue={editValue}
                    onEdit={() => handleEditField('displayName')}
                    onChangeText={setEditValue}
                    onSave={handleSaveField}
                    onCancel={() => setEditingField(null)}
                    saving={saving}
                />

                {/* Phone edit */}
                <EditableRow
                    icon="call-outline"
                    label="Phone"
                    value={profile?.phoneNumber ?? '—'}
                    isEditing={editingField === 'phoneNumber'}
                    editValue={editValue}
                    onEdit={() => handleEditField('phoneNumber')}
                    onChangeText={setEditValue}
                    onSave={handleSaveField}
                    onCancel={() => setEditingField(null)}
                    saving={saving}
                    keyboardType="phone-pad"
                />

                {/* Email (non-editable) */}
                <View style={styles.editRow}>
                    <Ionicons name="mail-outline" size={16} color={Colors.dark.textSecondary} />
                    <View style={styles.editRowContent}>
                        <Text style={styles.editRowLabel}>Email</Text>
                        <Text style={styles.editRowValue} numberOfLines={1}>{profile?.email ?? '—'}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{profile?.usedServicesCount ?? 0}</Text>
                        <Text style={styles.statLabel}>Used</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{profile?.savedServiceIds?.length ?? 0}</Text>
                        <Text style={styles.statLabel}>Saved</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

// ─── Editable Row ─────────────────────────────────────────────────────────────

function EditableRow({
    icon, label, value, isEditing, editValue,
    onEdit, onChangeText, onSave, onCancel, saving, keyboardType,
}: {
    icon: any; label: string; value: string;
    isEditing: boolean; editValue: string;
    onEdit: () => void; onChangeText: (v: string) => void;
    onSave: () => void; onCancel: () => void;
    saving?: boolean; keyboardType?: any;
}) {
    return (
        <View style={styles.editRow}>
            <Ionicons name={icon} size={16} color={Colors.dark.textSecondary} />
            <View style={styles.editRowContent}>
                <Text style={styles.editRowLabel}>{label}</Text>
                {isEditing ? (
                    <View style={styles.editInputRow}>
                        <TextInput
                            style={styles.editInput}
                            value={editValue}
                            onChangeText={onChangeText}
                            autoFocus
                            keyboardType={keyboardType}
                            keyboardAppearance="dark"
                        />
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <TouchableOpacity onPress={onSave}>
                                    <Ionicons name="checkmark" size={18} color={Colors.dark.success} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onCancel}>
                                    <Ionicons name="close" size={18} color={Colors.dark.error} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                ) : (
                    <Text style={styles.editRowValue} numberOfLines={1}>{value}</Text>
                )}
            </View>
            {!isEditing && (
                <TouchableOpacity onPress={onEdit} style={styles.editPencil}>
                    <Ionicons name="pencil" size={14} color={Colors.dark.textTertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
    const S = Strings.bookings;
    const statusColor =
        booking.status === 'upcoming' ? Colors.dark.success :
            booking.status === 'cancelled' ? Colors.dark.error : Colors.dark.textSecondary;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardAvatar}>
                    <Ionicons name="storefront-outline" size={22} color="#666" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardService} numberOfLines={1}>{booking.serviceName}</Text>
                    <Text style={styles.cardBusiness} numberOfLines={1}>{booking.businessName}</Text>
                </View>
                <View style={[styles.statusPill, { borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {S.status[booking.status] ?? booking.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardMeta}>
                <MetaRow icon="calendar-outline" text={formatDate(booking.startTime)} />
                <MetaRow icon="time-outline" text={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
                <MetaRow icon="location-outline" text={booking.address} />
                {booking.notes ? <MetaRow icon="document-text-outline" text={booking.notes} /> : null}
            </View>

            {booking.status === 'upcoming' && (
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.calendarBtn}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.dark.tint} />
                        <Text style={styles.calendarBtnText}>Add to Calendar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(booking.id)}>
                        <Text style={styles.cancelText}>{S.cancel}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

function MetaRow({ icon, text }: { icon: any; text: string }) {
    return (
        <View style={styles.metaRow}>
            <Ionicons name={icon} size={14} color="#666" />
            <Text style={styles.metaText} numberOfLines={2}>{text}</Text>
        </View>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: 'upcoming' | 'past' }) {
    const S = Strings.bookings.empty;
    return (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={40} color="#333" />
            </View>
            <Text style={styles.emptyTitle}>{tab === 'upcoming' ? S.upcoming : S.past}</Text>
            <Text style={styles.emptySubtitle}>{tab === 'upcoming' ? S.upcomingSubtitle : S.pastSubtitle}</Text>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BookingsScreen() {
    const insets = useSafeAreaInsets();
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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{Strings.bookings.title}</Text>
            </View>

            {/* Profile widget */}
            <ProfileWidget />

            {/* Segmented control */}
            <View style={styles.segmentedWrap}>
                {tabs.map((t) => (
                    <TouchableOpacity
                        key={t.key}
                        style={[styles.segmentBtn, activeTab === t.key && styles.segmentBtnActive]}
                        onPress={() => setActiveTab(t.key)}
                    >
                        <Text style={[styles.segmentText, activeTab === t.key && styles.segmentTextActive]}>
                            {t.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bookings list */}
            {loadingState === 'loading' && bookings.length === 0 ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#fff" />
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
                            tintColor="#fff"
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
    container: { flex: 1, backgroundColor: Colors.dark.background },

    // ── Header
    header: {
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    headerTitle: {
        fontSize: Typography.size['4xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
        letterSpacing: -1,
    },

    // ── Profile widget
    profileWidget: {
        marginHorizontal: Spacing['2xl'],
        marginBottom: Spacing.md,
        backgroundColor: '#111',
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: '#1e1e1e',
        overflow: 'hidden',
    },
    profileWidgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.md,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
    },
    avatarPlaceholder: {
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: '#fff',
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: Radius.full,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileWidgetInfo: { flex: 1 },
    profileWidgetName: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.semibold,
        color: Colors.dark.text,
    },
    profileWidgetSub: {
        fontSize: Typography.size.sm,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },

    // Sign in chip
    signInChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
        backgroundColor: '#fff',
    },
    signInChipText: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.semibold,
        color: '#000',
    },

    // Expanded section
    profileExpanded: {},
    expandedDivider: { height: 1, backgroundColor: '#1e1e1e', marginHorizontal: Spacing.md },

    // Editable rows
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    editRowContent: { flex: 1 },
    editRowLabel: {
        fontSize: Typography.size.xs,
        color: Colors.dark.textTertiary,
        marginBottom: 2,
    },
    editRowValue: {
        fontSize: Typography.size.md,
        color: Colors.dark.text,
    },
    editInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    editInput: {
        flex: 1,
        fontSize: Typography.size.md,
        color: Colors.dark.text,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.tint,
        paddingVertical: 2,
    },
    editPencil: { padding: Spacing.sm },

    // Stats
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: Spacing.md,
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
        backgroundColor: '#1a1a1a',
        borderRadius: Radius.md,
        overflow: 'hidden',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    statNum: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
    },
    statLabel: {
        fontSize: Typography.size.xs,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    statDivider: { width: 1, backgroundColor: '#222', marginVertical: Spacing.sm },

    // ── Segmented
    segmentedWrap: {
        flexDirection: 'row',
        marginHorizontal: Spacing['2xl'],
        backgroundColor: '#111',
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
    segmentBtnActive: { backgroundColor: '#fff' },
    segmentText: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.medium,
        color: Colors.dark.textSecondary,
    },
    segmentTextActive: { color: '#000', fontWeight: Typography.weight.semibold },

    // ── List
    listContent: { paddingHorizontal: Spacing['2xl'], gap: Spacing.md, flexGrow: 1 },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // ── Booking card
    card: {
        backgroundColor: '#111',
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: '#1a1a1a',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    cardAvatar: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: { flex: 1 },
    cardService: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: Colors.dark.text,
    },
    cardBusiness: { fontSize: Typography.size.sm, color: Colors.dark.textSecondary, marginTop: 2 },
    statusPill: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    statusText: { fontSize: 11, fontWeight: Typography.weight.semibold },
    cardMeta: { gap: Spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
    metaText: { fontSize: Typography.size.sm, color: Colors.dark.textSecondary, flex: 1 },

    // Card actions
    cardActions: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
    calendarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: '#0A2540',
        backgroundColor: '#0a1520',
    },
    calendarBtnText: {
        fontSize: Typography.size.sm,
        color: Colors.dark.tint,
        fontWeight: Typography.weight.medium,
    },
    cancelButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: '#3a0000',
        backgroundColor: '#1a0000',
    },
    cancelText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, color: Colors.dark.error },

    // ── Empty state
    emptyWrap: {
        alignItems: 'center',
        gap: Spacing.lg,
        paddingHorizontal: Spacing['3xl'],
        paddingTop: Spacing['3xl'],
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: Radius.xl,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: Typography.size.md,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: Typography.size.md * 1.6,
    },
});
