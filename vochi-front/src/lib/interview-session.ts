"use client";
import type { InterviewType } from "@/types";

export interface ActiveInterviewSession {
  interviewId: string;
  jobDescription: string;
  role: string | null;
  company: string | null;
  type: InterviewType;
  startedAt?: number;
}

const listeners = new Set<() => void>();
const sessionCache = new Map<string, ActiveInterviewSession | null>();

function getSessionKey(interviewId: string) {
  return `vochi:interview:${interviewId}`;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function readSessionFromStorage(interviewId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(getSessionKey(interviewId));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ActiveInterviewSession;
  } catch {
    return null;
  }
}

export function saveInterviewSession(session: ActiveInterviewSession) {
  sessionCache.set(session.interviewId, session);
  sessionStorage.setItem(
    getSessionKey(session.interviewId),
    JSON.stringify(session),
  );
  emitChange();
}

export function getInterviewSessionSnapshot(interviewId: string) {
  if (!sessionCache.has(interviewId)) {
    sessionCache.set(interviewId, readSessionFromStorage(interviewId));
  }

  return sessionCache.get(interviewId) ?? null;
}

export function subscribeToInterviewSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function markInterviewStarted(interviewId: string) {
  const current = getInterviewSessionSnapshot(interviewId);
  if (!current || current.startedAt) return;
  const updated = { ...current, startedAt: Date.now() };
  sessionCache.set(interviewId, updated);
  sessionStorage.setItem(getSessionKey(interviewId), JSON.stringify(updated));
  emitChange();
}

export function clearInterviewSession(interviewId: string) {
  sessionCache.set(interviewId, null);
  sessionStorage.removeItem(getSessionKey(interviewId));
  emitChange();
}
