'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Dr. Carlos Méndez',
    role: 'Médico General',
    location: 'Ciudad de México',
    content: 'Este sistema transformó completamente la forma en que administro mi consultorio. Ahora puedo dedicar más tiempo a mis pacientes y menos a la burocracia.',
    rating: 5,
    avatar: 'CM'
  },
  {
    name: 'Dra. Ana Rodríguez',
    role: 'Pediatra',
    location: 'Guadalajara',
    content: 'La gestión de expedientes clínicos es excepcional. Puedo acceder al historial completo de mis pacientes en segundos. Muy recomendado.',
    rating: 5,
    avatar: 'AR'
  },
  {
    name: 'Dr. Miguel Torres',
    role: 'Cardiólogo',
    location: 'Monterrey',
    content: 'Manejo tres consultorios y este sistema me permite tener todo centralizado. Los reportes financieros son muy útiles para mi contabilidad.',
    rating: 5,
    avatar: 'MT'
  },
  {
    name: 'Dra. Laura Sánchez',
    role: 'Dermatóloga',
    location: 'Puebla',
    content: 'La interfaz es muy intuitiva. Mi recepcionista aprendió a usarlo en un día. El soporte técnico es excelente y siempre están disponibles.',
    rating: 5,
    avatar: 'LS'
  },
  {
    name: 'Dr. Roberto Gómez',
    role: 'Traumatólogo',
    location: 'Querétaro',
    content: 'Los recordatorios automáticos de citas redujeron significativamente las ausencias. Mis pacientes aprecian la profesionalidad del sistema.',
    rating: 5,
    avatar: 'RG'
  },
  {
    name: 'Dra. Patricia Morales',
    role: 'Ginecóloga',
    location: 'Tijuana',
    content: 'Poder generar recetas y comprobantes desde el sistema me ahorra mucho tiempo. La seguridad de los datos de mis pacientes es impecable.',
    rating: 5,
    avatar: 'PM'
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 leading-tight">
            Profesionales que confían en nosotros
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Únete a cientos de médicos que ya optimizaron la gestión de sus consultorios
          </p>
        </div>
        
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-500 md:hover:-translate-y-2 hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-5 md:pt-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm md:text-base font-semibold shadow-md transition-transform duration-300 md:hover:scale-110">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                  "{testimonial.content}"
                </p>
                
                <p className="text-sm text-muted-foreground">
                  {testimonial.location}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
