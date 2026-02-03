'use client';

import { useEffect, useState } from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';

export function ParallaxSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      if (!isMobile) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  return (
    <section className="relative min-h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 md:scale-100"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop)',
          transform: isMobile ? 'none' : `translateY(${scrollY * 0.5}px)`,
          willChange: isMobile ? 'auto' : 'transform'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/85 via-black/75 to-black/70 md:from-black/80 md:via-black/70 md:to-black/60" />
      
      {/* Content */}
      <div className="relative h-full flex items-center py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary dark:text-primary border border-primary/20 shadow-lg mb-4 md:mb-6 animate-fade-in">
              <Shield className="h-3 w-3 md:h-4 md:w-4" />
              Seguridad y Profesionalismo
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 animate-slide-up leading-tight">
              Gestión médica{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                profesional y segura
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8 animate-slide-up animation-delay-100 leading-relaxed">
              Mantén la información de tus pacientes organizada, segura y siempre disponible. 
              Diseñado siguiendo las mejores prácticas médicas y estándares de calidad.
            </p>
            
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 animate-slide-up animation-delay-200">
              <div className="flex items-start gap-2.5 md:gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 transition-all duration-300 hover:bg-white/20 md:hover:scale-105">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white mb-0.5 md:mb-1">Expedientes Organizados</h3>
                  <p className="text-xs md:text-sm text-gray-300">Gestión completa de historias clínicas con toda la información que necesitas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 md:gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 transition-all duration-300 hover:bg-white/20 md:hover:scale-105">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white mb-0.5 md:mb-1">Datos Protegidos</h3>
                  <p className="text-xs md:text-sm text-gray-300">Seguridad y confidencialidad de la información médica de tus pacientes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 md:gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 transition-all duration-300 hover:bg-white/20 md:hover:scale-105">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white mb-0.5 md:mb-1">Acceso Rápido</h3>
                  <p className="text-xs md:text-sm text-gray-300">Consulta el historial completo de tus pacientes en segundos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 md:gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 transition-all duration-300 hover:bg-white/20 md:hover:scale-105">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white mb-0.5 md:mb-1">Respaldo Automático</h3>
                  <p className="text-xs md:text-sm text-gray-300">Tu información siempre segura con copias de respaldo automáticas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
