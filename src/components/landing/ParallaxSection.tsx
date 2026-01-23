'use client';

import { useEffect, useState } from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';

export function ParallaxSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop)',
          transform: `translateY(${scrollY * 0.5}px)`,
          willChange: 'transform'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60" />
      
      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary-foreground mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              Seguridad y Profesionalismo
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up">
              Gestión médica{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                profesional y segura
              </span>
            </h2>
            
            <p className="text-xl text-gray-200 mb-8 animate-slide-up animation-delay-100">
              Mantén la información de tus pacientes organizada, segura y siempre disponible. 
              Diseñado siguiendo las mejores prácticas médicas y estándares de calidad.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 animate-slide-up animation-delay-200">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Expedientes Organizados</h3>
                  <p className="text-sm text-gray-300">Gestión completa de historias clínicas con toda la información que necesitas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Datos Protegidos</h3>
                  <p className="text-sm text-gray-300">Seguridad y confidencialidad de la información médica de tus pacientes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Acceso Rápido</h3>
                  <p className="text-sm text-gray-300">Consulta el historial completo de tus pacientes en segundos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Respaldo Automático</h3>
                  <p className="text-sm text-gray-300">Tu información siempre segura con copias de respaldo automáticas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
