import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "R7 CRM — Gestão de Imóveis",
  description: "CRM de gestão de imóveis e locações da R7 Participações",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
