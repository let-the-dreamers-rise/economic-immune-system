/**
 * Card - Premium dark theme card component
 * Base container for dashboard panels with consistent styling
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: 'none' | 'emerald' | 'amber' | 'rose';
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const glowStyles = {
  none: '',
  emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
  amber: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
  rose: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
};

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glow = 'none',
  onClick,
}: CardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        bg-dashboard-card rounded-xl border border-dashboard-border
        ${paddingStyles[padding]}
        ${glowStyles[glow]}
        ${hover ? 'hover:border-slate-500 hover:bg-slate-800/50 transition-all duration-200' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Card Header component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Card Content component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

// Card Footer component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-dashboard-border ${className}`}>
      {children}
    </div>
  );
}

// Stat Card - specialized card for displaying metrics
interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantTextColors = {
  default: 'text-white',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-rose-400',
};

export function StatCard({
  label,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className={`text-2xl font-semibold font-mono ${variantTextColors[variant]}`}>
            {value}
          </p>
          {subValue && (
            <p className="text-sm text-slate-500 mt-1">{subValue}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm ${
                  trend === 'up' ? 'text-emerald-400' :
                  trend === 'down' ? 'text-rose-400' :
                  'text-slate-400'
                }`}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-slate-500">{icon}</div>
        )}
      </div>
    </Card>
  );
}

export default Card;
