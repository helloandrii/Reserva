/**
 * Shared TypeScript types for the Reserva app.
 * All screens and services import types from here.
 */

import type { Timestamp } from 'firebase/firestore';

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    /** Number of services the user has bookings for */
    usedServicesCount: number;
    /** IDs of services the user has saved/favourited */
    savedServiceIds: string[];
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
    id: string;
    name: string;
    /** SF Symbol name (iOS) or Ionicons name */
    icon: string;
    order: number;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface GeoPoint {
    latitude: number;
    longitude: number;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    categoryName: string;
    businessId: string;
    businessName: string;
    /** URLs from Firebase Storage */
    photoURLs: string[];
    location: GeoPoint;
    address: string;
    /** Average rating 0-5, future-ready */
    rating: number | null;
    reviewCount: number;
    priceFrom: number | null;
    currency: string;
    /** Precomputed distance from user in km — set client-side */
    distanceKm?: number;
    isActive: boolean;
    createdAt: Timestamp | null;
}

// ─── Time Slots ───────────────────────────────────────────────────────────────

export interface TimeSlot {
    id: string;
    serviceId: string;
    startTime: Timestamp;
    endTime: Timestamp;
    isAvailable: boolean;
    durationMinutes: number;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Booking {
    id: string;
    userId: string;
    serviceId: string;
    serviceName: string;
    servicePhotoURL: string | null;
    businessName: string;
    address: string;
    date: Timestamp;
    startTime: Timestamp;
    endTime: Timestamp;
    notes: string;
    status: BookingStatus;
    /** Added to device calendar */
    calendarEventId: string | null;
    createdAt: Timestamp | null;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchHistoryItem {
    id: string;
    query: string;
    timestamp: number; // ms epoch, stored locally
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'promo';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, string>;
    read: boolean;
    createdAt: Timestamp | null;
}

// ─── Analytics Events ─────────────────────────────────────────────────────────

export type AnalyticsEvent =
    | 'onboarding_started'
    | 'onboarding_completed'
    | 'user_type_selected'
    | 'sign_in_started'
    | 'sign_in_completed'
    | 'sign_out'
    | 'search_performed'
    | 'category_selected'
    | 'service_viewed'
    | 'service_saved'
    | 'booking_started'
    | 'booking_completed'
    | 'booking_cancelled'
    | 'profile_updated'
    | 'profile_photo_updated';

export interface AnalyticsEventParams {
    [key: string]: string | number | boolean;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResult<T> {
    items: T[];
    hasMore: boolean;
    lastDoc: unknown | null;
}
