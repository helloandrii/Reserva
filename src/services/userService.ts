/**
 * User service — Supabase operations for the users table and storage bucket.
 * All profile reads and writes go through this module.
 */

import type { UserProfile } from '@/src/types';
import { supabase } from '@/utils/supabase';

const USERS = 'users';

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from(USERS).select('*').eq('id', uid).single();
    if (error || !data) return null;
    return data as UserProfile;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function updateUser(
    uid: string,
    updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>,
): Promise<void> {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await supabase.from(USERS).update(payload).eq('id', uid);
}

// ── Profile photo ─────────────────────────────────────────────────────────────

export async function uploadProfilePhoto(
    uid: string,
    localUri: string,
): Promise<string> {
    const blob = await uriToBlob(localUri);
    // You must create a 'profiles' bucket in Supabase for this to work
    const fileName = `users/${uid}/profile.jpg`;
    
    await supabase.storage.from('profiles').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
    const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
    
    await updateUser(uid, { photoURL: data.publicUrl });
    return data.publicUrl;
}

export async function deleteProfilePhoto(uid: string): Promise<void> {
    const fileName = `users/${uid}/profile.jpg`;
    await supabase.storage.from('profiles').remove([fileName]);
    await updateUser(uid, { photoURL: null });
}

// ── Account ───────────────────────────────────────────────────────────────────

export async function deleteUser(uid: string): Promise<void> {
    await supabase.from(USERS).delete().eq('id', uid);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return response.blob();
}
