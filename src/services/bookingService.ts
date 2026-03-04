/**
 * Booking service — Firestore operations for the bookings/ collection.
 */

import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

import { db } from '@/firebase/firestore';
import type { Booking, BookingStatus } from '@/src/types';

const BOOKINGS = 'bookings';

// ── Create ────────────────────────────────────────────────────────────────────

export async function createBooking(
    data: Omit<Booking, 'id' | 'createdAt' | 'status' | 'calendarEventId'>,
): Promise<string> {
    const ref = doc(collection(db, BOOKINGS));
    const booking: Booking = {
        ...data,
        id: ref.id,
        status: 'upcoming',
        calendarEventId: null,
        createdAt: serverTimestamp() as any,
    };
    await setDoc(ref, booking);
    return ref.id;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUserBookings(
    userId: string,
    status?: BookingStatus,
): Promise<Booking[]> {
    const constraints: any[] = [
        where('userId', '==', userId),
        orderBy('startTime', 'desc'),
        limit(50),
    ];
    if (status) constraints.splice(1, 0, where('status', '==', status));
    const q = query(collection(db, BOOKINGS), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Booking);
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string): Promise<void> {
    await updateDoc(doc(db, BOOKINGS, bookingId), {
        status: 'cancelled',
    });
}

export async function setBookingCalendarId(
    bookingId: string,
    calendarEventId: string,
): Promise<void> {
    await updateDoc(doc(db, BOOKINGS, bookingId), { calendarEventId });
}
