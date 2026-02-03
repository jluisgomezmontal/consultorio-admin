'use client';

import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);

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
          className="fixed inset-0 z-40 md:hidden bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB contenedor */}
      <div className="fixed bottom-8 left-8 z-50 md:hidden">
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
    </>
  );
}
