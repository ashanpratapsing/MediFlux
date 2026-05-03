import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Badge = ({ children, variant = 'default', className }: any) => {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      {
        'bg-[#5e6ad2]/10 text-[#5e6ad2]': variant === 'default',
        'bg-[#2fb380]/10 text-[#2fb380]': variant === 'success',
        'bg-[#e25858]/10 text-[#e25858]': variant === 'alert' || variant === 'destructive',
        'bg-yellow-500/10 text-yellow-400': variant === 'warning',
        'bg-white/5 text-[#8b8d98] border border-white/10': variant === 'outline',
      },
      className
    )}>
      {children}
    </span>
  );
};
