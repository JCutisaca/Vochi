"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { interviewTypes } from "../_lib/landingData";

export default function InterviewTypesSection() {
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
          Modalidades
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Dos tipos de entrevista, un solo objetivo
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {interviewTypes.map((type, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <Card
              className={`h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${
                i === 0 ? "border-primary/20" : "border-border"
              }`}
            >
              <CardContent className="p-8">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                    i === 0 ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <type.icon
                    className={`w-6 h-6 ${
                      i === 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {type.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {type.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {type.tags.map((tag, j) => (
                    <Badge
                      key={j}
                      variant="secondary"
                      className="text-xs font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
