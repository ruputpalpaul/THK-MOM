import { useEffect, useMemo, useState } from 'react';
import { Machine, ShippingOrder, WorkOrder } from '@/types/green-room';
import * as api from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Factory, Warehouse, Package, ArrowRightCircle, Activity, Wrench } from 'lucide-react';
import { FABRICATION_CATEGORIES } from './FabricationDashboard';

type ProductionArea = 'fabrication' | 'green-room' | 'shipping';

interface AreaSummary {
  title: string;
  description: string;
  icon: React.ReactNode;
  machines: Machine[];
  activeCount: number;
  downCount: number;
  additionalStat: string;
  highlight: string;
}

interface Props {
  onSelectArea?: (area: ProductionArea) => void;
}

const areaOrdering: ProductionArea[] = ['fabrication', 'green-room', 'shipping'];

export function ProductionOverviewDashboard({ onSelectArea }: Props) {
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [shippingOrders, setShippingOrders] = useState<ShippingOrder[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [machineList, woList, shipList] = await Promise.all([
          api.getMachines(),
          api.getWorkOrders(),
          api.getShippingOrders(),
        ]);
        if (cancelled) return;
        setMachines(machineList);
        setWorkOrders(woList);
        setShippingOrders(shipList);
      } catch (error) {
        console.error('Failed to load production overview data', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const areaSummaries = useMemo<Record<ProductionArea, AreaSummary>>(() => {
    const buckets: Record<ProductionArea, Machine[]> = {
      fabrication: [],
      'green-room': [],
      shipping: [],
    };

    for (const machine of machines) {
      if (FABRICATION_CATEGORIES.has(machine.category)) {
        buckets.fabrication.push(machine);
        continue;
      }

      const category = machine.category.toLowerCase();
      if (category.includes('shipping') || category.includes('wrap') || category.includes('pack')) {
        buckets.shipping.push(machine);
      } else {
        buckets['green-room'].push(machine);
      }
    }

    const makeSummary = (area: ProductionArea): AreaSummary => {
      const areaMachines = buckets[area];
      const activeCount = areaMachines.filter(m => m.status === 'active').length;
      const downCount = areaMachines.filter(m => m.status === 'down' || m.status === 'maintenance').length;

      if (area === 'fabrication') {
        const outstanding = workOrders.filter(wo => wo.status !== 'completed' && buckets.fabrication.some(m => m.id === wo.machineId)).length;
        return {
          title: 'Fabrication',
          description: 'Machining, molding, grinding, and fabrication assets.',
          icon: <Factory className="w-6 h-6 text-blue-500" />,
          machines: areaMachines,
          activeCount,
          downCount,
          additionalStat: `${outstanding} open work orders`,
          highlight: `${Math.round((activeCount / Math.max(areaMachines.length, 1)) * 100)}% uptime`,
        };
      }

      if (area === 'green-room') {
        const ecoCount = workOrders.filter(wo => buckets['green-room'].some(m => m.id === wo.machineId) && wo.type === 'PM').length;
        return {
          title: 'Green Room',
          description: 'Assembly lines, retainers, and measurement stations.',
          icon: <Warehouse className="w-6 h-6 text-emerald-500" />,
          machines: areaMachines,
          activeCount,
          downCount,
          additionalStat: `${ecoCount} preventative jobs in progress`,
          highlight: `${areaMachines.length} machines`,
        };
      }

      const pendingOrders = shippingOrders.filter(order => order.status !== 'shipped').length;
      return {
        title: 'Shipping',
        description: 'Wrap, pack, forklifts, and outbound logistics.',
        icon: <Package className="w-6 h-6 text-orange-500" />,
        machines: areaMachines,
        activeCount,
        downCount,
        additionalStat: `${pendingOrders} open shipping orders`,
        highlight: `${downCount} machines attention`,
      };
    };

    return areaOrdering.reduce((acc, area) => {
      acc[area] = makeSummary(area);
      return acc;
    }, {} as Record<ProductionArea, AreaSummary>);
  }, [machines, workOrders, shippingOrders]);

  const totals = useMemo(() => {
    const machineCount = machines.length;
    const active = machines.filter(m => m.status === 'active').length;
    const down = machines.filter(m => m.status === 'down').length;
    const maintenance = machines.filter(m => m.status === 'maintenance').length;
    const openOrders = shippingOrders.filter(order => order.status !== 'shipped').length;
    const openWorkOrders = workOrders.filter(wo => wo.status !== 'completed').length;

    return { machineCount, active, down, maintenance, openOrders, openWorkOrders };
  }, [machines, shippingOrders, workOrders]);

  if (loading) {
    return (
      <div className="w-full h-full bg-background overflow-auto p-6 space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background overflow-auto">
      <div className="p-4 sm:p-6 space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Production Overview</h2>
          <p className="text-sm text-muted-foreground">
            High-level view of fabrication, assembly, and shipping operations. Choose a workspace to dive deeper.
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Machines</span>
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-semibold mt-2">{totals.machineCount}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {totals.active} active • {totals.maintenance} in maintenance • {totals.down} down
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Work Orders</span>
                <Wrench className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-semibold mt-2">{totals.openWorkOrders}</p>
              <p className="text-xs text-muted-foreground mt-2">Open maintenance tasks across all areas</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shipping Orders</span>
                <Package className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-semibold mt-2">{totals.openOrders}</p>
              <p className="text-xs text-muted-foreground mt-2">Awaiting fulfillment or shipment</p>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {areaOrdering.map(area => {
            const summary = areaSummaries[area];
            return (
              <Card key={area} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">{summary.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{summary.title}</h3>
                      <p className="text-xs text-muted-foreground max-w-xs">{summary.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {summary.highlight}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground block">Machines</span>
                    <span className="text-base font-semibold">{summary.machines.length}</span>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground block">Active</span>
                    <span className="text-base font-semibold">{summary.activeCount}</span>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground block">Down / Maint.</span>
                    <span className="text-base font-semibold">{summary.downCount}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{summary.additionalStat}</p>

                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    onClick={() => onSelectArea?.(area)}
                    className="gap-2"
                  >
                    Open {summary.title}
                    <ArrowRightCircle className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}

