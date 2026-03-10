/**
 * Shared formatters for dates, times, currency, and phone numbers.
 */

import type { Timestamp } from '@/src/types';

// ── Date / Time ───────────────────────────────────────────────────────────────

export function formatDate(ts: Timestamp | Date): string {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatTime(ts: Timestamp | Date): string {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    return d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateTime(ts: Timestamp | Date): string {
    return `${formatDate(ts)} at ${formatTime(ts)}`;
}

export function formatRelativeDate(ts: Timestamp | Date): string {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return formatDate(ts);
}

// ── Currency ──────────────────────────────────────────────────────────────────

export function formatPrice(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

// ── Phone ─────────────────────────────────────────────────────────────────────

export function formatPhoneNumber(phone: string): string {
    // Basic E.164 display — adapt to locale as needed
    return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
}

// ── Rating ─────────────────────────────────────────────────────────────────────

export function formatRating(rating: number | null): string {
    if (rating === null) return 'New';
    return rating.toFixed(1);
}
