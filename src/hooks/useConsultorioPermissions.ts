import { useConsultorio } from '@/contexts/ConsultorioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { consultorioService } from '@/services/consultorio.service';

export function useConsultorioPermissions() {
  const { user } = useAuth();
  const { selectedConsultorio } = useConsultorio();
  
  const consultorioId = selectedConsultorio?.id || selectedConsultorio?._id;

  const { data: consultorioData, isLoading } = useQuery({
    queryKey: ['consultorio', consultorioId],
    queryFn: () => consultorioService.getConsultorioById(consultorioId || ''),
    enabled: !!consultorioId,
    staleTime: 5 * 60 * 1000,
  });

  const isDoctor = user?.role === 'doctor';
  const isReceptionist = user?.role === 'recepcionista';
  const isAdmin = user?.role === 'admin';

  const allowReceptionistViewClinicalSummary = 
    consultorioData?.data?.permissions?.allowReceptionistViewClinicalSummary ?? false;

  const canViewClinicalInfo = isDoctor || isAdmin || (isReceptionist && allowReceptionistViewClinicalSummary);
  
  const canEditClinicalInfo = isDoctor || isAdmin;

  return {
    isDoctor,
    isReceptionist,
    isAdmin,
    canViewClinicalInfo,
    canEditClinicalInfo,
    allowReceptionistViewClinicalSummary,
    isLoading,
  };
}
