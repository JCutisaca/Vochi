"use client";
import { motion } from "framer-motion";
import { steps } from "../_lib/landingData";

export default function EditorialSteps() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
          Cómo funciona
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Tres pasos para tu próxima entrevista
        </h2>
      </motion.div>

      <div className="space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="flex gap-8 md:gap-12 group"
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <span className="text-4xl md:text-5xl font-bold text-primary/15">
                  {step.number}
                </span>
                <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center -translate-y-1/2">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                  className="w-px flex-1 bg-border origin-top my-4"
                />
              )}
            </div>

            <div className="pb-12 md:pb-16">
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
