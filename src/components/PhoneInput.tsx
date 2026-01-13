'use client';

import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, ...props }, ref) => {
    const formatPhoneNumber = (input: string): string => {
      const cleaned = input.replace(/\D/g, '');
      
      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else if (cleaned.length <= 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const cleaned = input.replace(/\D/g, '');
      
      if (cleaned.length <= 10) {
        const formatted = formatPhoneNumber(input);
        onChange?.(cleaned);
        e.target.value = formatted;
      }
    };

    const displayValue = formatPhoneNumber(value);

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="555-123-4567"
        maxLength={12}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
