import { useState, useRef, useCallback, useEffect } from "react";

type VoiceState = "idle" | "listening";

interface UseVoiceInputOptions {
  isAssistantSpeaking?: boolean;
  onAudioCaptured?: (audio: Blob, rms: number) => Promise<void> | void;
  onError?: (error: string) => void;
}

const VISUALIZER_BUFFER_LENGTH = 100;

const normalizeRMS = (rms: number): number => {
  const scaled = Math.pow(rms * 10, 1.5);
  return Math.min(1.0, Math.max(0.01, scaled));
};

export function useVoiceInput({
  onAudioCaptured,
  onError,
}: UseVoiceInputOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [visualizerData, setVisualizerData] = useState<number[]>(
    Array(VISUALIZER_BUFFER_LENGTH).fill(0),
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);
  const onAudioCapturedRef = useRef(onAudioCaptured);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onAudioCapturedRef.current = onAudioCaptured;
  }, [onAudioCaptured]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const stop = useCallback(() => {
    activeRef.current = false;
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      if (ctx.state !== "closed") void ctx.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setState("idle");
    setVisualizerData(Array(VISUALIZER_BUFFER_LENGTH).fill(0));
  }, []);

  const start = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      if (!activeRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      await audioContext.audioWorklet.addModule("/worklets/pcm-processor.js");

      if (!activeRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        void audioContext.close();
        return;
      }

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event: MessageEvent) => {
        if (!activeRef.current) return;

        const { type, data, rms, value, ratio } = event.data as {
          type: string;
          data?: { int16arrayBuffer: ArrayBuffer };
          rms?: number;
          value?: number;
          ratio?: number;
        };

        if (type === "sampleRate") {
          return;
        }

        if (type === "chunk" && rms !== undefined) {
          setVisualizerData((prev) => {
            const next = [...prev, normalizeRMS(rms)];
            if (next.length >= VISUALIZER_BUFFER_LENGTH) next.shift();
            return next;
          });

          if (onAudioCapturedRef.current && data?.int16arrayBuffer) {
            const bytes = new Uint8Array(data.int16arrayBuffer);
            let binary = "";
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode(
                ...bytes.subarray(i, i + chunkSize),
              );
            }
            const base64 = btoa(binary);
            const blob = new Blob([base64], { type: "audio/pcm" });
            void onAudioCapturedRef.current(blob, rms);
          }
        }
      };

      source.connect(workletNode);

      setState("listening");
    } catch (err) {
      activeRef.current = false;
      onErrorRef.current?.(
        err instanceof Error ? err.message : "No se pudo acceder al micrófono",
      );
      setState("idle");
    }
  }, []);

  const stopRef = useRef(stop);
  stopRef.current = stop;

  useEffect(() => {
    return () => {
      stopRef.current();
    };
  }, []);

  return {
    state,
    visualizerData,
    isListening: state === "listening",
    isProcessing: false,
    start,
    stop,
  };
}
