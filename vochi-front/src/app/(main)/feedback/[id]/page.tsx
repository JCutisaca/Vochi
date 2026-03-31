"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  MicOff,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import type { InterviewFeedback } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function scoreColor(score: number, outOf = 10) {
  const pct = outOf === 10 ? score * 10 : score;
  if (pct >= 75)
    return {
      text: "text-green-600",
      bg: "bg-green-500",
      badge: "bg-green-500/10 text-green-600",
    };
  if (pct >= 50)
    return {
      text: "text-amber-600",
      bg: "bg-amber-500",
      badge: "bg-amber-500/10 text-amber-600",
    };
  return {
    text: "text-red-500",
    bg: "bg-red-500",
    badge: "bg-red-500/10 text-red-500",
  };
}

const tagColors: Record<"fuerte" | "aceptable" | "debil", string> = {
  fuerte: "bg-green-500/10 text-green-700",
  aceptable: "bg-amber-500/10 text-amber-700",
  debil: "bg-red-500/10 text-red-600",
};

const tagLabel: Record<"fuerte" | "aceptable" | "debil", string> = {
  fuerte: "Fuerte",
  aceptable: "Aceptable",
  debil: "Débil",
};

const priorityColors: Record<"alta" | "media" | "baja", string> = {
  alta: "bg-red-500/10 text-red-600",
  media: "bg-amber-500/10 text-amber-700",
  baja: "bg-blue-500/10 text-blue-600",
};

const priorityLabel: Record<"alta" | "media" | "baja", string> = {
  alta: "Alta prioridad",
  media: "Media prioridad",
  baja: "Baja prioridad",
};

export default function FeedbackPage() {
  const params = useParams<{ id: string }>();
  const interviewId = params.id;
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noTranscript, setNoTranscript] = useState(false);

  const loadFeedback = useCallback(async (endpoint: string) => {
    try {
      const response = await apiFetch(endpoint, {
        method: endpoint.includes("regenerate") ? "POST" : "GET",
      });

      if (!response.ok) {
        let message = "No se pudo cargar el feedback";
        try {
          const body = (await response.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {}
        if (response.status === 422) setNoTranscript(true);
        throw new Error(message);
      }

      const data = (await response.json()) as InterviewFeedback;
      setFeedback(data);
      setError(null);
      setNoTranscript(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo cargar el feedback",
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const minDelay = new Promise<void>((resolve) => {
      const t = setTimeout(resolve, 3000);
      return () => clearTimeout(t);
    });

    void Promise.all([
      loadFeedback(`/interviews/${interviewId}/feedback`),
      minDelay,
    ]).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [interviewId, loadFeedback]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 max-w-xs text-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-accent/20 animate-ping" />
            <span className="absolute inset-2 rounded-full border border-accent/30 animate-[ping_1.5s_ease-in-out_0.4s_infinite]" />
            <span className="relative w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
              <Image src="/logo.svg" alt="Vochi" width={32} height={32} />
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-base font-medium text-foreground">
              Analizando tu entrevista
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La IA está procesando tu conversación y generando feedback
              personalizado.
            </p>
          </div>

          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-[progress_2s_ease-in-out_infinite]" />
          </div>

          <style>{`
            @keyframes progress {
              0%   { width: 0%;   margin-left: 0%; }
              50%  { width: 60%;  margin-left: 20%; }
              100% { width: 0%;   margin-left: 100%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!feedback || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center flex flex-col items-center gap-4">
            {noTranscript ? (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <MicOff className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    No se guardaron tus respuestas
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    La transcripción del audio del candidato no llegó al
                    servidor durante esta entrevista. Esto ya está corregido —
                    en la próxima entrevista tus respuestas se guardarán
                    correctamente.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/setup">Hacer una nueva entrevista</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-destructive">
                  {error || "Sin feedback disponible"}
                </p>
                <Button asChild>
                  <Link href="/history">Volver al historial</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const mainColor = scoreColor(feedback.score, 100);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al historial
        </Link>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                  Tu feedback de entrevista
                </p>
                <h1 className="text-2xl font-bold text-foreground">
                  Resultado general
                </h1>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold text-lg flex-shrink-0 ${mainColor.badge}`}
              >
                <Trophy className="w-5 h-5" />
                <span>{feedback.score}/100</span>
              </div>
            </div>

            <p className="text-muted-foreground mt-4 leading-relaxed text-sm">
              {feedback.summary}
            </p>

            {feedback.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {feedback.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {feedback.metrics?.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-5">
                Desglose por dimensión
              </p>
              <div className="space-y-4">
                {feedback.metrics.map((m) => {
                  const c = scoreColor(m.score, 10);
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {m.label}
                        </span>
                        <span
                          className={`text-sm font-semibold tabular-nums ${c.text}`}
                        >
                          {m.score}/10
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.bg}`}
                          style={{ width: `${m.score * 10}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {m.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {feedback.moments?.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                Momentos clave de la entrevista
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                Los momentos que más pesaron en tu score
              </p>
              <div className="space-y-3">
                {feedback.moments.map((moment, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Pregunta: {moment.question}
                    </p>
                    <p className="text-sm text-foreground font-medium mb-3">
                      &ldquo;{moment.answer}&rdquo;
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[moment.tag]}`}
                    >
                      {tagLabel[moment.tag]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {feedback.improvements?.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-5">
                Puntos de mejora
              </p>
              <div className="space-y-4">
                {feedback.improvements.map((imp, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="font-semibold text-sm text-foreground">
                        {imp.title}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priorityColors[imp.priority]}`}
                      >
                        {priorityLabel[imp.priority]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {imp.body}
                    </p>
                    {imp.quote && (
                      <blockquote className="border-l-2 border-border pl-3 text-sm text-muted-foreground italic">
                        &ldquo;{imp.quote}&rdquo;
                      </blockquote>
                    )}
                    {imp.action && (
                      <p className="text-sm text-blue-600 font-medium flex items-start gap-1.5">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {imp.action}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {feedback.positives?.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-xs uppercase tracking-widest font-medium">
                  Lo que funcionó bien
                </p>
              </div>
              <ul className="space-y-3">
                {feedback.positives.map((item, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-green-500/5 border border-green-500/15 p-4"
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {feedback.nextSteps?.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lightbulb className="w-4 h-4 text-accent" />
                <p className="text-xs uppercase tracking-widest font-medium text-foreground">
                  Qué hacer ahora
                </p>
              </div>
              <ol className="space-y-4">
                {feedback.nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
