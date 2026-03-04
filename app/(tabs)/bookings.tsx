import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Strings } from '@/constants/strings';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useBookingsStore } from '@/src/store/bookingsStore';
import type { Booking } from '@/src/types';
import { formatDate, formatTime } from '@/src/utils/formatters';

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
    const { bookings: S } = Strings;
    const statusColor =
        booking.status === 'upcoming' ? Colors.light.success :
            booking.status === 'cancelled' ? Colors.light.error : Colors.light.textSecondary;
    const statusLabel = S.status[booking.status] ?? booking.status;

    return (
        <View style={styles.card}>
            {/* Service info */}
            <View style={styles.cardHeader}>
                <View style={styles.cardAvatar}>
                    <Ionicons name="storefront-outline" size={22} color="#888" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardService} numberOfLines={1}>{booking.serviceName}</Text>
                    <Text style={styles.cardBusiness} numberOfLines={1}>{booking.businessName}</Text>
                </View>
                <View style={[styles.statusPill, { borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
            </View>

            {/* Date/Time/Address */}
            <View style={styles.cardMeta}>
                <MetaRow icon="calendar-outline" text={formatDate(booking.startTime)} />
                <MetaRow icon="time-outline" text={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
                <MetaRow icon="location-outline" text={booking.address} />
            </View>

            {/* Cancel */}
            {booking.status === 'upcoming' && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(booking.id)}>
                    <Text style={styles.cancelText}>{Strings.bookings.cancel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function MetaRow({ icon, text }: { icon: any; text: string }) {
    return (
        <View style={styles.metaRow}>
            <Ionicons name={icon} size={14} color="#888" />
            <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
        </View>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: 'upcoming' | 'past' }) {
    const { bookings: S } = Strings;
    const title = tab === 'upcoming' ? S.empty.upcoming : S.empty.past;
    const subtitle = tab === 'upcoming' ? S.empty.upcomingSubtitle : S.empty.pastSubtitle;

    return (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={44} color="#333" />
            </View>
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptySubtitle}>{subtitle}</Text>
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

    const handleCancel = async (bookingId: string) => {
        await cancelBooking(bookingId);
    };

    const handleRefresh = () => {
        if (user) fetchBookings(user.uid);
    };

    const tabs = [
        { key: 'upcoming' as const, label: Strings.bookings.upcoming },
        { key: 'past' as const, label: Strings.bookings.past },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{Strings.bookings.title}</Text>
            </View>

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

            {/* Content */}
            {loadingState === 'loading' && bookings.length === 0 ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#fff" />
                </View>
            ) : (
                <FlatList
                    data={bookings.filter((b) =>
                        activeTab === 'upcoming' ? b.status === 'upcoming' : b.status !== 'upcoming',
                    )}
                    keyExtractor={(b) => b.id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: Math.max(insets.bottom, 24) },
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loadingState === 'loading'}
                            onRefresh={handleRefresh}
                            tintColor="#fff"
                        />
                    }
                    renderItem={({ item }) => (
                        <BookingCard booking={item} onCancel={handleCancel} />
                    )}
                    ListEmptyComponent={<EmptyState tab={activeTab} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },

    // ── Header
    header: {
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: Typography.size['4xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
        letterSpacing: -1,
    },

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
    segmentBtnActive: {
        backgroundColor: '#fff',
    },
    segmentText: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.medium,
        color: Colors.dark.textSecondary,
    },
    segmentTextActive: {
        color: '#000',
        fontWeight: Typography.weight.semibold,
    },

    // ── List
    listContent: {
        paddingHorizontal: Spacing['2xl'],
        gap: Spacing.md,
        flexGrow: 1,
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Booking card
    card: {
        backgroundColor: '#111',
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: '#1a1a1a',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
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
    cardBusiness: {
        fontSize: Typography.size.sm,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    statusPill: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: Typography.weight.semibold,
    },

    // Meta
    cardMeta: { gap: Spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    metaText: {
        fontSize: Typography.size.sm,
        color: Colors.dark.textSecondary,
        flex: 1,
    },

    // Cancel
    cancelButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: '#3a0000',
        backgroundColor: '#1a0000',
    },
    cancelText: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.medium,
        color: Colors.dark.error,
    },

    // ── Empty state
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.lg,
        paddingHorizontal: Spacing['3xl'],
        marginTop: Spacing['5xl'],
    },
    emptyIcon: {
        width: 88,
        height: 88,
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
