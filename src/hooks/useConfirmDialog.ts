'use client';

import Swal from 'sweetalert2';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ConfirmDialogOptions {
  title?: string;
  text?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export function useConfirmDialog() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeColors = () => {
    if (!mounted || typeof window === 'undefined') {
      return { isDark: false, background: '#ffffff', foreground: '#111827', border: '#e5e7eb' };
    }
    
    const isDark = (resolvedTheme || theme) === 'dark';
    
    // Obtener los valores computados del DOM
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Obtener los valores de las variables CSS
    const getColor = (varName: string, fallback: string) => {
      const value = computedStyle.getPropertyValue(varName).trim();
      return value || fallback;
    };
    
    return {
      isDark,
      background: isDark ? '#1f2937' : '#ffffff',
      foreground: isDark ? '#f9fafb' : '#111827',
      border: isDark ? '#374151' : '#e5e7eb',
    };
  };

  const confirm = async (options: ConfirmDialogOptions = {}): Promise<boolean> => {
    const {
      title = '¿Estás seguro?',
      text = 'Esta acción no se puede deshacer',
      icon = 'warning',
      confirmButtonText = 'Sí, eliminar',
      cancelButtonText = 'Cancelar',
      confirmButtonColor = '#ef4444',
      cancelButtonColor = '#6b7280',
    } = options;

    const { background, border } = getThemeColors();

    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      background,
      customClass: {
        popup: 'swal2-custom-popup',
        confirmButton: 'swal2-custom-confirm',
        cancelButton: 'swal2-custom-cancel',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-custom-text',
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.borderRadius = '0.5rem';
          popup.style.border = `1px solid ${border}`;
          popup.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
        }
      },
    });

    return result.isConfirmed;
  };

  const success = async (title: string, text?: string) => {
    const { background, border } = getThemeColors();

    await Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#10b981',
      background,
      customClass: {
        popup: 'swal2-custom-popup',
        confirmButton: 'swal2-custom-confirm',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-custom-text',
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.borderRadius = '0.5rem';
          popup.style.border = `1px solid ${border}`;
          popup.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
        }
      },
    });
  };

  const error = async (title: string, text?: string) => {
    const { background, border } = getThemeColors();

    await Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#ef4444',
      background,
      customClass: {
        popup: 'swal2-custom-popup',
        confirmButton: 'swal2-custom-confirm',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-custom-text',
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.borderRadius = '0.5rem';
          popup.style.border = `1px solid ${border}`;
          popup.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
        }
      },
    });
  };

  return { confirm, success, error };
}
