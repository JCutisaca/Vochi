"use client";
import { io } from "socket.io-client";
import { apiFetch } from "@/lib/api";

function getLiveBaseUrl() {
  const liveUrl =
    process.env.NEXT_PUBLIC_LIVE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!liveUrl) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL");
  }

  const normalized = liveUrl.replace(/\/+$/, "");

  if (process.env.NEXT_PUBLIC_LIVE_URL) {
    return normalized;
  }

  return normalized.replace(/\/api$/i, "");
}

export async function fetchRealtimeToken(interviewId: string): Promise<string> {
  const res = await apiFetch("/live/token", {
    method: "POST",
    body: JSON.stringify({ interviewId }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "Error desconocido");
    throw new Error(`No se pudo obtener el token efímero: ${msg}`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

export function createLiveSocket(params: {
  token: string;
  interviewId: string;
}) {
  return io(`${getLiveBaseUrl()}/live`, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { token: params.token },
    query: {
      interviewId: params.interviewId,
    },
  });
}
