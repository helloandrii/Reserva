/**
 * Bookings store — user booking list with loading and filter state.
 */

import { create } from 'zustand';

import { cancelBooking, getUserBookings } from '@/src/services/bookingService';
import type { Booking, BookingStatus, LoadingState } from '@/src/types';

interface BookingsState {
    bookings: Booking[];
    activeTab: 'upcoming' | 'past';
    loadingState: LoadingState;
    error: string | null;
    setActiveTab: (tab: 'upcoming' | 'past') => void;
    fetchBookings: (userId: string) => Promise<void>;
    cancelBooking: (bookingId: string) => Promise<void>;
    reset: () => void;
}

function tabToStatus(tab: 'upcoming' | 'past'): BookingStatus | undefined {
    if (tab === 'upcoming') return 'upcoming';
    if (tab === 'past') return 'completed';
    return undefined;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
    bookings: [],
    activeTab: 'upcoming',
    loadingState: 'idle',
    error: null,

    setActiveTab: (tab) => set({ activeTab: tab }),

    fetchBookings: async (userId: string) => {
        set({ loadingState: 'loading', error: null });
        try {
            const status = tabToStatus(get().activeTab);
            const bookings = await getUserBookings(userId, status);
            set({ bookings, loadingState: 'success' });
        } catch (e: any) {
            set({ loadingState: 'error', error: e.message });
        }
    },

    cancelBooking: async (bookingId: string) => {
        await cancelBooking(bookingId);
        // Update local state optimistically
        set((state) => ({
            bookings: state.bookings.map((b) =>
                b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b,
            ),
        }));
    },

    reset: () => set({ bookings: [], loadingState: 'idle', error: null }),
}));
