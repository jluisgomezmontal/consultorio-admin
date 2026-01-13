'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PhoneDisplayProps {
  phone: string;
  className?: string;
}

export const PhoneDisplay = ({ phone, className = '' }: PhoneDisplayProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phoneNumber;
  };

  const handleCall = () => {
    const cleaned = phone.replace(/\D/g, '');
    window.location.href = `tel:${cleaned}`;
    setIsDialogOpen(false);
  };

  const handleWhatsApp = () => {
    const cleaned = phone.replace(/\D/g, '');
    const whatsappNumber = cleaned.startsWith('52') ? cleaned : `52${cleaned}`;
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className={`text-base font-medium text-primary hover:text-primary/80 transition-all cursor-pointer text-left underline decoration-2 underline-offset-2 hover:underline-offset-4 flex items-center gap-1.5 group ${className}`}
      >
        <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
        {formatPhoneNumber(phone)}
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar</DialogTitle>
            <DialogDescription>
              ¿Cómo deseas contactar a este número?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleCall}
              className="w-full h-auto py-4 flex items-center justify-start gap-3"
              variant="outline"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">Llamar</p>
                <p className="text-sm text-muted-foreground">{formatPhoneNumber(phone)}</p>
              </div>
            </Button>

            <Button
              onClick={handleWhatsApp}
              className="w-full h-auto py-4 flex items-center justify-start gap-3"
              variant="outline"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Enviar mensaje</p>
              </div>
            </Button>

            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="ghost"
              className="mt-2"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
