'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-7 w-28',
  md: 'h-9 w-36',
  lg: 'h-9 w-36',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = (resolvedTheme || theme) === 'dark' 
    ? '/miconsultoriodark.png' 
    : '/miconsultoriowhite.png';

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {mounted ? (
        <Image
          src={logoSrc}
          alt="Mi Consultorio"
          fill
          className="object-contain"
          priority
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-muted animate-pulse rounded`} />
      )}
    </div>
  );
}
