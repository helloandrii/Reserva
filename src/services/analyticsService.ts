/**
 * Analytics service — Currently stubbed out as we migrated away from Firebase.
 * Here you can drop in PostHog, Mixpanel, Amplitude, or any custom tracker.
 */

import type { AnalyticsEvent, AnalyticsEventParams } from '@/src/types';

export function trackEvent(
    event: AnalyticsEvent,
    params?: AnalyticsEventParams,
): void {
    // Analytics is currently turned off since we removed Firebase.
    // For logging temporarily, we can just print it safely.
    if (__DEV__) {
        console.log(`[Analytics] ${event}`, params || {});
    }
}
