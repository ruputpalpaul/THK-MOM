import type {
  Machine,
  WorkOrder,
  ShippingOrder,
  ECO,
  Event,
} from '@/types/green-room';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertMatch {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  relatedMachines?: string[];
  relatedWorkOrders?: string[];
  relatedShippingOrders?: string[];
  relatedEcos?: string[];
  relatedEvents?: string[];
  meta?: Record<string, unknown>;
}

export interface AlertSnapshot {
  machines: Machine[];
  workOrders: WorkOrder[];
  shippingOrders: ShippingOrder[];
  ecos: ECO[];
  events: Event[];
}

export interface AlertRule {
  id: string;
  evaluate: (snapshot: AlertSnapshot) => AlertMatch | null;
}

const percent = (value: number, total: number) =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'machines:down',
    evaluate: ({ machines }) => {
      const down = machines.filter(m => m.status === 'down');
      const maintenance = machines.filter(m => m.status === 'maintenance');
      const count = down.length + maintenance.length;

      if (count >= 5) {
        return {
          id: 'machines:down',
          title: 'Multiple machines unavailable',
          message: `${count} machines are down or in maintenance. Prioritise triage to restore throughput.`,
          severity: 'critical',
          relatedMachines: [...down.map(m => m.id), ...maintenance.map(m => m.id)],
          meta: { down: down.map(m => m.id), maintenance: maintenance.map(m => m.id) },
        };
      }

      if (count >= 3) {
        return {
          id: 'machines:down',
          title: 'Machines require attention',
          message: `${count} machines are offline. Review maintenance queue to prevent bottlenecks.`,
          severity: 'warning',
          relatedMachines: [...down.map(m => m.id), ...maintenance.map(m => m.id)],
          meta: { down: down.map(m => m.id), maintenance: maintenance.map(m => m.id) },
        };
      }

      return null;
    },
  },
  {
    id: 'workorders:backlog',
    evaluate: ({ workOrders }) => {
      const open = workOrders.filter(
        wo => wo.status === 'open' || wo.status === 'awaiting-parts' || wo.status === 'in-progress',
      );
      if (open.length >= 12) {
        return {
          id: 'workorders:backlog',
          title: 'Maintenance backlog high',
          message: `${open.length} work orders remain unresolved. Consider rebalancing resources.`,
          severity: 'critical',
          relatedWorkOrders: open.map(wo => wo.id),
          meta: { openIds: open.map(wo => wo.id) },
        };
      }

      if (open.length >= 8) {
        return {
          id: 'workorders:backlog',
          title: 'Maintenance backlog growing',
          message: `${open.length} work orders are still open.`,
          severity: 'warning',
          relatedWorkOrders: open.map(wo => wo.id),
          meta: { openIds: open.map(wo => wo.id) },
        };
      }

      return null;
    },
  },
  {
    id: 'shipping:backlog',
    evaluate: ({ shippingOrders }) => {
      const outstanding = shippingOrders.filter(order => order.status !== 'shipped');
      if (outstanding.length >= 10) {
        return {
          id: 'shipping:backlog',
          title: 'Shipping backlog critical',
          message: `${outstanding.length} orders are waiting to ship.`,
          severity: 'critical',
          relatedShippingOrders: outstanding.map(o => o.id),
          meta: { orderIds: outstanding.map(o => o.id) },
        };
      }

      if (outstanding.length >= 6) {
        return {
          id: 'shipping:backlog',
          title: 'Shipping backlog warning',
          message: `${outstanding.length} orders remain in staging.`,
          severity: 'warning',
          relatedShippingOrders: outstanding.map(o => o.id),
          meta: { orderIds: outstanding.map(o => o.id) },
        };
      }

      return null;
    },
  },
  {
    id: 'ecos:review',
    evaluate: ({ ecos }) => {
      const inReview = ecos.filter(eco => eco.status === 'review');
      if (inReview.length >= 5) {
        return {
          id: 'ecos:review',
          title: 'ECO reviews piling up',
          message: `${inReview.length} engineering change orders are waiting for approval.`,
          severity: 'warning',
          relatedEcos: inReview.map(e => e.id),
          meta: { ecoIds: inReview.map(e => e.id) },
        };
      }

      return null;
    },
  },
  {
    id: 'machines:scrap-spike',
    evaluate: ({ machines }) => {
      const machinesWithTarget = machines.filter(m => (m.todayTarget ?? 0) > 0);
      const exceeding = machinesWithTarget
        .map(machine => {
          const target = machine.todayTarget ?? 0;
          const scrap = machine.todayScrap ?? 0;
          const ratio = percent(scrap, target);
          return { machine, ratio };
        })
        .filter(entry => entry.ratio >= 15);

      if (exceeding.length === 0) return null;

      const worst = exceeding.sort((a, b) => b.ratio - a.ratio)[0];
      const severity: AlertSeverity = worst.ratio >= 25 ? 'critical' : 'warning';

      return {
        id: 'machines:scrap-spike',
        title: 'Scrap spike detected',
        message: `${worst.machine.name} is at ${worst.ratio}% scrap against plan.`,
        severity,
        relatedMachines: [worst.machine.id],
        meta: { machineId: worst.machine.id, ratio: worst.ratio },
      };
    },
  },
];
