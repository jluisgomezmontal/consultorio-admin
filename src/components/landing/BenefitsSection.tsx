'use client';

import { CheckCircle2, Clock, Shield, Zap, HeartPulse, LineChart } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Ahorra hasta 10 horas semanales',
    description: 'Automatiza tareas administrativas y dedica más tiempo a tus pacientes'
  },
  {
    icon: Shield,
    title: 'Cumple con normativas de salud',
    description: 'Sistema seguro que protege la información médica de tus pacientes'
  },
  {
    icon: Zap,
    title: 'Implementación inmediata',
    description: 'Comienza a usar el sistema en menos de 5 minutos, sin instalaciones complejas'
  },
  {
    icon: HeartPulse,
    title: 'Mejora la atención al paciente',
    description: 'Acceso rápido a historiales completos para mejores diagnósticos'
  },
  {
    icon: LineChart,
    title: 'Incrementa tus ingresos',
    description: 'Reduce ausencias con recordatorios y optimiza tu agenda'
  },
  {
    icon: CheckCircle2,
    title: 'Sin contratos largos',
    description: 'Cancela cuando quieras, sin penalizaciones ni compromisos'
  }
];

export function BenefitsSection() {
  return (
    <section className="py-12 md:py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 leading-tight">
            ¿Por qué elegir MiConsultorio?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Más que un software, es tu aliado para hacer crecer tu práctica médica
          </p>
        </div>
        
        <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-8 md:mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex gap-3 md:gap-4 p-4 md:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-xl md:hover:-translate-y-2 md:hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <benefit.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 md:mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 md:mt-16 grid gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="relative h-48 md:h-64 rounded-lg md:rounded-xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1758691463203-cce9d415b2b5?q=80&w=1932&auto=format&fit=crop"
              alt="Profesional médico"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-sm md:text-base text-white font-semibold">Apoyo técnico</p>
          </div>
          
          <div className="relative h-48 md:h-64 rounded-lg md:rounded-xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1758691461888-b74515208d7a?q=80&w=1932&auto=format&fit=crop"
              alt="Atención personalizada"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-sm md:text-base text-white font-semibold">Equipo profesional</p>
          </div>
          <div className="relative h-48 md:h-64 rounded-lg md:rounded-xl overflow-hidden group sm:col-span-2 md:col-span-1">
            <img 
              src="https://images.unsplash.com/photo-1758691463333-c79215e8bc3b?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Atención personalizada"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-sm md:text-base text-white font-semibold">Atención personalizada</p>
          </div>
        </div>
        
        <div className="mt-3 md:mt-4 grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto">
          <div className="relative h-40 md:h-48 rounded-lg md:rounded-xl overflow-hidden group">
            <img 
              src="https://plus.unsplash.com/premium_photo-1675807264889-081a7c76af86?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Consultorio moderno"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-2 md:bottom-3 left-2 md:left-3 text-white text-xs md:text-sm font-semibold">Consultorios modernos</p>
          </div>
          
          <div className="relative h-40 md:h-48 rounded-lg md:rounded-xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1758691462353-36b215702253?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Equipo médico"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-2 md:bottom-3 left-2 md:left-3 text-white text-xs md:text-sm font-semibold">Equipo profesional</p>
          </div>
          
          <div className="relative h-40 md:h-48 rounded-lg md:rounded-xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Colaboración médica"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-2 md:bottom-3 left-2 md:left-3 text-white text-xs md:text-sm font-semibold">Trabajo en equipo</p>
          </div>
          
          <div className="relative h-40 md:h-48 rounded-lg md:rounded-xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Expedientes digitales"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-2 md:bottom-3 left-2 md:left-3 text-white text-xs md:text-sm font-semibold">Gestión digital</p>
          </div>
        </div>
      </div>
    </section>
  );
}
