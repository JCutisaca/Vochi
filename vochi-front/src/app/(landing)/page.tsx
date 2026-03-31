"use client";
import { NavbarPublic } from "@/components/NavbarPublic";
import { motion } from "framer-motion";
import Hero from "./_components/Hero";
import SocialProofBar from "./_components/SocialProofBar";
import EditorialSteps from "./_components/Steps";
import TestimonialsSection from "./_components/TestimonialsSection";
import InterviewTypesSection from "./_components/InterviewTypesSection";
import FAQSection from "./_components/FAQSection";
import CTABanner from "./_components/CTABanner";
import FooterVochi from "./_components/FooterVochi";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarPublic />
      <main className="pt-16">
        <Hero />

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <hr className="border-border" />
        </motion.div>

        <SocialProofBar />

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <hr className="border-border" />
        </motion.div>

        <div className="py-12" />

        <EditorialSteps />

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto mb-24"
        >
          <hr className="border-border" />
        </motion.div>

        <TestimonialsSection />
        <InterviewTypesSection />
        <FAQSection />
        <CTABanner />
      </main>
      <FooterVochi />
    </div>
  );
}
