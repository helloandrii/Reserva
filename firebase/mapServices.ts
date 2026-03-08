export interface MapPoint {
    id: string;
    title: string;
    category: string;
    latitude: number;
    longitude: number;
    rating: number;
    reviews: number;
}

// Dummy data located around Bratislava (48.1486, 17.1077)
const MOCK_POINTS: MapPoint[] = [
    { id: '1', title: 'Studio Hair Luxe', category: 'Hair', latitude: 48.1495, longitude: 17.1082, rating: 4.8, reviews: 124 },
    { id: '2', title: 'Bratislava Barbers', category: 'Hair', latitude: 48.1470, longitude: 17.1050, rating: 4.9, reviews: 89 },

    { id: '3', title: 'Glow Beauty Salon', category: 'Beauty', latitude: 48.1500, longitude: 17.1100, rating: 4.7, reviews: 56 },
    { id: '4', title: 'Nail Art Pro', category: 'Beauty', latitude: 48.1460, longitude: 17.1040, rating: 4.5, reviews: 110 },

    { id: '5', title: 'Fresh Living Cleaning', category: 'Cleaning', latitude: 48.1480, longitude: 17.1120, rating: 4.6, reviews: 34 },
    { id: '6', title: 'Eco Cleaners BD', category: 'Cleaning', latitude: 48.1510, longitude: 17.1060, rating: 4.9, reviews: 78 },

    { id: '7', title: 'Iron Gym Bratislava', category: 'Fitness Classes', latitude: 48.1455, longitude: 17.1090, rating: 4.8, reviews: 231 },
    { id: '8', title: 'Zen Yoga Studio', category: 'Fitness Classes', latitude: 48.1492, longitude: 17.1025, rating: 5.0, reviews: 45 },

    { id: '9', title: 'SpeakEasy English', category: 'Language', latitude: 48.1440, longitude: 17.1030, rating: 4.7, reviews: 67 },
    { id: '10', title: 'Slovak Tutor Max', category: 'Language', latitude: 48.1520, longitude: 17.1110, rating: 4.9, reviews: 92 },

    { id: '11', title: 'Royal Thai Spa', category: 'Spa', latitude: 48.1475, longitude: 17.1085, rating: 4.8, reviews: 145 },
    { id: '12', title: 'Thermal Wellness Retreat', category: 'Spa', latitude: 48.1430, longitude: 17.1100, rating: 4.6, reviews: 88 },

    { id: '13', title: 'Healing Hands Massage', category: 'Massage', latitude: 48.1498, longitude: 17.1045, rating: 4.9, reviews: 112 },
    { id: '14', title: 'Deep Tissue Pros', category: 'Massage', latitude: 48.1505, longitude: 17.1095, rating: 4.7, reviews: 54 },

    { id: '15', title: 'Shine Auto Detailing', category: 'Car Detailing', latitude: 48.1425, longitude: 17.1055, rating: 4.5, reviews: 33 },
    { id: '16', title: 'Premium Mobile Wash', category: 'Car Detailing', latitude: 48.1450, longitude: 17.1130, rating: 4.8, reviews: 76 },

    { id: '17', title: 'Pixel Perfect Portraits', category: 'Photography', latitude: 48.1515, longitude: 17.1035, rating: 5.0, reviews: 44 },
    { id: '18', title: 'Event Captures BT', category: 'Photography', latitude: 48.1465, longitude: 17.1125, rating: 4.7, reviews: 62 },
];

/**
 * Simulates fetching map points from Firebase.
 * In the future, this will be replaced with actual Firestore/Realtime Database queries.
 * @param category Optional category to filter by
 * @param sort Optional sort param to simulate filtering logic from DB
 * @returns Promise that resolves to an array of MapPoint
 */
export async function fetchMapPoints(category?: string | null, sort: 'rating' | 'reviews' | null = null): Promise<MapPoint[]> {
    return new Promise((resolve) => {
        let results = MOCK_POINTS;

        if (category && category !== 'All') {
            results = results.filter(p => p.category === category);
        }

        // Simulate DB filtering
        if (sort === 'rating') {
            results = [...results].sort((a, b) => b.rating - a.rating);
        } else if (sort === 'reviews') {
            results = [...results].sort((a, b) => b.reviews - a.reviews);
        }

        resolve(results);
    });
}
