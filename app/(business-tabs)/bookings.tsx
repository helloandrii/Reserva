import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function BusinessBookingsScreen() {
    const C = useThemeColors();
    const { user } = useAuth();
    
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Join with services to get the service name
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id, 
                    booking_date, 
                    status,
                    services ( name )
                `)
                .eq('business_id', user.id)
                .order('booking_date', { ascending: true });

            if (error) throw error;
            setBookings(data || []);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const handleComplete = async (bookingId: string) => {
        Alert.alert(
            "Complete Session",
            "Are you sure you want to mark this session as completed? This will remove it from your active bookings.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Complete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('bookings')
                                .delete()
                                .eq('id', bookingId);
                                
                            if (error) throw error;
                            
                            // Remove from local state immediately
                            setBookings(prev => prev.filter(b => b.id !== bookingId));
                        } catch (err) {
                            console.error('Failed to complete booking', err);
                            Alert.alert("Error", "Could not complete the session. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
            <View style={styles.headerRow}>
                <Text style={[styles.header, { color: C.text }]}>Bookings</Text>
                <TouchableOpacity onPress={fetchBookings} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={24} color={C.textSecondary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Palette.accent} />
                </View>
            ) : bookings.length === 0 ? (
                <View style={styles.centerContainer}>
                    <View style={[styles.emptyState, { backgroundColor: C.surface, borderColor: C.border }]}>
                        <Ionicons name="calendar-outline" size={48} color={C.textTertiary} style={{ marginBottom: Spacing.md }} />
                        <Text style={[styles.emptyText, { color: C.textSecondary }]}>No upcoming bookings</Text>
                    </View>
                </View>
            ) : (
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {bookings.map(booking => {
                        const dateObj = new Date(booking.booking_date);
                        const isPast = dateObj < new Date();
                        
                        return (
                            <View key={booking.id} style={[styles.bookingCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={[styles.serviceName, { color: C.text }]}>
                                            {booking.services?.name || 'Unknown Service'}
                                        </Text>
                                        <View style={styles.dateTimeRow}>
                                            <Ionicons name="time-outline" size={16} color={C.textSecondary} />
                                            <Text style={[styles.dateTimeText, { color: C.textSecondary }]}>
                                                {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>
                                    {isPast && (
                                        <View style={[styles.pastBadge, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
                                            <Text style={[styles.pastBadgeText, { color: Palette.error }]}>Overdue</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={[styles.divider, { backgroundColor: C.border }]} />

                                <TouchableOpacity 
                                    style={[styles.completeButton, { backgroundColor: Palette.success }]}
                                    activeOpacity={0.8}
                                    onPress={() => handleComplete(booking.id)}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                                    <Text style={styles.completeButtonText}>Complete Session</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    header: {
        fontSize: Typography.size['2xl'],
        fontWeight: Typography.weight.bold,
    },
    refreshBtn: {
        padding: Spacing.sm,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: Spacing['3xl'],
        borderRadius: Radius['2xl'],
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    emptyText: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.medium,
    },
    scrollContent: {
        paddingBottom: 120, // Tab bar clearance
        gap: Spacing.lg,
    },
    bookingCard: {
        borderRadius: Radius.lg,
        borderWidth: 1,
        padding: Spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    serviceName: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        marginBottom: 4,
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateTimeText: {
        fontSize: Typography.size.body,
    },
    pastBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Radius.full,
    },
    pastBadgeText: {
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.bold,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: '100%',
        marginVertical: Spacing.md,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: Radius.full,
    },
    completeButtonText: {
        color: '#FFF',
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.bold,
    },
});
