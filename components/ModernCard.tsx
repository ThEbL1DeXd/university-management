import { ReactNode } from 'react';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glassmorphism?: boolean;
}

export default function ModernCard({ 
  children, 
  className = '', 
  hover = true,
  gradient = false,
  glassmorphism = true
}: ModernCardProps) {
  const baseClasses = `
    rounded-2xl shadow-lg transition-all duration-300
    ${glassmorphism ? 'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80' : 'bg-white dark:bg-gray-800'}
    ${glassmorphism ? 'border border-gray-200/50 dark:border-gray-700/50' : 'border border-gray-200 dark:border-gray-700'}
    ${hover ? 'hover:shadow-2xl hover:scale-[1.02]' : ''}
    ${gradient ? 'relative overflow-hidden' : ''}
  `;

  return (
    <div className={`${baseClasses} ${className}`}>
      {gradient && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Pre-configured card variants
export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient = 'blue',
  trend
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon?: ReactNode;
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
  trend?: { value: number; label: string };
}) {
  const gradientClasses = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    pink: 'from-pink-500 to-rose-600',
  };

  return (
    <div className={`group relative bg-gradient-to-br ${gradientClasses[gradient]} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
      {/* Hover effect */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          {icon && (
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
          <div className="text-right">
            <div className="text-4xl font-bold">{value}</div>
            {trend && (
              <div className={`text-sm font-medium flex items-center justify-end gap-1 mt-1 ${
                trend.value >= 0 ? 'text-green-200' : 'text-red-200'
              }`}>
                <span>{trend.value >= 0 ? '↗' : '↘'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

export function ActionCard({
  title,
  description,
  icon,
  href,
  gradient = 'blue',
  onClick
}: {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}) {
  const gradientClasses = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-amber-600',
  };

  const Component = href ? 'a' : 'button';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={`group relative overflow-hidden bg-gradient-to-br ${gradientClasses[gradient]} rounded-xl p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl block`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-white/80 text-sm mb-4">{description}</p>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>Voir plus</span>
          <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Component>
  );
}
