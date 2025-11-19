import type { ActiveAlert } from '@/providers/AlertProvider';

type NotificationChannel = 'email' | 'sms';

interface DispatchResult {
  channel: NotificationChannel;
  endpoint: string;
  ok: boolean;
  error?: string;
}

const EMAIL_ENDPOINT = import.meta.env.VITE_ALERT_EMAIL_WEBHOOK ?? '';
const SMS_ENDPOINT = import.meta.env.VITE_ALERT_SMS_WEBHOOK ?? '';

const post = async (endpoint: string, payload: unknown): Promise<boolean> => {
  if (!endpoint) return false;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.warn('Alert notification failed', endpoint, error);
    return false;
  }
};

export async function notifyExternal(alert: ActiveAlert): Promise<DispatchResult[]> {
  const payload = {
    id: alert.id,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    triggeredAt: alert.triggeredAt,
    related: {
      machines: alert.relatedMachines ?? [],
      workOrders: alert.relatedWorkOrders ?? [],
      shippingOrders: alert.relatedShippingOrders ?? [],
      ecos: alert.relatedEcos ?? [],
    },
  };

  const results: DispatchResult[] = [];

  if (EMAIL_ENDPOINT) {
    const ok = await post(EMAIL_ENDPOINT, { channel: 'email', ...payload });
    results.push({
      channel: 'email',
      endpoint: EMAIL_ENDPOINT,
      ok,
      error: ok ? undefined : 'Failed to reach email endpoint',
    });
  }

  if (SMS_ENDPOINT) {
    const ok = await post(SMS_ENDPOINT, { channel: 'sms', ...payload });
    results.push({
      channel: 'sms',
      endpoint: SMS_ENDPOINT,
      ok,
      error: ok ? undefined : 'Failed to reach sms endpoint',
    });
  }

  return results;
}
