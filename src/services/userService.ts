/**
 * User service — Supabase operations for the users table and storage bucket.
 * All profile reads and writes go through this module.
 */

import type { UserProfile } from '@/src/types';
import { supabase } from '@/utils/supabase';

const USERS = 'users';

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUser(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from(USERS).select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as UserProfile;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function updateUser(
    id: string,
    updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>,
): Promise<void> {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await supabase.from(USERS).update(payload).eq('id', id);
}

// ── Profile photo ─────────────────────────────────────────────────────────────

export async function uploadProfilePhoto(
    id: string,
    localUri: string,
): Promise<string> {
    const blob = await uriToBlob(localUri);
    // You must create a 'profiles' bucket in Supabase for this to work
    const fileName = `users/${id}/profile.jpg`;
    
    await supabase.storage.from('profiles').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
    const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
    
    await updateUser(id, { photoURL: data.publicUrl });
    return data.publicUrl;
}

export async function deleteProfilePhoto(id: string): Promise<void> {
    const fileName = `users/${id}/profile.jpg`;
    await supabase.storage.from('profiles').remove([fileName]);
    await updateUser(id, { photoURL: null });
}

// ── Account ───────────────────────────────────────────────────────────────────

export async function deleteUser(id: string): Promise<void> {
    await supabase.from(USERS).delete().eq('id', id);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return response.blob();
}
