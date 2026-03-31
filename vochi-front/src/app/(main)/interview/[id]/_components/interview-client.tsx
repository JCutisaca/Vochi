"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { Square, Loader2, WifiOff } from "lucide-react";
import type { Socket } from "socket.io-client";
import Link from "next/link";
import { VoiceVisualizer } from "./voice-visualizer";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { apiFetch } from "@/lib/api";
import { getIdToken } from "@/lib/auth-client";
import {
  clearInterviewSession,
  getInterviewSessionSnapshot,
  markInterviewStarted,
  subscribeToInterviewSession,
} from "@/lib/interview-session";
import { createLiveSocket, fetchRealtimeToken } from "@/lib/live";

type SpeakerState = "ai" | "user";

interface TranscriptEntry {
  speaker: "IA" | "Vos";
  text: string;
}

interface InterviewClientProps {
  interviewId: string;
}

interface OAIEventBase {
  type: string;
}
interface OAITranscriptDelta extends OAIEventBase {
  type: "response.audio_transcript.delta";
  delta: string;
}
interface OAITranscriptDone extends OAIEventBase {
  type: "response.audio_transcript.done";
  transcript: string;
}
interface OAIUserTranscriptDone extends OAIEventBase {
  type: "conversation.item.input_audio_transcription.completed";
  transcript: string;
}
interface OAIResponseDone extends OAIEventBase {
  type: "response.done";
}
interface OAIResponseCancelled extends OAIEventBase {
  type: "response.cancelled";
}
interface OAIAudioDelta extends OAIEventBase {
  type: "response.audio.delta";
}
interface OAISpeechStarted extends OAIEventBase {
  type: "input_audio_buffer.speech_started";
}

type OAIEvent =
  | OAITranscriptDelta
  | OAITranscriptDone
  | OAIUserTranscriptDone
  | OAIResponseDone
  | OAIResponseCancelled
  | OAIAudioDelta
  | OAISpeechStarted
  | OAIEventBase;

