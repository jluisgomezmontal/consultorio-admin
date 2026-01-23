'use client';

export function ImageGallerySection() {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
      alt: 'Médico atendiendo paciente',
      title: 'Atención de calidad'
    },
    {
      url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2064&auto=format&fit=crop',
      alt: 'Profesional de la salud',
      title: 'Equipo profesional'
    },
    {
      url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop',
      alt: 'Tecnología médica',
      title: 'Tecnología avanzada'
    },
    {
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
      alt: 'Consultorio médico',
      title: 'Instalaciones modernas'
    },
    {
      url: 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?q=80&w=2070&auto=format&fit=crop',
      alt: 'Equipo médico colaborando',
      title: 'Colaboración efectiva'
    },
    {
      url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2031&auto=format&fit=crop',
      alt: 'Atención médica personalizada',
      title: 'Cuidado personalizado'
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Profesionales de la salud confían en nosotros
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Descubre cómo médicos de todo México están transformando la gestión de sus consultorios
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {images.map((image, index) => (
            <div 
              key={index}
              className="relative h-80 rounded-2xl overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white text-xl font-semibold mb-2">{image.title}</h3>
                <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
