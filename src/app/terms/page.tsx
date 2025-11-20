import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/ui/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Términos y Condiciones</h1>
              <p className="mt-2 text-muted-foreground">
                Última actualización: {new Date().toLocaleDateString('es-MX', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="prose prose-gray max-w-none dark:prose-invert">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">1. Aceptación de los Términos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Al acceder y utilizar Mi Consultorio, aceptas estos términos y condiciones. 
                    Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
                  </p>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">2. Descripción del Servicio</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Mi Consultorio es un sistema de gestión diseñado para consultorios médicos que incluye:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Gestión de pacientes y expedientes médicos</li>
                    <li>Programación y administración de citas</li>
                    <li>Control de pagos y facturación</li>
                    <li>Generación de reportes y estadísticas</li>
                    <li>Administración de usuarios y consultorios</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">3. Responsabilidades del Usuario</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Como usuario de Mi Consultorio, te comprometes a:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Proporcionar información veraz y actualizada</li>
                    <li>Mantener la confidencialidad de tus credenciales de acceso</li>
                    <li>Utilizar el servicio conforme a las leyes aplicables</li>
                    <li>No compartir datos de pacientes sin autorización</li>
                    <li>Reportar cualquier uso no autorizado de tu cuenta</li>
                    <li>Respetar la privacidad y confidencialidad médica</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">4. Propiedad Intelectual</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Todo el contenido de Mi Consultorio, incluyendo但不限于:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Diseño de la interfaz y experiencia de usuario</li>
                    <li>Código fuente y tecnología subyacente</li>
                    <li>Documentación y materiales de ayuda</li>
                    <li>Logotipos, marcas y elementos de branding</li>
                  </ul>
                  <p>
                    Es propiedad de Mi Consultorio y está protegido por las leyes de propiedad intelectual.
                  </p>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">5. Privacidad y Datos Médicos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Nos comprometemos a proteger la confidencialidad de la información médica:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Cumplimos con las leyes de protección de datos médicos</li>
                    <li>Implementamos medidas de seguridad robustas</li>
                    <li>Limitamos el acceso a información sensible</li>
                    <li>No compartimos datos sin consentimiento explícito</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">6. Disponibilidad del Servicio</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Nos esforzamos por mantener el servicio disponible, pero:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>No garantizamos disponibilidad del 100%</li>
                    <li>Podemos realizar mantenimiento programado</li>
                    <li>Reservamos el derecho a suspender el servicio por razones técnicas</li>
                    <li>No somos responsables por pérdidas derivadas de interrupciones</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">7. Pagos y Suscripciones</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Para los servicios de pago:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Los precios están sujetos a cambio sin previo aviso</li>
                    <li>Los pagos se procesan a través de plataformas seguras</li>
                    <li>Las suscripciones se renuevan automáticamente</li>
                    <li>Ofrecemos reembolsos según nuestra política de cancelación</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">8. Limitación de Responsabilidad</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Mi Consultorio no es responsable por:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Decisiones médicas tomadas basadas en el sistema</li>
                    <li>Pérdidas indirectas o consecuentes</li>
                    <li>Errores humanos en la entrada de datos</li>
                    <li>Problemas técnicos fuera de nuestro control</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">9. Terminación del Servicio</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Podemos terminar o suspender tu acceso si:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Violas estos términos y condiciones</li>
                    <li>Utilizas el servicio para fines ilegales</li>
                    <li>Comprometes la seguridad del sistema</li>
                    <li>No pagas los servicios contratados</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">10. Contacto</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Para preguntas sobre estos términos y condiciones:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email: legal@consultorio.com</li>
                    <li>Teléfono: +52 (555) 123-4567</li>
                    <li>Dirección: Ciudad de México, MX</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
