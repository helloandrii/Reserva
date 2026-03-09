-- Run this in your Supabase SQL Editor to create the table and upload the previous mock pins.

CREATE TABLE IF NOT EXISTS map_points (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    rating DOUBLE PRECISION NOT NULL,
    reviews INTEGER NOT NULL
);

-- Enable Read Access for everyone
ALTER TABLE map_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON map_points
    FOR SELECT USING (true);

INSERT INTO map_points (id, title, category, latitude, longitude, rating, reviews) VALUES
('1', 'Studio Hair Luxe', 'Hair', 48.1495, 17.1082, 4.8, 124),
('2', 'Bratislava Barbers', 'Hair', 48.1470, 17.1050, 4.9, 89),
('3', 'Glow Beauty Salon', 'Beauty', 48.1500, 17.1100, 4.7, 56),
('4', 'Nail Art Pro', 'Beauty', 48.1460, 17.1040, 4.5, 110),
('5', 'Fresh Living Cleaning', 'Cleaning', 48.1480, 17.1120, 4.6, 34),
('6', 'Eco Cleaners BD', 'Cleaning', 48.1510, 17.1060, 4.9, 78),
('7', 'Iron Gym Bratislava', 'Fitness Classes', 48.1455, 17.1090, 4.8, 231),
('8', 'Zen Yoga Studio', 'Fitness Classes', 48.1492, 17.1025, 5.0, 45),
('9', 'SpeakEasy English', 'Language', 48.1440, 17.1030, 4.7, 67),
('10', 'Slovak Tutor Max', 'Language', 48.1520, 17.1110, 4.9, 92),
('11', 'Royal Thai Spa', 'Spa', 48.1475, 17.1085, 4.8, 145),
('12', 'Thermal Wellness Retreat', 'Spa', 48.1430, 17.1100, 4.6, 88),
('13', 'Healing Hands Massage', 'Massage', 48.1498, 17.1045, 4.9, 112),
('14', 'Deep Tissue Pros', 'Massage', 48.1505, 17.1095, 4.7, 54),
('15', 'Shine Auto Detailing', 'Car Detailing', 48.1425, 17.1055, 4.5, 33),
('16', 'Premium Mobile Wash', 'Car Detailing', 48.1450, 17.1130, 4.8, 76),
('17', 'Pixel Perfect Portraits', 'Photography', 48.1515, 17.1035, 5.0, 44),
('18', 'Event Captures BT', 'Photography', 48.1465, 17.1125, 4.7, 62)
ON CONFLICT (id) DO NOTHING;
