import type { Metadata } from "next";
import "./globals.css";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Sistema de Convivencia Escolar - Colegio UdeC",
  description: "Sistema de gestión de incidentes de convivencia escolar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
