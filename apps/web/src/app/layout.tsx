import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Sistema de Convivencia Escolar - Colegio UdeC",
  description: "Sistema de gestión de incidentes de convivencia escolar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = {
    name: 'Funcionario Usuario',
    role: 'Profesor'
  };

  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#f1f5f9', fontSize: 14 }}>
          <Sidebar user={user} />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}