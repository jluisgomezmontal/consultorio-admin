import { Consultorio } from '@/services/user.service';

interface ClinicsDisplayProps {
  consultorios: Consultorio[];
}

export function ClinicsDisplay({ consultorios }: ClinicsDisplayProps) {
  if (!consultorios || consultorios.length === 0) {
    return <span className="text-muted-foreground text-sm">Sin consultorio</span>;
  }

  if (consultorios.length === 1) {
    return <span className="text-sm">{consultorios[0].name}</span>;
  }

  return (
    <span className="text-sm">
      {consultorios.map(c => c.name).join(', ')}
    </span>
  );
}
