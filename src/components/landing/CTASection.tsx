'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 px-8 py-16 md:px-16 md:py-24 shadow-2xl transition-all duration-700 hover:shadow-3xl hover:scale-[1.02] animate-fade-in">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl mb-6">
              Lleva tu consultorio al siguiente nivel
            </h2>
            
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Únete a cientos de médicos que ya optimizaron su práctica médica. 
              Más tiempo para tus pacientes, menos tiempo en tareas administrativas.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="group text-base bg-white hover:bg-white/90 text-primary transition-all duration-300 hover:scale-110 hover:shadow-xl"
              >
                <Link href="/register">
                  Prueba gratis por 30 días
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-xl"
              >
                <Link href="/login">
                  Iniciar sesión
                </Link>
              </Button>
            </div>
            
            <p className="mt-8 text-sm text-primary-foreground/80">
              No se requiere tarjeta de crédito • Cancela cuando quieras • Soporte en español
            </p>
          </div>
          
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
