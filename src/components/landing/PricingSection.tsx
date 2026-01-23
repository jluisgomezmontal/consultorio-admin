'use client';

import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const plans = [
  {
    name: 'Gratis',
    description: 'Perfecto para comenzar',
    price: '$0',
    period: 'por 30 días',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '1 doctor',
      '1 recepcionista',
      'Pacientes ilimitados',
      'Gestión de citas básica',
      'Expedientes básicos',
      'Control de pagos'
    ],
    cta: 'Comenzar gratis',
    popular: false,
    badge: null
  },
  {
    name: 'Básico',
    description: 'Para consultorios pequeños',
    price: '$499',
    period: 'al mes',
    priceMonthly: 499,
    priceYearly: 4990,
    features: [
      '2 doctores',
      '2 recepcionistas',
      'Pacientes ilimitados',
      'Agenda avanzada',
      'Expedientes clínicos',
      'Reportes básicos',
      'Subida de documentos',
      'Soporte por email'
    ],
    cta: 'Comenzar ahora',
    popular: false,
    badge: null
  },
  {
    name: 'Profesional',
    description: 'Para consultorios en crecimiento',
    price: '$999',
    period: 'al mes',
    priceMonthly: 999,
    priceYearly: 9990,
    features: [
      '5 doctores',
      '5 recepcionistas',
      'Pacientes ilimitados',
      'Agenda inteligente',
      'Expedientes completos',
      'Reportes avanzados',
      'Subida de documentos e imágenes',
      'Multi-consultorio',
      'Soporte prioritario'
    ],
    cta: 'Iniciar prueba',
    popular: true,
    badge: 'Más popular'
  },
  {
    name: 'Licencia',
    description: 'Pago único con mantenimiento anual',
    price: '$15,000',
    period: 'pago único',
    priceMonthly: null,
    priceYearly: 2000,
    features: [
      'Usuarios ilimitados',
      'Consultorios ilimitados',
      'Todas las funcionalidades',
      'Instalación personalizada',
      'Capacitación incluida',
      'Soporte técnico dedicado',
      'Actualizaciones incluidas',
      'Mantenimiento: $2,000/año'
    ],
    cta: 'Contactar ventas',
    popular: false,
    badge: 'Mejor valor'
  }
];

export function PricingSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Planes diseñados para ti
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu consultorio. 
            Todos incluyen prueba gratuita sin necesidad de tarjeta de crédito.
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-4 lg:gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative flex flex-col transition-all duration-500 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-primary shadow-xl scale-105 lg:scale-110 animate-pulse-subtle' 
                  : 'border-border hover:border-primary/50 hover:scale-105'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <div className={`flex items-center gap-1 rounded-full px-4 py-1 text-sm font-medium shadow-lg transition-all duration-300 hover:scale-110 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  }`}>
                    <Sparkles className="h-4 w-4" />
                    {plan.badge}
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-8 pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="text-lg text-muted-foreground">
                        {plan.period.includes('mes') ? '/mes' : plan.period.includes('único') ? '' : `/${plan.period.split(' ')[1]}`}
                      </span>
                    )}
                  </div>
                  {plan.priceMonthly && plan.priceMonthly > 0 && plan.priceYearly && plan.priceYearly > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 transition-all duration-300 hover:scale-110">
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
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                <Button 
                  asChild 
                  className={`w-full transition-all duration-300 hover:scale-105 ${
                    plan.popular ? 'shadow-lg hover:shadow-xl' : ''
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
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
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
