import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MiConsultorio - Sistema de Gestión para Consultorios Médicos",
  description: "Simplifica la administración de tu consultorio médico con nuestra plataforma todo-en-uno. Gestiona pacientes, citas, pagos y expedientes clínicos desde un solo lugar.",
  keywords: "consultorio médico, gestión médica, software médico, expediente clínico, agenda médica, sistema para consultorios",
  openGraph: {
    title: "MiConsultorio - Sistema de Gestión para Consultorios Médicos",
    description: "Simplifica la administración de tu consultorio médico con nuestra plataforma todo-en-uno.",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-smooth">
      {children}
    </div>
  );
}
