import type { ActiveAlert } from '@/providers/AlertProvider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const severityStyles: Record<string, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  warning: 'bg-amber-500/80 text-foreground',
  info: 'bg-accent text-accent-foreground',
};

export function AlertCard({ alert }: { alert: ActiveAlert }) {
  return (
    <div className="rounded-md border border-border bg-background/80 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Badge className={cn('capitalize', severityStyles[alert.severity] ?? '')}>
          {alert.severity}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(alert.triggeredAt).toLocaleString()}
        </span>
      </div>
      <h4 className="mt-2 text-sm font-semibold text-foreground">{alert.title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
    </div>
  );
}
