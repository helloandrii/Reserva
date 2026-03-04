/**
 * Analytics service — typed wrapper around Firebase Analytics.
 * Swap the implementation layer without touching call sites.
 */

import { getAnalytics, logEvent } from 'firebase/analytics';

import app from '@/firebase/firebaseConfig';
import type { AnalyticsEvent, AnalyticsEventParams } from '@/src/types';

let analytics: ReturnType<typeof getAnalytics> | null = null;

function getAnalyticsInstance() {
    if (!analytics) {
        try {
            analytics = getAnalytics(app);
        } catch {
            // Analytics not supported (e.g. Expo Go), silently ignore
            return null;
        }
    }
    return analytics;
}

export function trackEvent(
    event: AnalyticsEvent,
    params?: AnalyticsEventParams,
): void {
    const a = getAnalyticsInstance();
    if (!a) return;
    try {
        logEvent(a, event, params);
    } catch (err) {
        // Never let analytics crash the app
        console.warn('[Analytics] Failed to log event:', event, err);
    }
}
