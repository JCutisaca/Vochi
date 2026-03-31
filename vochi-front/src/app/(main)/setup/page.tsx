"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Code2,
  ArrowRight,
  Briefcase,
  Clock,
  Lightbulb,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { JobValidationResult, InterviewType } from "@/types";
import { apiFetch } from "@/lib/api";
import { saveInterviewSession } from "@/lib/interview-session";
import { motion, AnimatePresence } from "framer-motion";

const exampleJobDescription = `Frontend Developer SSR

Buscamos un Frontend Developer con 3+ años de experiencia para unirse a nuestro equipo de producto.

Requisitos:
- Experiencia sólida en React y TypeScript
- Conocimiento de testing (Jest, RTL)
- Familiaridad con APIs REST y GraphQL
- Inglés intermedio para reuniones

Beneficios:
- Trabajo remoto o híbrido
- Prepaga de primer nivel
- Budget de capacitación anual`;

type ValidationState = "idle" | "loading" | "error" | "success";

export default function SetupPage() {
  const router = useRouter();
  const [jobText, setJobText] = useState("");
  const [validationState, setValidationState] =
    useState<ValidationState>("idle");
  const [validationError, setValidationError] = useState("");
  const [validatedJob, setValidatedJob] = useState<JobValidationResult | null>(
    null,
  );
  const [interviewType, setInterviewType] = useState<InterviewType | null>(
    null,
  );
  const [isStarting, setIsStarting] = useState(false);

  const handleValidate = async () => {
    if (!jobText.trim() || jobText.trim().length < 50) {
      setValidationState("error");
      setValidationError(
        "El texto es demasiado corto para ser una oferta de trabajo.",
      );
      return;
    }

    setValidationState("loading");
    setValidationError("");

    try {
      const res = await apiFetch("/validate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jobText }),
      });

      const data: JobValidationResult = await res.json();

      if (data.valid) {
        setValidatedJob(data);
        setValidationState("success");
      } else {
        setValidationState("error");
        setValidationError(
          data.reason || "Este texto no parece una oferta de trabajo tech.",
        );
      }
    } catch {
      setValidationState("error");
      setValidationError("Error al analizar la oferta. Intentá de nuevo.");
    }
  };

  const handleStart = async () => {
    if (!validatedJob || !interviewType) return;

    setIsStarting(true);

    try {
      const res = await apiFetch("/interviews/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobText,
          company: validatedJob.company,
          role: validatedJob.role,
          type: interviewType,
        }),
      });

      const data = await res.json();
      const interviewId = data.interviewId ?? data.id;

      if (!interviewId) {
        throw new Error("El backend no devolvio un interviewId");
      }

      saveInterviewSession({
        interviewId,
        jobDescription: jobText,
        role: validatedJob.role ?? null,
        company: validatedJob.company ?? null,
        type: interviewType,
      });

      router.push(`/interview/${interviewId}`);
    } catch {
      setIsStarting(false);
    }
  };

  const showInterviewTypes = validationState === "success";
  const showPrepCard = showInterviewTypes && interviewType !== null;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">
              Paso 1 de 2
            </p>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Configurá tu entrevista
            </h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Pegá la descripción del trabajo y elegí el tipo de práctica.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Card className="mb-8">
                <CardContent className="p-6">
                  <Label
                    htmlFor="job-description"
                    className="mb-3 text-base font-semibold"
                  >
                    Descripción del puesto
                  </Label>
                  <Textarea
                    id="job-description"
                    value={jobText}
                    onChange={(e) => {
                      setJobText(e.target.value);
                      setValidationState("idle");
                      setValidatedJob(null);
                      setInterviewType(null);
                    }}
                    rows={4}
                    style={{ height: "calc(4 * 1.5rem + 1rem)" }}
                    placeholder="Pegá la descripción del trabajo aquí..."
                    className="leading-relaxed border-border/80 shadow-sm focus:border-accent focus:ring-accent/20 focus:ring-2 transition-all resize-none "
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Copiá el texto completo de la oferta — cuanto más detalle,
                    mejor la entrevista
                  </p>

                  <div className="mt-4 min-h-[28px]">
                    {validationState === "error" && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <XCircle className="w-4 h-4" />
                        {validationError}
                      </div>
                    )}
                    {validationState === "success" && validatedJob && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {validatedJob.role} detectado
                          {validatedJob.company && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {validatedJob.company}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {validationState !== "success" && (
                    <Button
                      onClick={handleValidate}
                      disabled={validationState === "loading"}
                      className="mt-4"
                    >
                      {validationState === "loading" && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      )}
                      Analizar oferta
                    </Button>
                  )}
                </CardContent>
              </Card>

              {showInterviewTypes && (
                <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-sm font-medium text-foreground mb-4">
                    ¿Qué tipo de entrevista querés practicar?
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        type: "rrhh" as const,
                        icon: User,
                        title: "Entrevista RRHH",
                        description:
                          "Preguntas sobre tu experiencia, motivación y fit cultural con la empresa.",
                        gradient: "from-violet-500/10 to-purple-500/10",
                        iconBg: "bg-violet-100",
                        iconColor: "text-violet-600",
                      },
                      {
                        type: "tecnica" as const,
                        icon: Code2,
                        title: "Entrevista Técnica",
                        description:
                          "Preguntas técnicas basadas en el stack del puesto.",
                        gradient: "from-blue-500/10 to-cyan-500/10",
                        iconBg: "bg-blue-100",
                        iconColor: "text-blue-600",
                      },
                    ].map((option) => {
                      const isSelected = interviewType === option.type;
                      const Icon = option.icon;

                      return (
                        <motion.button
                          key={option.type}
                          onClick={() => setInterviewType(option.type)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative rounded-xl border-2 p-5 text-left transition-colors overflow-hidden cursor-pointer ${
                            isSelected
                              ? "border-primary bg-gradient-to-br " +
                                option.gradient
                              : "border-border bg-card hover:border-primary/40 hover:bg-gradient-to-br hover:" +
                                option.gradient
                          }`}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                              >
                                <Check className="w-3.5 h-3.5 text-primary-foreground" />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                              isSelected ? option.iconBg : "bg-secondary"
                            }`}
                            animate={{
                              rotate: isSelected ? [0, -5, 5, 0] : 0,
                            }}
                            transition={{ duration: 0.4 }}
                          >
                            <Icon
                              className={`w-5 h-5 transition-colors ${
                                isSelected
                                  ? option.iconColor
                                  : "text-foreground"
                              }`}
                            />
                          </motion.div>

                          <p
                            className={`font-semibold mb-1 transition-colors ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {option.title}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {option.description}
                          </p>

                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              )}

              {showPrepCard && validatedJob && (
                <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
                        Antes de empezar
                      </p>
                      <h3 className="font-semibold text-foreground mb-4">
                        Lo que detectamos del puesto
                      </h3>
                      <ul className="space-y-3">
                        {validatedJob.prepFacts?.map((fact, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-foreground"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                            {fact}
                          </li>
                        ))}
                      </ul>

                      {validatedJob.stack && validatedJob.stack.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {validatedJob.stack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          {validatedJob.role}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {interviewType === "rrhh" ? "~20 min" : "~30 min"} de
                          entrevista
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {showPrepCard && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Button
                    onClick={handleStart}
                    disabled={isStarting}
                    size="lg"
                    className="w-full"
                  >
                    {isStarting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-5 h-5 mr-2" />
                    )}
                    {isStarting
                      ? "Preparando entrevista..."
                      : "Comenzar entrevista"}
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <Card className="border-dashed border-border/60 bg-muted/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Ejemplo de buena descripción
                    </p>
                  </div>

                  <div className="rounded-lg bg-card border border-border p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        job-posting.txt
                      </span>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {exampleJobDescription}
                    </pre>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Tip:</span>{" "}
                    Incluí requisitos técnicos, nivel de seniority, y detalles
                    del equipo para una práctica más realista.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
