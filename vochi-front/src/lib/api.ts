"use client";

import { getIdToken, logout } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_URL}${path}`;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getIdToken();
  const headers = new Headers(init.headers);
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });

  if (res.status === 401) {
    await logout();
    window.location.href = "/login";
    throw new Error("No autorizado");
  }

  return res;
}
