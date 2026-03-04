/**
 * Centralised permission requests — location, microphone, calendar.
 * Returns true if permission granted.
 */

import * as Calendar from 'expo-calendar';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

// ── Location ──────────────────────────────────────────────────────────────────

export async function requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') return true;

    Alert.alert(
        'Location Required',
        'Enable location access in Settings to see services near you.',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
    );
    return false;
}

export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
    const granted = await requestLocationPermission();
    if (!granted) return null;
    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export async function requestCalendarPermission(): Promise<boolean> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') return true;

    Alert.alert(
        'Calendar Access',
        'Enable calendar access in Settings to add bookings to your calendar.',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
    );
    return false;
}

export async function getDefaultCalendarId(): Promise<string | null> {
    if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        return defaultCalendar?.id ?? null;
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writeable = calendars.find((c) => c.allowsModifications);
    return writeable?.id ?? null;
}
