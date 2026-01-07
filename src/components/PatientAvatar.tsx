'use client';

import { User } from 'lucide-react';
import Image from 'next/image';

interface PatientAvatarProps {
  photoUrl?: string;
  fullName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const iconSizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function PatientAvatar({ 
  photoUrl, 
  fullName, 
  size = 'md',
  className = '' 
}: PatientAvatarProps) {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];

  if (photoUrl) {
    return (
      <div className={`relative ${sizeClass} rounded-full overflow-hidden border-2 border-gray-200 ${className}`}>
        <Image
          src={photoUrl}
          alt={`Foto de ${fullName}`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-gray-200 ${className}`}>
      <User className={`${iconSize} text-gray-500`} />
    </div>
  );
}
