/**
 * Service service — Firestore queries for the services/ collection.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    where,
} from 'firebase/firestore';

import { db } from '@/firebase/firestore';
import type { GeoPoint, PaginatedResult, Service } from '@/src/types';
import { haversineDistanceKm } from '@/src/utils/distance';

const SERVICES = 'services';
const PAGE_SIZE = 20;

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function getServiceById(id: string): Promise<Service | null> {
    const snap = await getDoc(doc(db, SERVICES, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Service;
}

export async function getServices(
    lastDoc?: QueryDocumentSnapshot,
): Promise<PaginatedResult<Service>> {
    const q = lastDoc
        ? query(collection(db, SERVICES), where('isActive', '==', true), orderBy('name'), startAfter(lastDoc), limit(PAGE_SIZE))
        : query(collection(db, SERVICES), where('isActive', '==', true), orderBy('name'), limit(PAGE_SIZE));

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service);
    return {
        items,
        hasMore: snap.docs.length === PAGE_SIZE,
        lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    };
}

export async function getPopularServices(count = 4): Promise<Service[]> {
    const q = query(
        collection(db, SERVICES),
        where('isActive', '==', true),
        orderBy('reviewCount', 'desc'),
        limit(count),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service);
}

export async function getServicesByCategory(
    categoryId: string,
    lastDoc?: QueryDocumentSnapshot,
): Promise<PaginatedResult<Service>> {
    const q = lastDoc
        ? query(collection(db, SERVICES), where('categoryId', '==', categoryId), where('isActive', '==', true), startAfter(lastDoc), limit(PAGE_SIZE))
        : query(collection(db, SERVICES), where('categoryId', '==', categoryId), where('isActive', '==', true), limit(PAGE_SIZE));

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service);
    return {
        items,
        hasMore: snap.docs.length === PAGE_SIZE,
        lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    };
}

// ── Geo filtering (client-side, scalable with GeoFirestore later) ─────────────

export async function getNearbyServices(
    userLocation: GeoPoint,
    radiusKm = 10,
    count = 20,
): Promise<Service[]> {
    // Fetch a broad set and filter client-side.
    // TODO: replace with Geohash queries or GeoFirestore for scale.
    const q = query(
        collection(db, SERVICES),
        where('isActive', '==', true),
        limit(100),
    );
    const snap = await getDocs(q);
    return snap.docs
        .map((d) => {
            const service = { id: d.id, ...d.data() } as Service;
            service.distanceKm = haversineDistanceKm(userLocation, service.location);
            return service;
        })
        .filter((s) => (s.distanceKm ?? Infinity) <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
        .slice(0, count);
}
