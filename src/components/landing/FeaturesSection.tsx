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
  Bell,
  Brain,
  CloudUpload,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: CheckCircle2,
    title: 'Cumplimiento NOM-004',
    description: 'Sistema certificado que cumple con la Norma Oficial Mexicana NOM-004-SSA3-2012 para el expediente clínico electrónico. Garantía legal y profesional.',
    color: 'text-primary',
    featured: true
  },
  {
    icon: Brain,
    title: 'Asistente Médico con IA',
    description: 'Pregunta en lenguaje natural y recibe sugerencias inteligentes de tratamientos, alertas automáticas de alergias medicamentosas y recomendaciones de medicamentos basadas en el historial del paciente.',
    color: 'text-primary',
    featured: true
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Recupera el control de tu tiempo. Tu agenda se organiza sola, tus clientes llegan puntuales y tú solo te preocupas por dar lo mejor de ti.',
    color: 'text-primary',
    featured: true
  },
  {
    icon: Users,
    title: 'Gestión Completa de Pacientes',
    description: 'Registro detallado con datos personales, historial médico completo, alergias, medicamentos actuales y notas importantes. Todo organizado y accesible al instante.',
    color: 'text-primary',
    featured: true
  },
  {
    icon: Stethoscope,
    title: 'Expediente Clínico Digital',
    description: 'Historias clínicas completas con diagnósticos, tratamientos, evolución del paciente y signos vitales. Cumple con la NOM-004-SSA3-2012 para expedientes clínicos electrónicos.',
    color: 'text-primary',
    featured: true
  },
  {
    icon: CloudUpload,
    title: 'Almacenamiento Ilimitado',
    description: 'Sube documentos médicos, estudios de laboratorio, radiografías e imágenes sin límite de espacio. Toda la información de tus pacientes siempre disponible.',
    color: 'text-primary',
    featured: true
  },
  {
    icon: CreditCard,
    title: 'Control de Pagos',
    description: 'Registra pagos, genera recibos y comprobantes automáticamente. Lleva un control financiero preciso con reportes detallados.',
    color: 'text-primary'
  },
  {
    icon: BarChart3,
    title: 'Reportes y Estadísticas',
    description: 'Visualiza métricas clave de tu consultorio: ingresos, citas atendidas, pacientes nuevos y tendencias de tu práctica médica.',
    color: 'text-primary'
  },
  {
    icon: Building2,
    title: 'Multi-Consultorio',
    description: 'Gestiona múltiples consultorios desde una sola cuenta. Ideal para profesionales con varias ubicaciones o especialidades.',
    color: 'text-primary'
  },
  {
    icon: UserCog,
    title: 'Equipo de Trabajo',
    description: 'Agrega doctores y personal administrativo con roles y permisos personalizados según sus funciones.',
    color: 'text-primary'
  },
  {
    icon: FileText,
    title: 'Recetas y Documentos',
    description: 'Genera recetas médicas profesionales, comprobantes de pago y documentos con tu membrete y firma digital.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    description: 'Datos protegidos con encriptación de nivel bancario, respaldos automáticos diarios y cumplimiento con normativas de privacidad.',
    color: 'text-primary'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-12 md:py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 leading-tight">
            Potencia tu práctica médica con{' '}
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Inteligencia Artificial
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Asistente inteligente que te apoya en tratamientos, detecta alergias y sugiere medicamentos. 
            Cumple con NOM-004, almacenamiento ilimitado y todas las herramientas que necesitas para 
            transformar tu consultorio en una práctica médica moderna y eficiente.
          </p>
        </div>
        
        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-xl transition-all duration-500 hover:border-primary/50 md:hover:-translate-y-2 md:hover:scale-105 animate-fade-in ${
                feature.featured ? 'border-2 border-primary/30 bg-primary/5' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-3 md:pb-6">
                <div className={`inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg ${
                  feature.featured ? 'bg-primary/20' : 'bg-primary/10'
                } mb-3 md:mb-4 group-hover:bg-primary/30 transition-colors ${feature.color}`}>
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                  {feature.title}
                  {feature.featured && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                      ⭐
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm md:text-base">
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
