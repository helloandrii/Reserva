/**
 * Service service — Supabase queries for the services table.
 */

import type { GeoPoint, PaginatedResult, Service } from '@/src/types';
import { haversineDistanceKm } from '@/src/utils/distance';
import { supabase } from '@/utils/supabase';

const SERVICES = 'services';
const PAGE_SIZE = 20;

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function getServiceById(id: string): Promise<Service | null> {
    const { data, error } = await supabase.from(SERVICES).select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as Service;
}

export async function getServices(
    pageOffset = 0,
): Promise<PaginatedResult<Service>> {
    const from = pageOffset;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
        .from(SERVICES)
        .select('*')
        .eq('isActive', true)
        .order('name')
        .range(from, to);

    const items = (data || []) as Service[];
    return {
        items,
        hasMore: items.length === PAGE_SIZE,
        lastDoc: from + PAGE_SIZE, // Overloading lastDoc as the numeric offset
    };
}

export async function getPopularServices(count = 4): Promise<Service[]> {
    const { data } = await supabase
        .from(SERVICES)
        .select('*')
        .eq('isActive', true)
        .order('reviewCount', { ascending: false })
        .limit(count);
        
    return (data || []) as Service[];
}

export async function getServicesByCategory(
    categoryId: string,
    pageOffset = 0,
): Promise<PaginatedResult<Service>> {
    const from = pageOffset;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
        .from(SERVICES)
        .select('*')
        .eq('categoryId', categoryId)
        .eq('isActive', true)
        .range(from, to);

    const items = (data || []) as Service[];
    return {
        items,
        hasMore: items.length === PAGE_SIZE,
        lastDoc: from + PAGE_SIZE, // Overloading lastDoc as the numeric offset
    };
}

// ── Geo filtering (client-side) ─────────────

export async function getNearbyServices(
    userLocation: GeoPoint,
    radiusKm = 10,
    count = 20,
): Promise<Service[]> {
    // Fetch a broad set and filter client-side.
    // In a real Postgres environment we would use PostGIS for this.
    const { data } = await supabase
        .from(SERVICES)
        .select('*')
        .eq('isActive', true)
        .limit(100);
        
    const items = (data || []) as Service[];

    return items
        .map((s) => {
            s.distanceKm = haversineDistanceKm(userLocation, s.location);
            return s;
        })
        .filter((s) => (s.distanceKm ?? Infinity) <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
        .slice(0, count);
}