export function InterviewClient({ interviewId }: InterviewClientProps) {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pcStreamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const lastTranscriptSpeakerRef = useRef<TranscriptEntry["speaker"] | null>(
    null,
  );
  const aiTurnBufferRef = useRef("");

  const [speaker, setSpeaker] = useState<SpeakerState>("user");
  const [currentQuestion, setCurrentQuestion] = useState(
    "Conectando entrevista...",
  );
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);

  const session = useSyncExternalStore(
    subscribeToInterviewSession,
    () => getInterviewSessionSnapshot(interviewId),
    () => null,
  );

  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (!getInterviewSessionSnapshot(interviewId)) router.replace("/setup");
  }, []);

  const upsertAssistantTranscript = useCallback((text: string) => {
    const normalized = text.trim();
    setCurrentQuestion(normalized || "Escuchando...");
    if (!normalized) return;
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      if (last?.speaker === "IA") {
        if (last.text === normalized) return prev;
        return [...prev.slice(0, -1), { speaker: "IA", text: normalized }];
      }
      return [...prev, { speaker: "IA", text: normalized }];
    });
  }, []);

  useEffect(() => {
    if (!sessionRef.current) return;
    let cancelled = false;

    void (async () => {
      try {
        const ephemeralToken = await fetchRealtimeToken(interviewId);
        if (cancelled) return;

        const firebaseToken = await getIdToken();
        if (cancelled) return;

        const socket = createLiveSocket({ token: firebaseToken, interviewId });
        socketRef.current = socket;
        socket.on("error", (payload: { message?: string }) => {
          setConnectionError(payload?.message ?? "Error en el servidor.");
        });
        socket.on("connect_error", () => {
          setConnectionError(
            "No se pudo conectar al servidor. Verificá tu conexión e intentá de nuevo.",
          );
        });
        socket.connect();

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.ontrack = (event) => {
          if (!event.streams[0]) return;
          remoteStreamRef.current = event.streams[0];
          const audioEl = document.createElement("audio");
          audioEl.srcObject = event.streams[0];
          audioEl.autoplay = true;
          audioElRef.current = audioEl;
          audioEl.onplay = () => {
            setIsAssistantSpeaking(true);
            setSpeaker("ai");
          };
          audioEl.onended = () => {
            setIsAssistantSpeaking(false);
            setSpeaker("user");
          };
        };

        pc.onconnectionstatechange = () => {
          if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed"
          ) {
            if (cancelled) return;
            void apiFetch(`/interviews/${interviewId}/disconnect`, {
              method: "POST",
            }).catch(() => {});
            clearInterviewSession(interviewId);
            setConnectionLost(true);
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        pcStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const dc = pc.createDataChannel("oai-events");
        dcRef.current = dc;

        dc.onopen = () => {
          if (cancelled) return;
          markInterviewStarted(interviewId);
          setConnectionError(null);
          setCurrentQuestion("Conectado. La IA comenzará en un momento...");

          dc.send(
            JSON.stringify({
              type: "session.update",
              session: {
                input_audio_transcription: { model: "gpt-4o-mini-transcribe" },
              },
            }),
          );

          const s = sessionRef.current!;
          const contextText =
            `A continuación te comparto la job description para la entrevista de hoy:\n\n` +
            `${s.jobDescription}\n\n` +
            `Empresa: ${s.company ?? "no especificada"}. ` +
            `Rol: ${s.role ?? "no especificado"}. ` +
            `Tipo de entrevista: ${s.type === "rrhh" ? "Recursos Humanos" : "Técnica"}.`;

          dc.send(
            JSON.stringify({
              type: "conversation.item.create",
              item: {
                type: "message",
                role: "user",
                content: [{ type: "input_text", text: contextText }],
              },
            }),
          );
          dc.send(JSON.stringify({ type: "response.create" }));
        };

        dc.onmessage = (e: MessageEvent<string>) => {
          if (cancelled) return;
          let oaiEvent: OAIEvent;
          try {
            oaiEvent = JSON.parse(e.data) as OAIEvent;
          } catch {
            return;
          }

          switch (oaiEvent.type) {
            case "response.audio_transcript.delta": {
              const delta = (oaiEvent as OAITranscriptDelta).delta ?? "";
              aiTurnBufferRef.current += delta;
              lastTranscriptSpeakerRef.current = "IA";
              upsertAssistantTranscript(aiTurnBufferRef.current);
              break;
            }
            case "response.audio_transcript.done": {
              const fullText = (oaiEvent as OAITranscriptDone).transcript ?? "";
              if (fullText) {
                aiTurnBufferRef.current = fullText;
                upsertAssistantTranscript(fullText);
                socket.emit("ai_transcript", { text: fullText });
                aiTurnBufferRef.current = "";
              }
              break;
            }
            case "conversation.item.input_audio_transcription.completed": {
              const userText =
                (oaiEvent as OAIUserTranscriptDone).transcript ?? "";
              if (userText) {
                const isContinuation =
                  lastTranscriptSpeakerRef.current === "Vos";
                setTranscript((prev) => {
                  const last = prev[prev.length - 1];
                  if (isContinuation && last?.speaker === "Vos") {
                    return [
                      ...prev.slice(0, -1),
                      {
                        speaker: "Vos",
                        text: `${last.text} ${userText}`.trim(),
                      },
                    ];
                  }
                  return [...prev, { speaker: "Vos", text: userText }];
                });
                socket.emit("user_transcript", { text: userText });
              }
              break;
            }
            case "input_audio_buffer.speech_started": {
              setSpeaker("user");
              setIsAssistantSpeaking(false);
              lastTranscriptSpeakerRef.current = "Vos";
              break;
            }
            case "response.audio.delta": {
              setIsAssistantSpeaking(true);
              setSpeaker("ai");
              break;
            }
            case "response.done": {
              setIsAssistantSpeaking(false);
              setSpeaker("user");
              break;
            }
            case "response.cancelled": {
              setIsAssistantSpeaking(false);
              setSpeaker("user");
              if (aiTurnBufferRef.current) {
                socket.emit("ai_transcript", { text: aiTurnBufferRef.current });
                aiTurnBufferRef.current = "";
              }
              break;
            }
            case "error": {
              const errEvent = oaiEvent as OAIEventBase & {
                error?: { message?: string; code?: string };
              };
              console.error("[OAI error event]", errEvent.error);
              break;
            }
            case "conversation.item.input_audio_transcription.failed": {
              const failEvent = oaiEvent as OAIEventBase & {
                error?: { message?: string; code?: string };
              };
              console.error("[OAI transcription failed]", failEvent.error);
              break;
            }
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpResponse = await fetch(
          "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ephemeralToken}`,
              "Content-Type": "application/sdp",
            },
            body: offer.sdp,
          },
        );

        if (!sdpResponse.ok) {
          const errText = await sdpResponse.text();
          throw new Error(`OpenAI SDP error ${sdpResponse.status}: ${errText}`);
        }

        const answerSdp = await sdpResponse.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      } catch (error) {
        if (cancelled) return;
        const raw = error instanceof Error ? error.message : "";
        const friendly =
          raw.toLowerCase().includes("failed to fetch") ||
          raw.toLowerCase().includes("network") ||
          raw.toLowerCase().includes("load failed")
            ? "No se pudo conectar al servidor. Verificá tu conexión e intentá de nuevo."
            : raw || "No se pudo conectar a la entrevista";
        setConnectionError(friendly);
      }
    })();

    return () => {
      cancelled = true;
      dcRef.current?.close();
      dcRef.current = null;
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.srcObject = null;
        audioElRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
        remoteStreamRef.current = null;
      }
      const senders = pcRef.current?.getSenders() ?? [];
      senders.forEach((s) => s.track?.stop());
      const pcTracks = pcStreamRef.current?.getTracks() ?? [];
      pcTracks.forEach((t) => t.stop());
      pcStreamRef.current = null;
      pcRef.current?.close();
      pcRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [interviewId, upsertAssistantTranscript]);

  const handleVoiceInputError = useCallback((error: string) => {
    setConnectionError(error);
  }, []);

  const { state, visualizerData, start, stop } = useVoiceInput({
    isAssistantSpeaking,
    onAudioCaptured: () => {},
    onError: handleVoiceInputError,
  });

  useEffect(() => {
    if (!sessionRef.current) return;
    void start();
    return () => stop();
  }, []);

  const handleEndInterview = async () => {
    setIsEnding(true);
    stop();
    dcRef.current?.close();
    pcStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcStreamRef.current = null;
    pcRef.current?.close();
    socketRef.current?.disconnect();
    try {
      await apiFetch(`/interviews/${interviewId}/end`, { method: "POST" });
      clearInterviewSession(interviewId);
      router.push(`/feedback/${interviewId}`);
    } catch {
      setIsEnding(false);
    }
  };

  const statusText = () => {
    if (speaker === "ai") return "IA hablando...";
    if (state === "listening") return "Escuchando...";
    return "Tu turno";
  };

  if (connectionLost) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 px-6">
        <WifiOff className="w-8 h-8 text-destructive" />
        <div className="text-center">
          <p className="font-semibold text-foreground">Se perdió la conexión</p>
          <p className="text-sm text-muted-foreground mt-1">
            La entrevista se interrumpió por un problema de red.
          </p>
        </div>
        <Link
          href="/setup"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Iniciar nueva entrevista
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col items-center justify-between py-10 px-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  speaker === "ai" ? "bg-accent" : "bg-foreground"
                }`}
              />
              <span className="text-sm text-muted-foreground font-medium">
                {statusText()}
              </span>
            </div>
            {connectionError && (
              <p className="text-xs text-destructive">{connectionError}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-8">
            <VoiceVisualizer state={speaker} visualizerData={visualizerData} />
            <div className="max-w-md text-center">
              <p className="text-foreground font-medium leading-relaxed text-pretty">
                {currentQuestion}
              </p>
            </div>
          </div>

          <button
            onClick={handleEndInterview}
            disabled={isEnding}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:border-destructive/50 hover:text-destructive transition-colors disabled:opacity-50"
          >
            {isEnding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Terminar entrevista
          </button>
        </div>

        <aside className="hidden lg:flex w-80 self-start border-l border-border flex-col sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Transcripcion
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {transcript.map((entry, index) => (
              <div key={`${entry.speaker}-${index}`} className="text-sm">
                <p
                  className={`text-xs font-medium mb-1 ${
                    entry.speaker === "IA"
                      ? "text-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {entry.speaker}
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  {entry.text}
                </p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </aside>
      </div>
    </div>
  );
}
