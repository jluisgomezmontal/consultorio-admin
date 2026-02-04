'use client';

import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeroCarousel } from './HeroCarousel';

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      
      {/* 🔹 Background Carousel */}
      <div className="absolute inset-0 z-0">
        <HeroCarousel />
      </div>

      {/* 🔹 Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/40 to-transparent md:from-black/50 md:via-black/30 md:to-transparent" />

      {/* 🔹 Grid Overlay */}
      <div className="absolute inset-0 z-10 bg-grid-pattern opacity-5" />

      {/* 🔹 Content */}
<div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pt-12 pb-8 md:pt-24 md:pb-16">

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center w-full">
          
          <div className="max-w-2xl space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in">

            {/* 🔸 Badge */}
            <div className="relative z-30 inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-white dark:bg-gray-900 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary dark:text-primary border-2 border-primary/40 dark:border-primary/60 shadow-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 md:hover:scale-105 hover:border-primary/60 dark:hover:border-primary">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              Potenciado con Inteligencia Artificial
            </div>

            {/* 🔸 Title */}
            <h1 className="animate-slide-up text-3xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              Tu asistente médico inteligente para{' '}
              <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                tratamientos precisos
              </span>
            </h1>

            {/* 🔸 Description */}
            <p className="animate-slide-up animation-delay-100 text-sm sm:text-base md:text-lg lg:text-xl text-white/95 drop-shadow-lg font-medium leading-relaxed">
              Inteligencia Artificial que te asiste en tiempo real con sugerencias de tratamientos, 
              alertas de alergias y recomendaciones de medicamentos. Cumpliendo con la NOM-004 y con almacenamiento ilimitado de documentos e imágenes.
            </p>

            {/* 🔸 CTA Buttons */}
            <div className="animate-slide-up animation-delay-200 flex flex-col gap-2.5 sm:flex-row sm:gap-3 md:gap-6">
              <Button
                asChild
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-white dark:text-white text-sm md:text-base shadow-xl transition-all duration-300 md:hover:scale-105 hover:shadow-2xl border-2 border-primary hover:border-primary/80"
              >
                <Link href="/register">
                  Comenzar gratis
                  <ArrowRight className="ml-1.5 md:ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base backdrop-blur-sm border-2 border-white dark:border-gray-700 shadow-lg transition-all duration-300 md:hover:scale-105 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-600"
              >
                <Link href="/login">
                  Iniciar sesión
                </Link>
              </Button>
            </div>

            {/* 🔸 Social Proof */}
            <div className="animate-slide-up animation-delay-300 flex flex-wrap items-center gap-3 md:gap-8 pt-1 md:pt-4">

              <div className="flex items-center gap-2 md:gap-2 rounded-full bg-white dark:bg-gray-900 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 shadow-lg border border-white/20 dark:border-gray-700">
                <div className="flex -space-x-1.5 md:-space-x-2">
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px] md:text-xs font-semibold">Dr</div>
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px] md:text-xs font-semibold">Dra</div>
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px] md:text-xs font-semibold">Dr</div>
                </div>
                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-semibold text-gray-900 dark:text-white">500+</span> médicos
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-white dark:bg-gray-900 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 shadow-lg border border-white/20 dark:border-gray-700">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="ml-1 md:ml-2 text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                  4.9/5
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
