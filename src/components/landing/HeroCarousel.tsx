'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroCarouselProps {
  onSlideChange?: (index: number) => void;
}

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
    alt: 'Médico profesional atendiendo paciente',
    title: 'Gestión de Pacientes',
    description: 'Administra expedientes clínicos completos y seguimiento personalizado'
  },
  {
    url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop',
    alt: 'Consultorio médico moderno',
    title: 'Agenda Inteligente',
    description: 'Programa citas y optimiza tu tiempo con recordatorios automáticos'
  },
  {
    url: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=2070&auto=format&fit=crop',
    alt: 'Doctor revisando expediente digital',
    title: 'Expedientes Digitales',
    description: 'Accede a historiales médicos desde cualquier dispositivo de forma segura'
  },
  {
    url: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=2072&auto=format&fit=crop',
    alt: 'Equipo médico colaborando',
    title: 'Control de Pagos',
    description: 'Gestiona cobros, facturación y reportes financieros en tiempo real'
  },
  {
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop',
    alt: 'Tecnología médica avanzada',
    title: 'Recetas Electrónicas',
    description: 'Genera prescripciones digitales con firma electrónica certificada'
  },
  {
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
    title: 'Reportes y Análisis',
    description: 'Visualiza estadísticas y métricas para mejorar tu práctica médica'
  },
  {
    url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2064&auto=format&fit=crop',
    alt: 'Profesionales de la salud',
    title: 'Multi-usuario',
    description: 'Colabora con tu equipo médico con roles y permisos personalizados'
  },
  {
    url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2128&auto=format&fit=crop',
    alt: 'Consultorio equipado',
    title: 'Seguridad y Respaldo',
    description: 'Protección de datos con encriptación y respaldos automáticos en la nube'
  }
];

export function HeroCarousel({ onSlideChange }: HeroCarouselProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % carouselImages.length;
        onSlideChange?.(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, onSlideChange]);

  useEffect(() => {
    onSlideChange?.(currentIndex);
  }, [currentIndex, onSlideChange]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-full w-full overflow-hidden group">
      {/* Images */}
      <div className="relative h-full w-full">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
              index === currentIndex
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-110 z-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/25" />
            
            {/* Feature Text Overlay */}
            <div className="absolute inset-0 flex items-end justify-end p-6 md:p-12 lg:p-16">
              <div className="max-w-2xl space-y-3 md:space-y-4">
                <div className="inline-block">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-2xl">
                    {image.title}
                  </h3>
                  <div className="h-1 bg-primary mt-2 rounded-full" style={{ width: '60%' }} />
                </div>
                <p className="text-sm md:text-base lg:text-lg xl:text-xl text-white/95 drop-shadow-lg font-medium leading-relaxed">
                  {image.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        aria-label="Imagen anterior"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        aria-label="Imagen siguiente"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-20">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 backdrop-blur-sm ${
              index === currentIndex
                ? 'w-6 md:w-8 bg-white shadow-lg'
                : 'w-1.5 md:w-2 bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
