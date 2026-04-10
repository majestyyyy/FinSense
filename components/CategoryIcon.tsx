'use client';

interface CategoryIconProps {
  icon?: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryIcon({ icon, color, size = 'md', className = '' }: CategoryIconProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-11 h-11 text-lg',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-110 ${sizeClasses[size]} ${className}`}
      style={{
        background: icon
          ? `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`
          : `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        boxShadow: icon
          ? `inset 0 1px 2px ${color}20`
          : `0 2px 8px ${color}40`,
      }}
    >
      {icon && <span style={{ opacity: 0.85 }}>{icon}</span>}
    </div>
  );
}
