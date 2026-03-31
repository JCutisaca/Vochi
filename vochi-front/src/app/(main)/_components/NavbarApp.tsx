"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth-client";
import {
  ChevronDown,
  ChevronLeft,
  History,
  LogOutIcon,
  Menu,
  Plus,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getInterviewSessionSnapshot,
  subscribeToInterviewSession,
} from "@/lib/interview-session";

interface NavbarAppProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

function InterviewTimer({ startedAt }: { startedAt?: number }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return (
    <span className="font-mono text-sm text-muted-foreground">
      {startedAt ? `${m}:${s}` : "--:--"}
    </span>
  );
}

export function NavbarApp({ user }: NavbarAppProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const interviewMatch = pathname.match(/^\/interview\/([^/]+)$/);
  const interviewId = interviewMatch?.[1] ?? null;

  const session = useSyncExternalStore(
    subscribeToInterviewSession,
    () => (interviewId ? getInterviewSessionSnapshot(interviewId) : null),
    () => null,
  );

  async function handleLogout() {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("No se pudo cerrar sesion", error);
    }
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const isInterview = !!interviewId;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border py-2">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-14 gap-4">
          {isInterview ? (
            <>
              <Link
                href="/setup"
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm truncate leading-none">
                  {session?.role || "Entrevista"}
                </p>
                {session?.company && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {session.company}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {session?.type === "rrhh" ? "RRHH" : "Técnica"}
                </span>
                <InterviewTimer startedAt={session?.startedAt} />
              </div>
            </>
          ) : (
            <>
              <Link href="/setup" className="flex items-center gap-2 shrink-0">
                <Image
                  src="/logo-vochi.svg"
                  alt="Vochi logo"
                  width={106}
                  height={36}
                  className="rounded-md hidden md:flex"
                />
                <Image
                  src="/logo.svg"
                  alt="Vochi logo"
                  width={36}
                  height={36}
                  className="rounded-md md:hidden"
                />
              </Link>

              <div className="hidden md:flex items-center gap-1 h-full">
                <Link
                  href="/setup"
                  className={`relative px-4 h-full flex items-center text-sm font-medium transition-colors ${
                    pathname === "/setup"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Nueva
                  {pathname === "/setup" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
                <Link
                  href="/history"
                  className={`relative px-4 h-full flex items-center text-sm font-medium transition-colors ${
                    pathname === "/history"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <History className="w-4 h-4 mr-1.5" />
                  Historial
                  {pathname === "/history" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              </div>

              <div className="flex-1" />
            </>
          )}

          <div className="flex items-center gap-3 flex-shrink-0">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-primary flex items-center justify-center text-sm font-semibold border">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">
                      {user.name || "Usuario"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">
                    {user.name || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  className="text-destructive cursor-pointer"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isInterview && (
              <button
                className="md:hidden p-2 hover:bg-muted rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {!isInterview && mobileOpen && (
          <div className="md:hidden border-t border-border pt-3 pb-1 flex flex-col gap-1">
            <Link
              href="/setup"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/setup"
                  ? "bg-accent/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Plus className="w-4 h-4" />
              Nueva entrevista
            </Link>
            <Link
              href="/history"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/history"
                  ? "bg-accent/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <History className="w-4 h-4" />
              Historial
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
