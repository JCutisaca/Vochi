"use client";

import Link from "next/link";
import Image from "next/image";

export function NavbarPublic() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border py-2">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-14">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo-vochi.svg"
              alt="Vochi logo"
              width={106}
              height={36}
              className="hidden md:flex"
            />
            <Image
              src="/logo.svg"
              alt="Vochi"
              width={36}
              height={36}
              className="md:hidden"
            />
          </Link>

          <div className="flex-1" />

          <Link
            href="/login"
            className="inline-flex items-center px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
