'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const phoneNumber = '7444292283';
  const whatsappMessage = encodeURIComponent(
    '¡Hola! Me interesa conocer más sobre MiConsultorio para gestionar mi práctica médica. ¿Podrían brindarme más información?'
  );

  const handleCall = () => {
    window.location.href = `tel:+52${phoneNumber}`;
    setIsOpen(false);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/52${phoneNumber}?text=${whatsappMessage}`,
      '_blank'
    );
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/20 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB contenedor - Botón principal de contacto */}
      <div 
        className={`fixed bottom-8 left-8 z-50 md:hidden transition-all duration-500 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
        }`}
      >
        <div className="relative">

          {/* WhatsApp (más arriba, ligero a la derecha) */}
          <Button
            onClick={handleWhatsApp}
            size="icon"
            aria-label="WhatsApp"
            className={`absolute bottom-0 left-0 h-12 w-12 rounded-full
              bg-[#25D366] text-white shadow-lg
              transition-all duration-300
              ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            style={{
              transform: isOpen
                ? 'translate(70px, -34px)'
                : 'translate(0, 0) scale(0)',
            }}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

          {/* Llamar (diagonal, bien visible) */}
          <Button
            onClick={handleCall}
            size="icon"
            aria-label="Llamar"
            className={`absolute bottom-0 left-0 h-12 w-12 rounded-full
              bg-primary text-primary-foreground shadow-lg
              transition-all duration-300 delay-75
              ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            style={{
              transform: isOpen
                ? 'translate(10px, -84px)'
                : 'translate(0, 0) scale(0)',
            }}
          >
            <Phone className="h-5 w-5" />
          </Button>

          {/* Botón principal */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="icon"
            aria-label="Contactar"
            className={`h-12 w-12 rounded-full shadow-lg
              transition-all duration-300 hover:scale-110
              ${isOpen ? 'rotate-90 scale-110' : ''}
            `}
            
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
          {/* Botón ScrollToTop */}
          <Button
            onClick={scrollToTop}
            size="icon"
            className={`fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-500 ease-out hover:scale-110 ${
              isVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
            }`}
            aria-label="Volver arriba"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
    </>
  );
}
