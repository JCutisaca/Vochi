"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FooterVochi() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/logo-vochi.svg"
              alt="Vochi"
              width={90}
              height={30}
              className="hidden sm:block"
            />
            <Image
              src="/logo.svg"
              alt="Vochi"
              width={28}
              height={28}
              className="sm:hidden"
            />
          </Link>
          <span className="text-muted-foreground text-sm hidden sm:block">
            — Simulador de entrevistas con IA
          </span>
        </div>

        {/* CENTER (legal links) */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition">
            Privacidad
          </Link>
          <Link href="/terms" className="hover:text-foreground transition">
            Términos
          </Link>
        </div>

        {/* RIGHT */}
        <p className="text-xs text-muted-foreground">
          © 2026 Vochi. Todos los derechos reservados.
        </p>
      </div>
    </motion.footer>
  );
}
