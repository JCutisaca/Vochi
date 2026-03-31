"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-primary text-primary-foreground"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
          ¿Tenés una entrevista pronto?
        </h2>
        <p className="text-primary-foreground/80 mb-10 max-w-lg mx-auto text-lg">
          No te arriesgues. Practicá con Vochi y llegá preparado el día cero.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="hover:scale-[1.02] transition-transform text-primary font-semibold"
        >
          <Link href="/login">
            Comenzar ahora — es gratis
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </motion.section>
  );
}
