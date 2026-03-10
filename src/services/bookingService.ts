/**
 * Booking service — Supabase operations for the bookings table.
 */

import type { Booking, BookingStatus } from '@/src/types';
import { supabase } from '@/utils/supabase';

const BOOKINGS = 'bookings';

// ── Create ────────────────────────────────────────────────────────────────────

export async function createBooking(
    data: Omit<Booking, 'id' | 'createdAt' | 'status' | 'calendarEventId'>,
): Promise<string> {
    const bookingPayload = {
        ...data,
        status: 'upcoming',
        calendarEventId: null,
    };
    
    const { data: newBooking, error } = await supabase
        .from(BOOKINGS)
        .insert(bookingPayload)
        .select('id')
        .single();
        
    if (error) throw error;
    return newBooking.id;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUserBookings(
    userId: string,
    status?: BookingStatus,
): Promise<Booking[]> {
    let query = supabase
        .from(BOOKINGS)
        .select('*')
        .eq('userId', userId)
        .order('startTime', { ascending: false })
        .limit(50);
        
    if (status) {
        query = query.eq('status', status);
    }
    
    const { data } = await query;
    return (data || []) as Booking[];
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string): Promise<void> {
    await supabase.from(BOOKINGS).update({ status: 'cancelled' }).eq('id', bookingId);
}

export async function setBookingCalendarId(
    bookingId: string,
    calendarEventId: string,
): Promise<void> {
    await supabase.from(BOOKINGS).update({ calendarEventId }).eq('id', bookingId);
}
