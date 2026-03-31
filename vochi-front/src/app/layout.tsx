import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/SessionProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Vochi — Practica en voz alta. Entra con confianza.",
    template: "%s | Vochi",
  },
  description:
    "Simulador de entrevistas por voz con IA para desarrolladores. Practicá entrevistas técnicas y de RRHH con inteligencia artificial.",
  applicationName: "Vochi",
  metadataBase: new URL("https://vochi.soldierty.app"),
  keywords: [
    "entrevista",
    "simulador",
    "IA",
    "inteligencia artificial",
    "práctica",
    "entrevista técnica",
    "RRHH",
    "developer",
    "voz",
  ],
  authors: [{ name: "Vochi" }],
  creator: "Vochi",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Vochi",
    title: "Vochi — Practica en voz alta. Entra con confianza.",
    description:
      "Simulador de entrevistas por voz con IA. Practicá entrevistas técnicas y de RRHH hasta que sea natural.",
  },
  twitter: {
    card: "summary",
    title: "Vochi — Practica en voz alta. Entra con confianza.",
    description:
      "Simulador de entrevistas por voz con IA. Practicá hasta que sea natural.",
  },
  appleWebApp: {
    capable: true,
    title: "Vochi",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
