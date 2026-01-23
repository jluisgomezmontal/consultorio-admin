'use client';

import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeroCarousel } from './HeroCarousel';

export function HeroSection() {
  return (
    <section className="relative  min-h-[calc(100vh-64px)] overflow-hidden">
      
      {/* 🔹 Background Carousel */}
      <div className="absolute inset-0 z-0">
        <HeroCarousel />
      </div>

      {/* 🔹 Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/40 to-transparent md:from-black/50 md:via-black/30 md:to-transparent" />

      {/* 🔹 Grid Overlay */}
      <div className="absolute inset-0 z-10 bg-grid-pattern opacity-5" />

      {/* 🔹 Content */}
<div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pt-16 md:pt-24">

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center w-full">
          
          <div className="max-w-2xl space-y-6 md:space-y-8 animate-fade-in">

            {/* 🔸 Badge */}
            <div className="relative z-30 inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary dark:text-primary border-2 border-primary/40 dark:border-primary/60 shadow-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 hover:border-primary/60 dark:hover:border-primary">
              <TrendingUp className="h-4 w-4" />
              Plataforma Médica Integral
            </div>

            {/* 🔸 Title */}
            <h1 className="animate-slide-up text-3xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Transforma la gestión de tu{' '}
              <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                consultorio médico
              </span>
            </h1>

            {/* 🔸 Description */}
            <p className="animate-slide-up animation-delay-100 text-base md:text-lg lg:text-xl text-white/95 drop-shadow-lg font-medium leading-relaxed">
              Optimiza tu práctica médica con una plataforma diseñada para profesionales de la salud.
              Gestiona pacientes, agenda citas y mantén expedientes clínicos organizados.
            </p>

            {/* 🔸 CTA Buttons */}
            <div className="animate-slide-up animation-delay-200 flex flex-col gap-3 sm:flex-row sm:gap-4 md:gap-6">
              <Button
                asChild
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-white dark:text-white text-sm md:text-base shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-primary hover:border-primary/80"
              >
                <Link href="/register">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base backdrop-blur-sm border-2 border-white dark:border-gray-700 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-600"
              >
                <Link href="/login">
                  Iniciar sesión
                </Link>
              </Button>
            </div>

            {/* 🔸 Social Proof */}
            <div className="animate-slide-up animation-delay-300 flex flex-wrap items-center gap-4 md:gap-8 pt-2 md:pt-4">

              <div className="flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 backdrop-blur-sm px-4 py-2 shadow-lg border border-white/20 dark:border-gray-700">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/30 border-2 border-white dark:border-gray-900" />
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/50 border-2 border-white dark:border-gray-900" />
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/70 border-2 border-white dark:border-gray-900" />
                </div>
                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-semibold text-gray-900 dark:text-white">500+</span> profesionales
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-white dark:bg-gray-900 backdrop-blur-sm px-4 py-2 shadow-lg border border-white/20 dark:border-gray-700">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="ml-2 text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
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
