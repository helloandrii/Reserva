/**
 * User service — Firestore operations for the users/ collection.
 * All profile reads and writes go through this module.
 */

import {
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { db } from '@/firebase/firestore';
import { storage } from '@/firebase/storage';
import type { UserProfile } from '@/src/types';

const USERS = 'users';

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, USERS, uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function updateUser(
    uid: string,
    updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>,
): Promise<void> {
    await updateDoc(doc(db, USERS, uid), {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

// ── Profile photo ─────────────────────────────────────────────────────────────

export async function uploadProfilePhoto(
    uid: string,
    localUri: string,
): Promise<string> {
    const blob = await uriToBlob(localUri);
    const storageRef = ref(storage, `users/${uid}/profile.jpg`);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    const downloadURL = await getDownloadURL(storageRef);
    await updateUser(uid, { photoURL: downloadURL });
    return downloadURL;
}

export async function deleteProfilePhoto(uid: string): Promise<void> {
    const storageRef = ref(storage, `users/${uid}/profile.jpg`);
    await deleteObject(storageRef).catch(() => {/* ignore if not found */ });
    await updateUser(uid, { photoURL: null });
}

// ── Account ───────────────────────────────────────────────────────────────────

export async function deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, USERS, uid));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return response.blob();
}
