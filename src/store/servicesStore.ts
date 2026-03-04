/**
 * Services store — cached popular services and nearby services.
 */

import { create } from 'zustand';

import { getNearbyServices, getPopularServices } from '@/src/services/serviceService';
import type { GeoPoint, LoadingState, Service } from '@/src/types';

interface ServicesState {
    popular: Service[];
    nearby: Service[];
    popularState: LoadingState;
    nearbyState: LoadingState;
    error: string | null;
    fetchPopular: () => Promise<void>;
    fetchNearby: (location: GeoPoint) => Promise<void>;
    reset: () => void;
}

export const useServicesStore = create<ServicesState>((set) => ({
    popular: [],
    nearby: [],
    popularState: 'idle',
    nearbyState: 'idle',
    error: null,

    fetchPopular: async () => {
        set({ popularState: 'loading', error: null });
        try {
            const popular = await getPopularServices(4);
            set({ popular, popularState: 'success' });
        } catch (e: any) {
            set({ popularState: 'error', error: e.message });
        }
    },

    fetchNearby: async (location: GeoPoint) => {
        set({ nearbyState: 'loading', error: null });
        try {
            const nearby = await getNearbyServices(location);
            set({ nearby, nearbyState: 'success' });
        } catch (e: any) {
            set({ nearbyState: 'error', error: e.message });
        }
    },

    reset: () => set({ popular: [], nearby: [], popularState: 'idle', nearbyState: 'idle', error: null }),
}));
