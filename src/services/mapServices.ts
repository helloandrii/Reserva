import { supabase } from '@/utils/supabase';

export interface MapPoint {
    id: string;
    title: string;
    category: string;
    rating: number;
    reviews: number;
    latitude: number;
    longitude: number;
    businessId: string;
}

export async function fetchMapPoints(
    selectedCategory?: string | null,
    sortFilter?: 'rating' | 'reviews' | null,
    debouncedSearch?: string,
): Promise<MapPoint[]> {
    let query = supabase.from('services').select('*').eq('isActive', true);
    
    if (selectedCategory) {
        query = query.eq('category', selectedCategory);
    }
    
    if (debouncedSearch && debouncedSearch.trim() !== '') {
        query = query.ilike('name', `%${debouncedSearch}%`);
    }

    if (sortFilter === 'rating') {
        query = query.order('rating', { ascending: false });
    } else if (sortFilter === 'reviews') {
        query = query.order('reviews', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error || !data) return [];
    
    return data
        .filter((d: any) => d.location && typeof d.location.latitude === 'number')
        .map((d: any) => ({
            id: d.id,
            title: d.name || 'Unnamed',
            category: d.category || 'Other',
            rating: d.rating || 0,
            reviews: d.reviewCount || d.reviews || 0,
            latitude: d.location.latitude,
            longitude: d.location.longitude,
            businessId: d.business_id || d.businessId,
        }));
}

export async function getServiceDetails(id: string): Promise<MapPoint | null> {
    const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    return {
        id: data.id,
        title: data.name || 'Unnamed',
        category: data.category || 'Other',
        rating: data.rating || 0,
        reviews: data.reviewCount || data.reviews || 0,
        latitude: data.location?.latitude || 0,
        longitude: data.location?.longitude || 0,
        businessId: data.business_id || data.businessId,
    };
}
