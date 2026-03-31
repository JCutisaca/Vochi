import { FileText, LayoutList, Mic2, Code, Users } from "lucide-react";

export const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Pegá la descripción del trabajo",
    description:
      "Copiá el texto de la oferta laboral. La IA extrae el rol, tecnologías y requisitos clave automáticamente.",
  },
  {
    number: "02",
    icon: LayoutList,
    title: "Elegí el tipo de entrevista",
    description:
      "Seleccioná entre entrevista de RRHH para el fit cultural o técnica para demostrar tus skills.",
  },
  {
    number: "03",
    icon: Mic2,
    title: "Practicá con IA por voz",
    description:
      "Hablá en tiempo real con la IA. Al terminar, recibís feedback detallado y tu score.",
  },
];

export const socialStats = [
  { value: "2.400+", label: "desarrolladores" },
  { value: "4.8★", label: "promedio" },
  { value: "RRHH y Técnica", label: "modalidades" },
  { value: "+500", label: "entrevistas hoy" },
];

export const testimonials = [
  {
    initials: "ML",
    name: "Martín López",
    role: "Frontend Dev @ Mercado Libre",
    quote:
      "Vochi me ayudó a practicar para mi entrevista técnica en React. El feedback fue increíblemente preciso y me sentí mucho más seguro el día de la entrevista real.",
  },
  {
    initials: "SC",
    name: "Sofía Castillo",
    role: "Backend Engineer @ Globant",
    quote:
      "La entrevista de RRHH simulada fue muy realista. Me preparó para preguntas que realmente me hicieron después. Totalmente recomendado.",
  },
  {
    initials: "DR",
    name: "Diego Ramírez",
    role: "Full Stack Dev @ Ualá",
    quote:
      "Practiqué tres veces antes de mi entrevista en Ualá y cada sesión mejoró mi score. La IA detecta exactamente dónde fallas y te ayuda a mejorar.",
  },
];

export const interviewTypes = [
  {
    icon: Code,
    title: "Entrevista Técnica",
    description:
      "Resolvé problemas de código, explicá arquitectura y demostrá tu dominio técnico. La IA adapta las preguntas al stack del puesto.",
    tags: ["Algoritmos", "System Design", "Live Coding"],
  },
  {
    icon: Users,
    title: "Entrevista de RRHH",
    description:
      "Practicá preguntas de fit cultural, liderazgo y situacionales. Mejorá tu comunicación y aprendé a vender tu experiencia.",
    tags: ["Behavioral", "Fit Cultural", "Situacional"],
  },
];

export const faqItems = [
  {
    question: "¿Necesito experiencia previa para usar Vochi?",
    answer:
      "No. Vochi está diseñado tanto para juniors como para seniors. La IA adapta la dificultad de las preguntas al nivel del puesto que pegaste. Si es tu primera entrevista o tu décima, Vochi te prepara igual.",
  },
  {
    question: "¿Cómo funciona la entrevista por voz?",
    answer:
      "Usamos reconocimiento de voz en tiempo real. Vos hablás por micrófono y la IA responde como un entrevistador real. La conversación fluye naturalmente, como si estuvieras en una videollamada real.",
  },
  {
    question: "¿Qué tipo de feedback recibo?",
    answer:
      "Al terminar cada sesión, recibís un score general, análisis de tus respuestas punto por punto, áreas de mejora específicas y sugerencias para respuestas más efectivas.",
  },
  {
    question: "¿Es realmente gratis?",
    answer:
      "Sí. Podés hacer simulaciones sin costo. Tenemos planes premium con features avanzadas, pero la experiencia core es completamente gratuita.",
  },
  {
    question: "¿Funciona para cualquier rol o solo desarrollo?",
    answer:
      "Actualmente está optimizado para roles de desarrollo de software (frontend, backend, full stack, mobile, DevOps). Estamos trabajando para agregar más áreas próximamente.",
  },
];
