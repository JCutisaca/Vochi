"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { NavbarApp } from "./NavbarApp";
import { useAuth } from "@/providers/SessionProvider";
import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth-client";

export function MainShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  useEffect(() => {
    if (loading || !user) return;

    let cancelled = false;

    apiFetch("/auth/verify")
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          logout().then(() => router.replace("/login"));
        } else {
          setVerified(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          logout().then(() => router.replace("/login"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  if (loading || !user || !verified) {
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
          <p className="text-sm text-muted-foreground">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavbarApp
        user={{
          name: user.displayName,
          email: user.email,
          image: user.photoURL,
        }}
      />
      <main className="pt-18">{children}</main>
    </div>
  );
}
