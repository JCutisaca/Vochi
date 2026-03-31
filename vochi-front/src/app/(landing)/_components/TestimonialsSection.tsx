"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "../_lib/landingData";

export default function TestimonialsSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
          Testimonios
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Lo que dicen los desarrolladores
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
