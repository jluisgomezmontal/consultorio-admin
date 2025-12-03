'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Consultorio } from '@/services/auth.service';

interface ConsultorioContextType {
  consultorios: Consultorio[];
  selectedConsultorio: Consultorio | null;
  setSelectedConsultorio: (consultorio: Consultorio | null) => void;
  isLoading: boolean;
}

const ConsultorioContext = createContext<ConsultorioContextType | undefined>(undefined);

export function ConsultorioProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [selectedConsultorio, setSelectedConsultorioState] = useState<Consultorio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.consultorios) {
      const userConsultorios = user.consultorios || [];
      setConsultorios(userConsultorios);

      // Try to load from localStorage
      if (typeof window !== 'undefined') {
        const savedConsultorioId = localStorage.getItem('selectedConsultorioId');
        
        if (savedConsultorioId && userConsultorios.length > 0) {
          const saved = userConsultorios.find((c) => (c.id || c._id) === savedConsultorioId);
          if (saved) {
            setSelectedConsultorioState(saved);
            setIsLoading(false);
            return;
          }
        }

        // If no saved or not found, select first consultorio by default
        if (userConsultorios.length > 0) {
          const firstConsultorio = userConsultorios[0];
          setSelectedConsultorioState(firstConsultorio);
          localStorage.setItem('selectedConsultorioId', firstConsultorio.id || firstConsultorio._id || '');
        }
      }
      
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  const setSelectedConsultorio = (consultorio: Consultorio | null) => {
    setSelectedConsultorioState(consultorio);
    if (typeof window !== 'undefined') {
      const id = consultorio?.id || consultorio?._id;
      if (id) {
        localStorage.setItem('selectedConsultorioId', id);
      }
    }
  };

  return (
    <ConsultorioContext.Provider
      value={{
        consultorios,
        selectedConsultorio,
        setSelectedConsultorio,
        isLoading,
      }}
    >
      {children}
    </ConsultorioContext.Provider>
  );
}

export const useConsultorio = () => {
  const context = useContext(ConsultorioContext);
  if (context === undefined) {
    throw new Error('useConsultorio must be used within a ConsultorioProvider');
  }
  return context;
};
