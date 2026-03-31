"use client";
import { motion } from "framer-motion";
import { socialStats } from "../_lib/landingData";

export default function SocialProofBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-6"
    >
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-0 md:divide-x divide-border py-8">
        {socialStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col items-center text-center px-6 md:px-8"
          >
            <span className="text-xl md:text-2xl font-bold text-foreground">
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
