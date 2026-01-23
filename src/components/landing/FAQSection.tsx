'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: '¿Necesito instalar algún software?',
    answer: 'No, MiConsultorio es 100% web. Solo necesitas un navegador e internet. Funciona en computadoras, tablets y smartphones.'
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Absolutamente. Utilizamos encriptación de nivel bancario, respaldos automáticos diarios y cumplimos con todas las normativas de protección de datos médicos.'
  },
  {
    question: '¿Puedo importar mis datos actuales?',
    answer: 'Sí, ofrecemos asistencia gratuita para migrar tus datos desde Excel, otros sistemas o archivos. Nuestro equipo te ayudará en el proceso.'
  },
  {
    question: '¿Qué pasa si tengo varios consultorios?',
    answer: 'Nuestro sistema está diseñado para multi-consultorio. Puedes gestionar múltiples ubicaciones desde una sola cuenta y cambiar entre ellas fácilmente.'
  },
  {
    question: '¿Ofrecen capacitación?',
    answer: 'Sí, incluimos capacitación inicial gratuita y tenemos una biblioteca completa de tutoriales en video. Nuestro soporte está disponible para ayudarte siempre que lo necesites.'
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer: 'Sí, no hay contratos a largo plazo. Puedes cancelar cuando quieras sin penalizaciones. Tus datos siempre estarán disponibles para exportar.'
  },
  {
    question: '¿Funciona sin internet?',
    answer: 'MiConsultorio requiere conexión a internet para funcionar. Sin embargo, los datos se sincronizan automáticamente y puedes acceder desde cualquier dispositivo.'
  },
  {
    question: '¿Cuántos usuarios puedo tener?',
    answer: 'Depende del plan. El plan Básico incluye 1 usuario, el Profesional hasta 5 usuarios, y el Empresarial usuarios ilimitados.'
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Resolvemos tus dudas más comunes
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/50 transition-all duration-300"
              >
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 animate-slide-down">
                  <p className="text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
