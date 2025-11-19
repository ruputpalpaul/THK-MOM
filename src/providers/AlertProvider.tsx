import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '@/utils/api';
import type { AlertMatch } from '@/utils/alertRules';
import { ALERT_RULES } from '@/utils/alertRules';
import { notifyExternal } from '@/utils/alertNotifications';
import { toast } from 'sonner';

type AlertContextValue = {
  alerts: ActiveAlert[];
  loading: boolean;
  error: string | null;
  dismissAlert: (id: string) => void;
  refreshAlerts: () => Promise<void>;
};

export interface ActiveAlert extends AlertMatch {
  triggeredAt: string;
}

const AlertContext = createContext<AlertContextValue | null>(null);
const REFRESH_INTERVAL_MS = 60_000;

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alertsRef = useRef<ActiveAlert[]>([]);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const refreshTimerRef = useRef<number | null>(null);

  const evaluate = useCallback(
    async (showToast: boolean) => {
      try {
        setLoading(prev => prev && alertsRef.current.length === 0);
        setError(null);

        const [machines, workOrders, shippingOrders, ecos, events] = await Promise.all([
          api.getMachines(),
          api.getWorkOrders(),
          api.getShippingOrders(),
          api.getECOs(),
          api.getEvents(),
        ]);

        const snapshot = { machines, workOrders, shippingOrders, ecos, events };
        const evaluated = ALERT_RULES.map(rule => rule.evaluate(snapshot)).filter(
          (match): match is AlertMatch => match !== null,
        );

        const newlyTriggered: ActiveAlert[] = [];

        setAlerts(prev => {
          const prevMap = new Map(prev.map(alert => [alert.id, alert]));
          const next: ActiveAlert[] = evaluated.map(match => {
            const existing = prevMap.get(match.id);
            const triggeredAt = existing?.triggeredAt ?? new Date().toISOString();
            if (!existing) {
              newlyTriggered.push({ ...match, triggeredAt });
            }
            return {
              ...match,
              triggeredAt,
            };
          });

          alertsRef.current = next;

          const nextIds = new Set(next.map(alert => alert.id));
          for (const id of Array.from(notifiedIdsRef.current)) {
            if (!nextIds.has(id)) {
              notifiedIdsRef.current.delete(id);
            }
          }

          if (!showToast) {
            for (const alert of newlyTriggered) {
              notifiedIdsRef.current.add(alert.id);
            }
          }

          return next;
        });

        if (showToast) {
          for (const alert of newlyTriggered) {
            toast(alert.title, {
              description: alert.message,
              className:
                alert.severity === 'critical'
                  ? 'bg-destructive text-destructive-foreground'
                  : alert.severity === 'warning'
                    ? 'bg-amber-500/80 text-foreground'
                    : undefined,
            });
            notifiedIdsRef.current.add(alert.id);

            if (alert.severity === 'critical') {
              notifyExternal(alert).catch(err => {
                console.warn('External alert notification failed', err);
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to evaluate alerts', err);
        setError(err instanceof Error ? err.message : 'Failed to evaluate alerts');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refreshAlerts = useCallback(async () => {
    await evaluate(true);
  }, [evaluate]);

  useEffect(() => {
    evaluate(false);

    const handle = window.setInterval(() => {
      evaluate(true);
    }, REFRESH_INTERVAL_MS);
    refreshTimerRef.current = handle;

    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
      }
    };
  }, [evaluate]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    notifiedIdsRef.current.delete(id);
  }, []);

  const value = useMemo<AlertContextValue>(
    () => ({
      alerts,
      loading,
      error,
      dismissAlert,
      refreshAlerts,
    }),
    [alerts, loading, error, dismissAlert, refreshAlerts],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export const useAlerts = (): AlertContextValue => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return ctx;
};
