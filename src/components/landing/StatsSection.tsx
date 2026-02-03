'use client';

import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '500+',
    label: 'Profesionales',
    description: 'Médicos activos en la plataforma'
  },
  {
    icon: Calendar,
    value: '15,000+',
    label: 'Citas',
    description: 'Agendadas cada mes'
  },
  {
    icon: FileText,
    value: '8,000+',
    label: 'Pacientes',
    description: 'Atendidos mensualmente'
  },
  {
    icon: TrendingUp,
    value: '40%',
    label: 'Ahorro',
    description: 'En tiempo administrativo'
  }
];

export function StatsSection() {
  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center animate-fade-in transition-all duration-500 md:hover:scale-110"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary-foreground/10 mb-2 md:mb-4">
                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">{stat.value}</div>
              <div className="text-sm sm:text-base md:text-lg font-semibold mb-0.5 md:mb-1">{stat.label}</div>
              <div className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
