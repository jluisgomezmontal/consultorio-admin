'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  delay?: number;
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  delay = 300,
  fullScreen = true,
  message = 'Cargando...',
  className,
}: LoadingSpinnerProps) {
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) {
    return null;
  }

  const content = (
    <div
      className={cn(
        'animate-in fade-in duration-500',
        fullScreen && 'flex min-h-screen items-center justify-center bg-background',
        className
      )}
    >
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary" />
        {message && (
          <p className="mt-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );

  return content;
}
