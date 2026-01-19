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
      { url: "/iconwhite.jpg", type: "image/jpeg" },
    ],
    shortcut: [
      { url: "/iconwhite.jpg", type: "image/jpeg" },
    ],
    apple: [
      { url: "/iconwhite.jpg", type: "image/jpeg", sizes: "180x180" },
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
        <link rel="icon" href="/iconwhite.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/iconwhite.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/iconwhite.jpg" />
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
