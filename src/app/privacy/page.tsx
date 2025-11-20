import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/ui/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Política de Privacidad</h1>
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
                <h2 className="text-2xl font-semibold text-foreground">1. Información que Recopilamos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    En Mi Consultorio, nos comprometemos a proteger la privacidad de nuestros usuarios. 
                    Recopilamos información necesaria para proporcionar nuestros servicios de gestión de consultorios médicos.
                  </p>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4">Información Personal:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Nombre y datos de contacto</li>
                    <li>Información de autenticación (email, contraseña)</li>
                    <li>Rol y permisos en el sistema</li>
                    <li>Consultorios asociados</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4">Información de Pacientes:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Datos demográficos</li>
                    <li>Historial médico</li>
                    <li>Información de contacto</li>
                    <li>Registro de citas y tratamientos</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4">Información del Sistema:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Registros de actividad</li>
                    <li>Datos de uso del sistema</li>
                    <li>Información técnica y de diagnóstico</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">2. Uso de la Información</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Utilizamos la información recopilada para:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Proporcionar y mantener nuestros servicios</li>
                    <li>Gestionar citas y registros médicos</li>
                    <li>Mejorar la experiencia del usuario</li>
                    <li>Enviar notificaciones importantes</li>
                    <li>Garantizar la seguridad del sistema</li>
                    <li>Cumplir con obligaciones legales</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">3. Protección de Datos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Implementamos medidas de seguridad robustas para proteger la información:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Encriptación de datos en tránsito y en reposo</li>
                    <li>Control de acceso basado en roles</li>
                    <li>Auditoría regular de seguridad</li>
                    <li>Cumplimiento con normas de protección de datos médicos</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">4. Derechos del Usuario</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Como usuario, tienes derecho a:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Acceder a tu información personal</li>
                    <li>Corregir datos inexactos</li>
                    <li>Solicitar eliminación de información</li>
                    <li>Exportar tus datos</li>
                    <li>Revocar consentimientos</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-semibold text-foreground">5. Contacto</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Para preguntas sobre esta política de privacidad o para ejercer tus derechos, 
                    contacta con nosotros:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email: privacy@consultorio.com</li>
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
