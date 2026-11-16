import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "El club de las flores | Suscripciones de arreglos florales",
  description:
    "Contratación y gestión de suscripciones de arreglos florales personalizados. Proyecto demostrativo de Interacción Humano-Máquina (IHM) y accesibilidad web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-cream font-sans text-charcoal antialiased"
      >
        <Navbar />
        <main id="contenido-principal" className="flex-1 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
