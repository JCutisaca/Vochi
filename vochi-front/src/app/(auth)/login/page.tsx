"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/SessionProvider";
import { LoginButton } from "./_components/LoginButton";
import { NavbarPublic } from "@/components/NavbarPublic";
import Image from "next/image";
import Link from "next/link";

function LoginContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && user) {
      router.replace(searchParams.get("next") || "/setup");
    }
  }, [loading, router, searchParams, user]);

  return (
    <div className="min-h-screen bg-background">
      <NavbarPublic />

      <main className="flex items-center justify-center min-h-screen pt-14 px-6">
        <div className="w-full max-w-[360px]">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex justify-center mb-7">
              <Image
                src="/logo-vochi.svg"
                alt="Vochi"
                width={110}
                height={38}
              />
            </div>

            <h1 className="text-center text-[22px] font-bold text-foreground mb-2 leading-snug tracking-tight">
              Practicá hasta que sea natural
            </h1>
            <p className="text-center text-[13px] text-muted-foreground mb-7 leading-relaxed">
              Simulá entrevistas reales con IA y recibí feedback honesto sobre
              tu desempeño.
            </p>

            <LoginButton />

            <div className="flex items-center gap-3 mt-6 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap tracking-wide">
                incluye
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <ul className="flex flex-col gap-3 list-disc pl-5">
              {[
                "Entrevistas de RRHH y técnicas con voz",
                "Feedback detallado por métricas reales",
                "Adaptado al puesto y stack que buscás",
              ].map((text) => (
                <li
                  key={text}
                  className="text-[12.5px] text-muted-foreground leading-snug"
                >
                  {text}
                </li>
              ))}
            </ul>

            <p className="text-center text-[11px] text-muted-foreground/50 leading-relaxed mt-7">
              Al continuar aceptás los{" "}
              <Link
                href="/terms"
                className="text-primary/60 hover:text-primary underline underline-offset-2 transition-colors"
              >
                términos
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacy"
                className="text-primary/60 hover:text-primary underline underline-offset-2 transition-colors"
              >
                privacidad
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
