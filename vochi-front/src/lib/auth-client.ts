"use client";

import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

let persistencePromise: Promise<void> | null = null;

export function initializeFirebaseAuth() {
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence);
  }

  return persistencePromise;
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  await initializeFirebaseAuth();

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logout() {
  await initializeFirebaseAuth();
  await signOut(auth);
}

export async function getIdToken(forceRefresh = false) {
  await initializeFirebaseAuth();

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  return user.getIdToken(forceRefresh);
}
