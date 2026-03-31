"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CalendarDays, Clock3, MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { InterviewType } from "@/types";

type InterviewHistoryItem = {
  id: string;
  company: string | null;
  role: string | null;
  type: InterviewType;
  status: string;
  score: number | null;
  duration: number | null;
  createdAt: string;
  deletedAt: string | null;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

function getScoreColor(score: number) {
  if (score >= 75) return "text-green-600 bg-green-600/10";
  if (score >= 50) return "text-amber-600 bg-amber-600/10";
  return "text-red-600 bg-red-600/10";
}

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInterviews() {
      try {
        const response = await apiFetch("/interviews", { method: "GET" });

        if (!response.ok) {
          throw new Error("No se pudo cargar el historial");
        }

        const data = (await response.json()) as InterviewHistoryItem[];

        if (!cancelled) {
          setInterviews(data.filter((i) => !i.deletedAt));
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "No se pudo cargar el historial",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInterviews();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando entrevistas...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Historial
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              Tus entrevistas
            </h1>
          </div>
          <Button asChild>
            <Link href="/setup">Nueva entrevista</Link>
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-6 text-destructive">{error}</CardContent>
          </Card>
        ) : interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Todavía no practicaste ninguna entrevista
              </p>
              <p className="text-sm text-muted-foreground">
                Pegá una oferta laboral y arrancá tu primera simulación.
              </p>
            </div>
            <Button asChild>
              <Link href="/setup">Comenzar ahora</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <Card key={interview.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {interview.role ?? "Entrevista"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {interview.company ?? "Empresa no especificada"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 font-medium">
                          {interview.type === "rrhh" ? "RRHH" : "Técnica"}
                        </span>
                        {interview.duration !== null && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="w-3.5 h-3.5" />
                            {formatDuration(interview.duration)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatDate(interview.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {typeof interview.score === "number" && (
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getScoreColor(interview.score)}`}
                        >
                          {interview.score}/100
                        </span>
                      )}

                      {interview.status === "finished" ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/feedback/${interview.id}`}>
                            <MessageSquare className="w-4 h-4" />
                            Ver feedback
                          </Link>
                        </Button>
                      ) : interview.status === "abandoned" ? (
                        <>
                          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                            Incompleta
                          </span>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/feedback/${interview.id}`}>
                              <MessageSquare className="w-4 h-4" />
                              Ver feedback
                            </Link>
                          </Button>
                        </>
                      ) : interview.status === "disconnected" ? (
                        <>
                          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600">
                            Conexión perdida
                          </span>
                          <Button asChild variant="outline" size="sm">
                            <Link href="/setup">Reintentar</Link>
                          </Button>
                        </>
                      ) : interview.status === "active" ? (
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600">
                          Incompleta
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
