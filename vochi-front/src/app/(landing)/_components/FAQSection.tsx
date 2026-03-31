"use client";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "../_lib/landingData";

export default function FAQSection() {
  return (
    <section className="max-w-3xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
          Preguntas frecuentes
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          ¿Tenés dudas?
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-border/60 data-[state=open]:bg-accent/30 rounded-lg px-1 transition-colors"
            >
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary transition-colors py-5 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
