import type { Metadata } from "next";
import { MainShell } from "./_components/MainShell";

export const metadata: Metadata = {
  title: "Vochi — Simulador de entrevistas",
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainShell>{children}</MainShell>;
}
