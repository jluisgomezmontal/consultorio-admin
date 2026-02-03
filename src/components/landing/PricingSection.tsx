'use client';

import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const plans = [
  {
    name: 'Básico',
    description: 'Perfecto para comenzar',
    price: '$349',
    period: 'al mes',
    priceMonthly: 349,
    priceYearly: 3490,
    features: [
      '1 doctor',
      '1 recepcionista',
      'Pacientes ilimitados',
      'Agenda avanzada',
      'Expedientes completos',
      'Reportes básicos',
    ],
    cta: 'Probar 30 días gratis',
    popular: false,
    badge: null
  },
  {
    name: 'Profesional',
    description: 'Para consultorios pequeños',
    price: '$599',
    period: 'al mes',
    priceMonthly: 599,
    priceYearly: 5990,
    features: [
      '1 doctor',
      '1 recepcionista',
      'Pacientes ilimitados',
      'Agenda avanzada',
      'Expedientes completos',
      'Reportes básicos',
      'Subida de documentos e imágenes',
      'Inteligencia artificial'
    ],
    cta: 'Probar 30 días gratis',
    popular: true,
    badge: 'Recomendado'
  },
  {
    name: 'Clínica',
    description: 'Para consultorios en crecimiento',
    price: '$999',
    period: 'al mes',
    priceMonthly: 999,
    priceYearly: 9990,
    features: [
      '2 doctores',
      '3 recepcionistas',
      'Pacientes ilimitados',
      'Agenda avanzada',
      'Expedientes completos',
      'Reportes avanzados',
      'Subida de documentos e imágenes',
      'Inteligencia artificial'
    ],
    cta: 'Probar 30 días gratis',
    popular: false,
    badge: null
  },
  {
    name: 'Licencia',
    description: 'Pago único con mantenimiento anual de $799',
    price: '$24,999',
    period: 'pago único',
    priceMonthly: null,
    priceYearly: 2000,
    features: [
      '1 doctor',
      '1 recepcionista',
      'Pacientes ilimitados',
      'Agenda avanzada',
      'Expedientes completos',
      'Reportes básicos',
      'Subida de documentos e imágenes',
      'Inteligencia artificial'
    ],
    cta: 'Contactar ventas',
    popular: false,
    badge: 'Mejor valor'
  }
];

export function PricingSection() {
  return (
    <section className="py-12 md:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 leading-tight">
            Planes diseñados para ti
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu consultorio.
          </p>
          <div className="mt-3 md:mt-4 inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-green-700 dark:text-green-300">
            <Check className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">30 días de prueba gratis • Sin tarjeta de crédito • Sin compromiso</span>
            <span className="sm:hidden">Prueba gratis 30 días</span>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col transition-all duration-500 hover:shadow-2xl ${plan.popular
                  ? 'border-primary shadow-xl md:scale-105 lg:scale-110 animate-pulse-subtle'
                  : 'border-border hover:border-primary/50 md:hover:scale-105'
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 md:-top-4 left-0 right-0 mx-auto w-fit">
                  <div className={`flex items-center gap-1 rounded-full px-3 md:px-4 py-1 text-xs md:text-sm font-medium shadow-lg transition-all duration-300 md:hover:scale-110 ${plan.popular
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    }`}>
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <CardHeader className="pb-6 md:pb-8 pt-6 md:pt-8">
                <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-4 md:mt-6">
                  <div className="flex items-baseline gap-1.5 md:gap-2">
                    <span className="text-3xl md:text-4xl font-bold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="text-base md:text-lg text-muted-foreground">
                        {plan.period.includes('mes') ? '/mes' : plan.period.includes('único') ? '' : `/${plan.period.split(' ')[1]}`}
                      </span>
                    )}
                  </div>
                  {plan.priceMonthly && plan.priceMonthly > 0 && plan.priceYearly && plan.priceYearly > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 transition-all duration-300 md:hover:scale-110 text-xs">
                        Ahorra {Math.round(((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100)}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ${plan.priceYearly.toLocaleString()}/año
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2 md:space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 md:gap-3">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4 md:pt-6">
                <Button
                  asChild
                  className={`w-full transition-all duration-300 md:hover:scale-105 text-sm md:text-base ${plan.popular ? 'shadow-lg hover:shadow-xl' : ''
                    }`}
                  size="lg"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link href="/register">
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <p className="text-sm md:text-base text-muted-foreground">
            ¿Necesitas ayuda para elegir? {' '}
            <Link href="/support" className="text-primary hover:underline font-medium">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
