/**
 * Search service — local AsyncStorage history + Firestore popular searches.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SearchHistoryItem } from '@/src/types';

const HISTORY_KEY = 'reserva_search_history';
const MAX_HISTORY = 10;

// ── Local search history ──────────────────────────────────────────────────────

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as SearchHistoryItem[];
    } catch {
        return [];
    }
}

export async function saveSearchQuery(query: string): Promise<void> {
    const history = await getSearchHistory();
    const filtered = history.filter((h) => h.query !== query);
    const updated: SearchHistoryItem[] = [
        { id: Date.now().toString(), query, timestamp: Date.now() },
        ...filtered,
    ].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function clearSearchHistory(): Promise<void> {
    await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function removeSearchHistoryItem(id: string): Promise<void> {
    const history = await getSearchHistory();
    const updated = history.filter((h) => h.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}
