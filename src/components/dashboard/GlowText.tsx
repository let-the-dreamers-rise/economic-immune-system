/**
 * GlowText - Premium text component with subtle glow effects
 * Used for important financial numbers like balance and warnings
 */

import React from 'react';

interface GlowTextProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  mono?: boolean;
  animate?: boolean;
}

const variantStyles = {
  emerald: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]',
  amber: 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]',
  rose: 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]',
  white: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]',
};

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl font-semibold',
};

export function GlowText({
  children,
  variant = 'emerald',
  size = 'md',
  className = '',
  mono = false,
  animate = false,
}: GlowTextProps) {
  return (
    <span
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${mono ? 'font-mono tracking-tight' : ''}
        ${animate ? 'animate-pulse-glow' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default GlowText;
