import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AdminHub — Gestione Prenotazioni",
  description:
    "Piattaforma admin per parrucchieri, estetiste e ristoranti. Gestisci prenotazioni da email, telefono, SMS e WhatsApp con assistente AI integrato.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
