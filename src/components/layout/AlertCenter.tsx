import { useState } from 'react';
import { Bell, X, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlerts } from '@/providers/AlertProvider';
import { cn } from '@/lib/utils';

const severityStyles: Record<string, string> = {
  critical: 'bg-destructive/90 text-destructive-foreground',
  warning: 'bg-amber-500/80 text-foreground',
  info: 'bg-accent text-accent-foreground',
};

export function AlertCenter() {
  const [open, setOpen] = useState(false);
  const { alerts, loading, error, dismissAlert, refreshAlerts } = useAlerts();
  const count = alerts.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>
      <SheetContent side="right" className="w-96 px-0">
        <SheetHeader className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Plant Alerts</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Automated checks refresh every minute. Review and dismiss resolved items.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={loading}
                onClick={refreshAlerts}
                aria-label="Refresh alerts"
              >
                <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="h-full px-6">
          <div className="space-y-3 pb-6">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Failed to refresh alerts. Try again shortly.
              </div>
            )}
            {loading && alerts.length === 0 && (
              <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Scanning plant metrics…
              </div>
            )}
            {alerts.length === 0 && !loading && !error && (
              <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                No active alerts. All systems are operating within configured thresholds.
              </div>
            )}
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="rounded-md border border-border bg-background/80 p-4 shadow-sm"
              >
                <div className="flex items-start">
                  <Badge className={cn('capitalize', severityStyles[alert.severity] ?? '')}>
                    {alert.severity}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6"
                    onClick={() => dismissAlert(alert.id)}
                    aria-label="Dismiss alert"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{alert.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Triggered {new Date(alert.triggeredAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
