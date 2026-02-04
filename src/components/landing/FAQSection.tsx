'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: '¿Cómo funciona el asistente con Inteligencia Artificial?',
    answer: 'Nuestro asistente de IA es como tener un colega experto disponible 24/7. Pregunta en lenguaje natural sobre tratamientos, alergias o medicamentos y recibe sugerencias inteligentes basadas en el historial del paciente. Por ejemplo: "¿Qué antibiótico puedo recetar a este paciente?" y la IA analiza sus alergias y medicamentos actuales para darte opciones seguras.'
  },
  {
    question: '¿Puedo probar el sistema sin compromiso?',
    answer: 'Sí, totalmente gratis. Comienza tu prueba de 30 días sin necesidad de tarjeta de crédito. Explora todas las funcionalidades, sube tus pacientes, agenda citas y prueba el asistente de IA. Si no te convence, simplemente no continúas. Sin cargos ocultos, sin compromisos.'
  },
  {
    question: '¿Cuántos documentos e imágenes puedo subir?',
    answer: 'Ilimitados. Sí, leíste bien: sin límites. Sube todos los estudios de laboratorio, radiografías, recetas, consentimientos informados y documentos que necesites. No importa si son 10 o 10,000 archivos. Tu información médica completa, siempre disponible.'
  },
  {
    question: '¿Funciona en mi celular y tablet?',
    answer: 'Perfectamente. MiConsultorio se adapta automáticamente a cualquier dispositivo: computadora de escritorio, laptop, tablet o smartphone. Trabaja desde tu consultorio, desde casa o mientras estás de guardia. La misma experiencia fluida en todos tus dispositivos, sin instalar nada.'
  },
  {
    question: '¿Cumple con las normas oficiales mexicanas?',
    answer: 'Absolutamente. Cumplimos con la NOM-004-SSA3-2012 para expedientes clínicos electrónicos. Esto significa que tus registros tienen validez legal, están protegidos con encriptación de nivel bancario y cumplen con todos los requisitos de la Secretaría de Salud. Tu tranquilidad profesional garantizada.'
  },
  {
    question: '¿Qué pasa con mis datos si cancelo?',
    answer: 'Son tuyos, siempre. Puedes exportar toda tu información en cualquier momento: pacientes, citas, expedientes, documentos, todo. No hay penalizaciones ni retención de datos. Cancela cuando quieras y llévate tu información completa. Así de simple.'
  },
  {
    question: '¿Necesito instalar algo o contratar soporte técnico?',
    answer: 'Nada. Cero instalaciones, cero configuraciones complicadas. Solo abre tu navegador favorito y comienza a trabajar. Funciona en Chrome, Safari, Firefox, Edge... el que prefieras. Y el soporte técnico está incluido sin costo adicional. Siempre hay alguien listo para ayudarte.'
  },
  {
    question: '¿Puedo migrar mis pacientes desde Excel u otro sistema?',
    answer: 'Sí, y te ayudamos gratis. Nuestro equipo te asiste en la migración de tus datos desde Excel, Word, otros sistemas médicos o incluso archivos físicos. No pierdes nada, todo se transfiere de forma segura. Empiezas con tu base de pacientes completa desde el día uno.'
  },
  {
    question: '¿Cómo me ayuda la IA con las alergias de mis pacientes?',
    answer: 'La IA vigila constantemente. Cuando intentas recetar un medicamento, el sistema analiza automáticamente el perfil del paciente y te alerta si hay riesgo de alergia o interacción con sus medicamentos actuales. Es como tener un farmacólogo revisando cada receta antes de que la firmes. Más seguridad, menos riesgos.'
  },
  {
    question: '¿Puedo gestionar varios consultorios?',
    answer: 'Claro que sí. Si tienes consultorios en diferentes ubicaciones o especialidades, puedes gestionarlos todos desde una sola cuenta. Cambia entre ellos con un clic y mantén todo organizado. Ideal para médicos con múltiples prácticas o grupos médicos.'
  },
  {
    question: '¿Qué tan rápido puedo empezar a usar el sistema?',
    answer: 'En menos de 5 minutos estás listo. Crea tu cuenta, configura tu consultorio, agrega tu primer paciente y agenda tu primera cita. Así de rápido. No hay curvas de aprendizaje complicadas ni manuales de 100 páginas. Todo es intuitivo y fácil de usar desde el primer momento.'
  },
  {
    question: '¿Puedo personalizar un paquete a la medida para las necesidades de mi clínica?',
    answer: '¡Por supuesto! Entendemos que cada clínica es un mundo y tiene requerimientos únicos. Más que venderte un software, queremos ser tus aliados. Solo tienes que contarnos tus necesidades específicas con uno de nuestros asesores y, juntos, armaremos un paquete a la medida.'
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            ¿Aún tienes dudas?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Aquí están las respuestas que nuestros médicos preguntan más. Si no encuentras lo que buscas, 
            <span className="text-primary font-semibold"> contáctanos y te respondemos al instante</span>.
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
