/**
 * Search store — query state, history, and search results.
 */

import { create } from 'zustand';

import {
    clearSearchHistory,
    getSearchHistory,
    removeSearchHistoryItem,
    saveSearchQuery,
} from '@/src/services/searchService';
import { getServices } from '@/src/services/serviceService';
import type { LoadingState, SearchHistoryItem, Service } from '@/src/types';

interface SearchState {
    query: string;
    isActive: boolean;
    results: Service[];
    history: SearchHistoryItem[];
    searchState: LoadingState;
    selectedCategory: string | null;
    setQuery: (q: string) => void;
    setActive: (active: boolean) => void;
    setCategory: (categoryId: string | null) => void;
    search: (q: string) => Promise<void>;
    loadHistory: () => Promise<void>;
    removeHistoryItem: (id: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    query: '',
    isActive: false,
    results: [],
    history: [],
    searchState: 'idle',
    selectedCategory: null,

    setQuery: (query) => set({ query }),
    setActive: (isActive) => set({ isActive, query: isActive ? '' : '' }),
    setCategory: (selectedCategory) => set({ selectedCategory }),

    search: async (q: string) => {
        set({ searchState: 'loading' });
        await saveSearchQuery(q);
        try {
            // TODO: replace with full-text search (Algolia/Typesense) for scale
            const { items } = await getServices();
            const lower = q.toLowerCase();
            const results = items.filter(
                (s) =>
                    s.name.toLowerCase().includes(lower) ||
                    s.categoryName.toLowerCase().includes(lower),
            );
            set({ results, searchState: 'success' });
        } catch (e: any) {
            set({ searchState: 'error' });
        }
    },

    loadHistory: async () => {
        const history = await getSearchHistory();
        set({ history });
    },

    removeHistoryItem: async (id: string) => {
        await removeSearchHistoryItem(id);
        set((state) => ({ history: state.history.filter((h) => h.id !== id) }));
    },

    clearHistory: async () => {
        await clearSearchHistory();
        set({ history: [] });
    },

    reset: () => set({ query: '', isActive: false, results: [], searchState: 'idle' }),
}));
