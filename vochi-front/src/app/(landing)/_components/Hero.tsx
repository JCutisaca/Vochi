"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden max-w-6xl mx-auto px-6 pt-16 pb-28">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 20%, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Image
            src="/logo-vochi.svg"
            alt="Vochi"
            width={120}
            height={40}
            className="block"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="rounded-full border-primary/30 bg-primary/5 text-primary mb-10 text-xs px-4 py-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-2" />
            Simulador de entrevistas con IA
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-bold text-foreground leading-[0.95] tracking-tight mb-8"
          style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
        >
          Practica en voz alta.
          <br />
          <span className="text-muted-foreground">Entra con confianza.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10"
        >
          Vochi es el simulador de entrevistas por voz con IA diseñado para
          desarrolladores. Pegá la oferta de trabajo y practicá en tiempo real —
          técnica o RRHH.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-start gap-3"
        >
          <Button
            asChild
            size="lg"
            className="hover:scale-[1.02] transition-transform"
          >
            <Link href="/login">
              Simular entrevista
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:scale-[1.02] transition-transform"
          >
            <Link href="/history">Ver mis entrevistas</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 text-xs text-muted-foreground"
        >
          Más de{" "}
          <span className="text-foreground font-medium">
            2.400 desarrolladores
          </span>{" "}
          ya practicaron con Vochi
        </motion.p>
      </div>
    </section>
  );
}
