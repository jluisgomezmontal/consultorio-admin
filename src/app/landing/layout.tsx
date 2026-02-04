import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MiConsultorio - Sistema con IA para Consultorios Médicos | NOM-004",
  description: "Asistente médico inteligente con IA que sugiere tratamientos, detecta alergias y recomienda medicamentos. Cumple NOM-004, almacenamiento ilimitado de documentos e imágenes. Agenda inteligente, gestión de pacientes y expediente clínico digital.",
  keywords: "inteligencia artificial médica, IA para consultorios, asistente médico IA, NOM-004, expediente clínico electrónico, gestión médica, software médico, agenda médica inteligente, almacenamiento ilimitado médico, sistema para consultorios, alergias medicamentosas, sugerencias de tratamientos",
  openGraph: {
    title: "MiConsultorio - Asistente Médico con Inteligencia Artificial",
    description: "IA que te asiste con tratamientos, alergias y medicamentos. Cumple NOM-004 con almacenamiento ilimitado. Transforma tu práctica médica.",
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
