import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/ui/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, FileText, Clock, MapPin, Users } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Centro de Soporte</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Estamos aquí para ayudarte a sacar el máximo provecho de Mi Consultorio. 
                Encuentra respuestas rápidas o contacta a nuestro equipo de soporte.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Guía Rápida</CardTitle>
                  <CardDescription>
                    Aprende a usar las funciones principales
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full">
                    Ver Guía
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Chat en Vivo</CardTitle>
                  <CardDescription>
                    Habla con nuestro equipo de soporte
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    Iniciar Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Enviar Ticket</CardTitle>
                  <CardDescription>
                    Crea un ticket de soporte técnico
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full">
                    Crear Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Preguntas Frecuentes
                </CardTitle>
                <CardDescription>
                  Respuestas a las preguntas más comunes sobre Mi Consultorio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-foreground">¿Cómo doy de alta un nuevo paciente?</h3>
                    <p className="text-muted-foreground mt-1">
                      Ve a la sección "Pacientes" y haz clic en "Nuevo Paciente". 
                      Completa el formulario con la información básica y guarda los datos.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-foreground">¿Puedo exportar mis datos?</h3>
                    <p className="text-muted-foreground mt-1">
                      Sí, en la sección "Reportes" puedes exportar pacientes, citas y pagos 
                      en formato Excel o PDF.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-foreground">¿Cómo cambio mi contraseña?</h3>
                    <p className="text-muted-foreground mt-1">
                      Haz clic en tu perfil en la esquina superior derecha y selecciona 
                      "Configuración" → "Cambiar contraseña".
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-foreground">¿Mi información está segura?</h3>
                    <p className="text-muted-foreground mt-1">
                      Sí, utilizamos encriptación de extremo a extremo y cumplimos con 
                      las normas de protección de datos médicos.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-foreground">¿Puedo agregar múltiples consultorios?</h3>
                    <p className="text-muted-foreground mt-1">
                      Los usuarios administradores pueden gestionar múltiples consultorios 
                      desde la sección "Consultorios".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contacto Directo
                  </CardTitle>
                  <CardDescription>
                    Habla directamente con nuestro equipo de soporte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">+52 (744) 429-2283</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">soporte@consultorio.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Oficina</p>
                      <p className="text-sm text-muted-foreground">Ciudad de México, MX</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horario de Atención
                  </CardTitle>
                  <CardDescription>
                    Cuándo puedes contactarnos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Lunes - Viernes</span>
                      <span className="text-muted-foreground">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sábado</span>
                      <span className="text-muted-foreground">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Domingo</span>
                      <span className="text-muted-foreground">Cerrado</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Soporte Emergencia</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Para emergencias técnicas fuera de horario, marca nuestro número 
                      de emergencia o envía un email urgente.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recursos y Comunidad
                </CardTitle>
                <CardDescription>
                  Aprende más y conecta con otros usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium">Documentación</h4>
                    <p className="text-sm text-muted-foreground">
                      Guías detalladas y tutoriales
                    </p>
                    <Button variant="ghost" size="sm">
                      Ver Documentación
                    </Button>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium">Foro Comunitario</h4>
                    <p className="text-sm text-muted-foreground">
                      Comparte experiencias y consejos
                    </p>
                    <Button variant="ghost" size="sm">
                      Unirse al Foro
                    </Button>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium">Webinars</h4>
                    <p className="text-sm text-muted-foreground">
                      Sesiones de capacitación en vivo
                    </p>
                    <Button variant="ghost" size="sm">
                      Próximos Webinars
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
