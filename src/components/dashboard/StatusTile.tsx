import { Card } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface StatusTileProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  subtitle?: string;
  onClick?: () => void;
}

export function StatusTile({ title, value, icon: Icon, variant = 'default', subtitle, onClick }: StatusTileProps) {
  const variantStyles = {
  default: 'border-border hover:border-gray-300 bg-gradient-to-br from-white to-gray-50',
    success: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-300',
    warning: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:border-amber-300',
    danger: 'border-rose-200 bg-gradient-to-br from-rose-50 to-white hover:border-rose-300',
  };

  const iconStyles = {
    default: 'text-slate-600',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-rose-600',
  };

  const valueStyles = {
    default: 'text-slate-900',
    success: 'text-emerald-900',
    warning: 'text-amber-900',
    danger: 'text-rose-900',
  };

  return (
    <Card 
      className={`p-6 border-2 transition-all duration-200 ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold ${valueStyles[variant]}`}>{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${variant === 'success' ? 'bg-emerald-100' : variant === 'warning' ? 'bg-amber-100' : variant === 'danger' ? 'bg-rose-100' : 'bg-slate-100'}`}>
          <Icon className={`w-6 h-6 ${iconStyles[variant]}`} />
        </div>
      </div>
    </Card>
  );
}
