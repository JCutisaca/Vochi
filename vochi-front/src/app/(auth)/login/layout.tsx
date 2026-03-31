import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión — Vochi",
  description: "Iniciá sesión para empezar a practicar tus entrevistas con IA",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
