'use client';

import { 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Shield,
  Clock,
  Smartphone,
  Building2,
  UserCog,
  Stethoscope,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Programa citas fácilmente, evita conflictos de horarios y envía recordatorios automáticos a tus pacientes.',
    color: 'text-primary'
  },
  {
    icon: Users,
    title: 'Gestión de Pacientes',
    description: 'Mantén un registro completo de tus pacientes con datos personales, historial médico, alergias y notas importantes.',
    color: 'text-primary'
  },
  {
    icon: Stethoscope,
    title: 'Expediente Clínico Digital',
    description: 'Crea y consulta historias clínicas completas con diagnósticos, tratamientos y evolución de cada paciente. Información organizada y siempre disponible.',
    color: 'text-primary'
  },
  {
    icon: CreditCard,
    title: 'Control de Pagos',
    description: 'Registra pagos, genera recibos y comprobantes automáticamente. Lleva un control financiero preciso.',
    color: 'text-primary'
  },
  {
    icon: BarChart3,
    title: 'Reportes y Estadísticas',
    description: 'Visualiza métricas clave de tu consultorio: ingresos, citas atendidas, pacientes nuevos y más.',
    color: 'text-primary'
  },
  {
    icon: Building2,
    title: 'Multi-Consultorio',
    description: 'Gestiona múltiples consultorios desde una sola cuenta. Ideal para profesionales con varias ubicaciones.',
    color: 'text-primary'
  },
  {
    icon: UserCog,
    title: 'Equipo de Trabajo',
    description: 'Agrega doctores, recepcionistas y personal administrativo con roles y permisos personalizados.',
    color: 'text-primary'
  },
  {
    icon: FileText,
    title: 'Documentos y Recetas',
    description: 'Genera recetas médicas, comprobantes de pago y documentos profesionales con tu información.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    description: 'Tus datos y los de tus pacientes están protegidos con encriptación y respaldos automáticos.',
    color: 'text-primary'
  },
  {
    icon: Clock,
    title: 'Acceso 24/7',
    description: 'Consulta información de tus pacientes y agenda desde cualquier lugar, en cualquier momento.',
    color: 'text-primary'
  },
  {
    icon: Smartphone,
    title: 'Diseño Responsivo',
    description: 'Funciona perfectamente en computadoras, tablets y smartphones. Trabaja desde cualquier dispositivo.',
    color: 'text-primary'
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Recibe alertas de citas próximas, pagos pendientes y actualizaciones importantes del sistema.',
    color: 'text-primary'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Herramientas profesionales diseñadas para médicos que buscan 
            optimizar su tiempo, mejorar la atención a sus pacientes y hacer crecer su práctica médica.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
