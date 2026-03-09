import { supabase } from '@/utils/supabase';

export interface MapPoint {
    id: string;
    title: string;
    category: string;
    latitude: number;
    longitude: number;
    rating: number;
    reviews: number;
}

/**
 * Fetches map points from Supabase.
 * @param category Optional category to filter by
 * @param sort Optional sort param to filter logic
 * @param searchQuery Optional search term to filter by title or category
 * @returns Promise that resolves to an array of MapPoint
 */
export async function fetchMapPoints(
    category?: string | null,
    sort: 'rating' | 'reviews' | null = null,
    searchQuery?: string
): Promise<MapPoint[]> {
    try {
        let query = supabase.from('map_points').select('*');

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        if (searchQuery && searchQuery.trim() !== '') {
            // Search title or category ignoring case
            const searchStr = `%${searchQuery.trim()}%`;
            query = query.or(`title.ilike.${searchStr},category.ilike.${searchStr}`);
        }

        if (sort === 'rating') {
            query = query.order('rating', { ascending: false });
        } else if (sort === 'reviews') {
            query = query.order('reviews', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching map points from Supabase:', error.message);
            return [];
        }

        return (data || []) as MapPoint[];
    } catch (err) {
        console.error('Unexpected error fetching map points:', err);
        return [];
    }
}

/**
 * Fetches the full details of a specific service by ID.
 */
export async function getServiceDetails(id: string): Promise<MapPoint | null> {
    try {
        const { data, error } = await supabase
            .from('map_points')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching service ${id}:`, error.message);
            return null;
        }

        return data as MapPoint;
    } catch (err) {
        console.error(`Unexpected error fetching service ${id}:`, err);
        return null;
    }
}
