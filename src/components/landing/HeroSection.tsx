'use client';

import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeroCarousel } from './HeroCarousel';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/80" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/20 hover:scale-105">
              <TrendingUp className="h-4 w-4" />
              Plataforma Médica Integral
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up">
              Transforma la gestión de tu{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                consultorio médico
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl animate-slide-up animation-delay-100">
              Optimiza tu práctica médica con una plataforma diseñada para profesionales de la salud. 
              Gestiona pacientes, agenda citas, controla pagos y mantén expedientes clínicos organizados en un solo lugar.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 animate-slide-up animation-delay-200">
              <Button asChild size="lg" className="group text-base transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Link href="/register">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-base transition-all duration-300 hover:scale-105 hover:shadow-md">
                <Link href="/login">
                  Iniciar sesión
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-8 pt-4 animate-slide-up animation-delay-300">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background transition-transform hover:scale-110" />
                  <div className="h-8 w-8 rounded-full bg-primary/40 border-2 border-background transition-transform hover:scale-110" />
                  <div className="h-8 w-8 rounded-full bg-primary/60 border-2 border-background transition-transform hover:scale-110" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">500+</span> profesionales confían en nosotros
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm font-semibold text-foreground">4.9/5</span>
              </div>
            </div>
          </div>
          
          <div className="relative lg:ml-auto animate-fade-in animation-delay-400">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border h-[500px] transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
              <HeroCarousel />
              
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
