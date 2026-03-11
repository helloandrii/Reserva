import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapPoint, getServiceDetails } from '@/src/services/mapServices';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function ServiceDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const isDark = useColorScheme() === 'dark';
    const C = useThemeColors();

    const [service, setService] = useState<MapPoint | null>(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [bookingInProgress, setBookingInProgress] = useState(false);

    const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    const handleBook = async () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to book a service.');
            // Ideally navigate to profile/auth tab, but simple alert for now
            return;
        }
        if (!selectedTime) {
            Alert.alert('Select Time', 'Please select a time slot to continue.');
            return;
        }
        if (!service) return;

        setBookingInProgress(true);
        try {
            // Calculate actual date
            const bookingDate = new Date();
            if (selectedDate === 'tomorrow') {
                bookingDate.setDate(bookingDate.getDate() + 1);
            }
            const [hours, minutes] = selectedTime.split(':');
            bookingDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

            const { error } = await supabase.from('bookings').insert({
                user_id: user.id,
                business_id: service.businessId,
                service_id: service.id,
                booking_date: bookingDate.toISOString(),
                status: 'upcoming'
            });

            if (error) throw error;

            Alert.alert('Success', 'Your booking has been confirmed!');
            setBookingModalVisible(false);
        } catch (error) {
            console.error('Booking failed:', error);
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        } finally {
            setBookingInProgress(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        getServiceDetails(id).then((data: MapPoint | null) => {
            setService(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: C.background }]}>
                <ActivityIndicator size="large" color={Palette.accent} />
            </View>
        );
    }

    if (!service) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: C.background }]}>
                <Text style={{ color: C.text }}>Service not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: Palette.accent }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Generate a placeholder background color based on category to make it look premium
    const categoryColors: Record<string, string> = {
        'Hair': '#FFB3BA',
        'Beauty': '#FFDFBA',
        'Cleaning': '#BAFFC9',
        'Fitness Classes': '#BAE1FF',
        'Language': '#E6B3FF',
        'Spa': '#B3FFE6',
        'Massage': '#FFC9DE',
        'Car Detailing': '#C9D1FF',
        'Photography': '#FFF3B3',
    };
    
    const bannerColor = categoryColors[service.category] || Palette.accent;

    return (
        <View style={[styles.container, { backgroundColor: C.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                {/* ── Hero Image / Banner ── */}
                <View style={[styles.heroBanner, { backgroundColor: bannerColor }]}>
                    {/* Optionally load a real image later */}
                    <View style={styles.heroOverlay} />
                </View>

                {/* ── Header Top Bar (Back Button) ── */}
                <View style={[styles.topBar, { top: insets.top }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <GlassView style={styles.backButtonInner} glassEffectStyle="regular">
                            <Ionicons name="chevron-back" size={24} color={C.text} />
                        </GlassView>
                    </TouchableOpacity>
                </View>

                {/* ── Main Content Area ── */}
                <View style={[styles.contentArea, { backgroundColor: C.background }]}>
                    {/* Header Info */}
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: C.text }]}>{service.title}</Text>
                            <Text style={[styles.category, { color: Palette.accent }]}>{service.category}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={16} color="#FFF" />
                            <Text style={styles.ratingText}>{service.rating}</Text>
                        </View>
                    </View>

                    <Text style={[styles.reviewCount, { color: C.textSecondary }]}>
                        Based on {service.reviews} authentic reviews.
                    </Text>

                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

                    {/* Description Section */}
                    <Text style={[styles.sectionTitle, { color: C.text }]}>About</Text>
                    <Text style={[styles.bodyText, { color: C.textSecondary }]}>
                        Experience premium {service.category.toLowerCase()} services at {service.title}. 
                        Our team of professionals provides top-tier quality and ensures your absolute satisfaction.
                        Located centrally, we are highly rated by our community. Book an appointment today to see the difference!
                    </Text>

                    {/* Location Preview */}
                    <Text style={[styles.sectionTitle, { color: C.text, marginTop: Spacing.xl }]}>Location</Text>
                    <View style={[styles.locationBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <Ionicons name="location" size={24} color={Palette.accent} />
                        <View style={{ marginLeft: Spacing.md }}>
                            <Text style={[styles.locationText, { color: C.text }]}>Bratislava, Slovakia</Text>
                            <Text style={[styles.coordinateText, { color: C.textSecondary }]}>
                                {service.latitude.toFixed(4)}, {service.longitude.toFixed(4)}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Pricing Placeholder */}
                     <Text style={[styles.sectionTitle, { color: C.text, marginTop: Spacing.xl }]}>Services & Pricing</Text>
                     <View style={styles.pricingRow}>
                         <Text style={[styles.bodyText, { color: C.text }]}>Standard Service</Text>
                         <Text style={[styles.priceText, { color: C.text }]}>€45.00</Text>
                     </View>
                     <View style={styles.pricingRow}>
                         <Text style={[styles.bodyText, { color: C.text }]}>Premium Package</Text>
                         <Text style={[styles.priceText, { color: C.text }]}>€85.00</Text>
                     </View>

                </View>
            </ScrollView>

            {/* ── Bottom Sticky Booking Action ── */}
            <View style={[styles.bottomBar, { 
                backgroundColor: isDark ? 'rgba(20,20,22,0.95)' : 'rgba(255,255,255,0.95)',
                paddingBottom: insets.bottom + Spacing.md 
             }]}>
                <View style={styles.bottomBarInner}>
                    <View>
                        <Text style={[styles.priceEstimate, { color: C.textSecondary }]}>Average Price</Text>
                        <Text style={[styles.totalPrice, { color: C.text }]}>€65.00</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.bookButton} 
                        activeOpacity={0.8}
                        onPress={() => setBookingModalVisible(true)}
                    >
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Booking Modal ── */}
            <Modal
                visible={bookingModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setBookingModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        activeOpacity={1} 
                        onPress={() => setBookingModalVisible(false)} 
                    />
                    <View style={[styles.modalContent, { backgroundColor: C.backgroundSecondary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: C.text }]}>Book Appointment</Text>
                            <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                                <Ionicons name="close" size={24} color={C.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.modalSubtitle, { color: C.textSecondary }]}>
                            {service.title} - {service.category}
                        </Text>

                        {/* Date Selection */}
                        <Text style={[styles.sectionTitleModal, { color: C.text }]}>Select Day</Text>
                        <View style={styles.dateRow}>
                            <TouchableOpacity 
                                style={[
                                    styles.dateChip, 
                                    { backgroundColor: C.surface, borderColor: C.border },
                                    selectedDate === 'today' && styles.dateChipActive
                                ]}
                                onPress={() => setSelectedDate('today')}
                            >
                                <Text style={[
                                    styles.dateChipText, 
                                    { color: selectedDate === 'today' ? '#FFF' : C.text }
                                ]}>Today</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.dateChip, 
                                    { backgroundColor: C.surface, borderColor: C.border },
                                    selectedDate === 'tomorrow' && styles.dateChipActive
                                ]}
                                onPress={() => setSelectedDate('tomorrow')}
                            >
                                <Text style={[
                                    styles.dateChipText, 
                                    { color: selectedDate === 'tomorrow' ? '#FFF' : C.text }
                                ]}>Tomorrow</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Time Selection */}
                        <Text style={[styles.sectionTitleModal, { color: C.text, marginTop: Spacing.xl }]}>Select Time</Text>
                        <View style={styles.timeGrid}>
                            {TIME_SLOTS.map(time => (
                                <TouchableOpacity 
                                    key={time}
                                    style={[
                                        styles.timeChip,
                                        { backgroundColor: C.surface, borderColor: C.border },
                                        selectedTime === time && styles.timeChipActive
                                    ]}
                                    onPress={() => setSelectedTime(time)}
                                >
                                    <Text style={[
                                        styles.timeChipText,
                                        { color: selectedTime === time ? '#FFF' : C.text }
                                    ]}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={[
                                styles.confirmBookButton, 
                                bookingInProgress && { opacity: 0.7 }
                            ]} 
                            onPress={handleBook}
                            disabled={bookingInProgress}
                        >
                            {bookingInProgress ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.confirmBookText}>Confirm Booking</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
    },
    heroBanner: {
        width: '100%',
        height: 300,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    topBar: {
        position: 'absolute',
        left: Spacing.lg,
        right: Spacing.lg,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    backButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentArea: {
        flex: 1,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    title: {
        fontSize: Typography.size['2xl'],
        fontWeight: Typography.weight.bold,
        marginBottom: 4,
    },
    category: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.medium,
    },
    ratingBadge: {
        backgroundColor: Palette.accent,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: Radius.md,
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.bold,
    },
    reviewCount: {
        fontSize: Typography.size.caption,
        marginTop: Spacing.xs,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.size.title,
        fontWeight: Typography.weight.bold,
        marginBottom: Spacing.md,
    },
    bodyText: {
        fontSize: Typography.size.body,
        lineHeight: 24,
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: Radius.lg,
    },
    locationText: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.medium,
        marginBottom: 2,
    },
    coordinateText: {
        fontSize: Typography.size.caption,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(150,150,150,0.2)',
    },
    priceText: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.bold,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(150,150,150,0.2)',
    },
    bottomBarInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },
    priceEstimate: {
        fontSize: Typography.size.caption,
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
    },
    bookButton: {
        backgroundColor: Palette.accent,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: Radius.full,
    },
    bookButtonText: {
        color: '#FFF',
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.bold,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.xl,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    modalTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
    },
    modalSubtitle: {
        fontSize: Typography.size.body,
        marginBottom: Spacing.xl,
    },
    sectionTitleModal: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        marginBottom: Spacing.md,
    },
    dateRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    dateChip: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: Radius.lg,
        borderWidth: 1,
    },
    dateChipActive: {
        backgroundColor: Palette.accent,
        borderColor: Palette.accent,
    },
    dateChipText: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.medium,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    timeChip: {
        width: '30%',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: Radius.lg,
        borderWidth: 1,
    },
    timeChipActive: {
        backgroundColor: Palette.accent,
        borderColor: Palette.accent,
    },
    timeChipText: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.medium,
    },
    confirmBookButton: {
        backgroundColor: Palette.accent,
        paddingVertical: 16,
        borderRadius: Radius.full,
        alignItems: 'center',
        marginTop: Spacing['3xl'],
    },
    confirmBookText: {
        color: '#FFF',
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.bold,
    },
});
