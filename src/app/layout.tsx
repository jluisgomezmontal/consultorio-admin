import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConsultorioProvider } from "@/contexts/ConsultorioContext";
import { ThemeProvider } from "@/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consultorio - Sistema de Gestión",
  description: "Sistema de gestión para consultorios médicos",
  icons: {
    icon: [
      { url: "/miconsultorio.svg", type: "image/svg+xml" },
    ],
    shortcut: [
      { url: "/miconsultorio.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/miconsultorio.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/miconsultorio.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/miconsultorio.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/miconsultorio.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <ConsultorioProvider>
                {children}
              </ConsultorioProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
