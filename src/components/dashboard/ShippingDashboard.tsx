import { useEffect, useMemo, useState } from 'react';
import * as api from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Machine, ShippingOrder, Delivery, PartReadiness, OrderStatus } from '@/types/green-room';
import { MachineCard } from '@/components/machine/MachineCard';
import { Package, Truck, CheckCircle2, AlertTriangle, Clock, Box, Layers, ClipboardCheck, Send, Wrench, CalendarDays, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
interface Props {
  onViewOrder?: (order: ShippingOrder) => void;
  onMachineSelect?: (machine: Machine | null) => void;
}

export function ShippingDashboard({ onViewOrder, onMachineSelect }: Props) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [parts, setParts] = useState<PartReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  type OrderFilter = 'all' | OrderStatus;
  const [orderStatus, setOrderStatus] = useState<OrderFilter>('all');
  const [agingOpen, setAgingOpen] = useState(false);
  const [dockDate, setDockDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [dockStatus, setDockStatus] = useState<'all' | Delivery['status']>('all');

  useEffect(() => {
    (async () => {
      try {
        await refreshAll();
      } catch (e) {
        console.error('Failed to load shipping data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refreshAll() {
    const [m, o, d, p] = await Promise.all([
      api.getMachines(),
      api.getShippingOrders(),
      api.getDeliveries(),
      api.getPartsReadiness(),
    ]);
    setMachines(m);
    setOrders(o);
    setDeliveries(d);
    setParts(p);
  }

  const shippingMachines = useMemo(() => machines.filter(m => /Shipping - (Wrap|Pack)/i.test(m.category)), [machines]);
  const forklifts = useMemo(() => machines.filter(m => /Shipping - Forklift/i.test(m.category)), [machines]);
  const inventorySkus = useMemo(() => {
    // Aggregate available by partNumber from parts readiness
    const map = new Map<string, number>();
    for (const p of parts) {
      map.set(p.partNumber, (map.get(p.partNumber) || 0) + p.availableQty);
    }
    return Array.from(map.entries()).map(([sku, qty]) => ({ sku, qty }));
  }, [parts]);

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase();
    return orders
      .filter(o => (orderStatus === 'all' ? true : o.status === orderStatus))
      .filter(o =>
        [o.orderNumber, o.customer, o.assignedTo, o.notes, ...o.items.map(i => `${i.sku} ${i.description}`)]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(term))
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [orders, search, orderStatus]);

  const todaysDeliveries = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return deliveries.filter(d => d.scheduledDate === today).sort((a, b) => (a.windowStart || '').localeCompare(b.windowStart || ''));
  }, [deliveries]);

  const agingOrders = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    return orders.filter(o => o.status !== 'shipped' && o.dueDate < today)
      .sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  }, [orders]);

  const dockDayDeliveries = useMemo(() => {
    const list = deliveries
      .filter(d => d.scheduledDate === dockDate)
      .filter(d => dockStatus === 'all' ? true : d.status === dockStatus)
      .slice()
      .sort((a,b) => (a.windowStart||'').localeCompare(b.windowStart||''));
    return list;
  }, [deliveries, dockDate, dockStatus]);

  const partsByOrder = useMemo(() => {
    const map: Record<string, PartReadiness[]> = {};
    for (const pr of parts) {
      if (!pr.requiredForOrderId) continue;
      map[pr.requiredForOrderId] = map[pr.requiredForOrderId] || [];
      map[pr.requiredForOrderId].push(pr);
    }
    return map;
  }, [parts]);

  // Wrap/Pack Lines Utilization (Shipping): prefer throughput (actual/target); otherwise uptime (active/total)
  const wrapPackUtil = useMemo(() => {
    const cats = ['Shipping - Wrap', 'Shipping - Pack'] as const;
    return cats.map((cat) => {
      const ms = machines.filter((m) => m.category === cat);
      const total = ms.length;
      const active = ms.filter((m) => m.status === 'active').length;
      const target = ms.reduce((a, m) => a + (m.todayTarget || 0), 0);
      const actual = ms.reduce((a, m) => a + (m.todayActual || 0), 0);
      const util = target > 0 ? Math.round((actual / Math.max(target, 1)) * 100) : Math.round((active / Math.max(total, 1)) * 100);
      const down = ms.filter((m) => m.status !== 'active').length;
      return { category: cat.replace('Shipping - ', ''), util, total, active, down };
    });
  }, [machines]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const readyOrders = orders.filter(o => (partsByOrder[o.id] || []).every(p => p.status === 'ready'));
  // KPI estimates
  const shippedThisWeek = orders.filter(o => o.status === 'shipped').length;
  const onTimeShipPct = Math.round((shippedThisWeek / Math.max(orders.length, 1)) * 100);
  const pickRate = Math.round(
    orders.reduce((acc, o) => acc + o.items.reduce((a, it) => a + (it.readyQty ?? 0), 0), 0) /
    Math.max(orders.reduce((acc, o) => acc + o.items.reduce((a, it) => a + it.qty, 0), 0), 1) * 100
  );
  // const shortOrders = orders.filter(o => (partsByOrder[o.id] || []).some(p => p.status === 'short'));

  return (
    <>
  <div className="w-full h-full bg-background overflow-auto">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Summary */}
    <Card className="p-6 border bg-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Shipping Overview</h3>
              <p className="text-sm text-muted-foreground">Wrap/Pack machines, orders, deliveries, and parts readiness</p>
            </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              <Summary icon={<Box className="w-4 h-4" />} label="Wrap/Pack" value={shippingMachines.length} />
              <Summary icon={<Package className="w-4 h-4" />} label="Open Orders" value={orders.filter(o => o.status !== 'shipped').length} />
              <Summary icon={<Truck className="w-4 h-4" />} label="Today Deliveries" value={todaysDeliveries.length} />
              <Summary icon={<Layers className="w-4 h-4" />} label="Ready Orders" value={readyOrders.length} />
              <Summary icon={<ClipboardCheck className="w-4 h-4" />} label="On-time Ship %" value={onTimeShipPct} />
              <Summary icon={<Clock className="w-4 h-4" />} label="Pick Rate %" value={pickRate} />
              <Summary icon={<AlertTriangle className="w-4 h-4" />} label="Aging Orders" value={agingOrders.length} onClick={() => setAgingOpen(true)} clickable />
            </div>
          </div>
        </Card>

        {/* Equipment */}
    <Card className="p-6 border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-foreground">Wrap & Pack Machines</h4>
          </div>
          {shippingMachines.length === 0 ? (
      <p className="text-sm text-muted-foreground">No wrap/pack equipment detected.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {shippingMachines.map((machine) => (
                <MachineCard key={machine.id} machine={machine} onSelect={(m) => onMachineSelect?.(m)} />
              ))}
            </div>
          )}
        </Card>

        {/* Forklifts & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-6 border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-foreground">Forklifts</h4>
            </div>
            {forklifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No forklifts defined.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forklifts.map(f => (
                  <Card key={f.id} className="p-3 flex items-center justify-between cursor-pointer hover:shadow-sm" onClick={() => onMachineSelect?.(f)}>
                    <div className="flex items-center gap-2">
          <Wrench className={`w-4 h-4 ${f.status==='maintenance'?'text-blue-600':'text-muted-foreground'}`} />
                      <div className="font-medium">{f.name}</div>
                    </div>
                    <Badge variant="outline">{f.status}</Badge>
                  </Card>
                ))}
              </div>
            )}
          </Card>
      <Card className="p-6 border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-foreground">Inventory Snapshot</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {inventorySkus.slice(0, 10).map(inv => (
        <div key={inv.sku} className="border rounded-md p-2 bg-muted text-sm flex items-center justify-between">
                  <span className="font-medium">{inv.sku}</span>
                  <span className="text-xs text-muted-foreground">{inv.qty} available</span>
                </div>
              ))}
              {inventorySkus.length === 0 && <p className="text-sm text-muted-foreground">No inventory data.</p>}
            </div>
          </Card>
        </div>

        {/* Wrap/Pack Lines Utilization */}
        <Card className="p-6 border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-foreground">Lines Utilization (Shipping)</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wrapPackUtil.map((u) => (
              <div key={u.category} className="border rounded-lg p-3 bg-muted">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{u.category}</div>
                  <div className="text-sm">{u.util}%</div>
                </div>
                <div className="w-full bg-muted rounded h-2 mt-2">
                  <div className="h-2 bg-primary rounded" style={{ width: `${Math.min(u.util, 100)}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-2">Active {u.active}/{u.total} • Down {u.down}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Orders, Deliveries, Parts */}
  <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="parts">Parts Readiness</TabsTrigger>
      <TabsTrigger value="calendar">Dock Calendar</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            <Card className="p-4 border bg-card">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-3">
                <div className="flex gap-2 items-center">
                  <Input placeholder="Search orders, customers, SKUs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-72" />
                  <Badge variant="outline">Total: {filteredOrders.length}</Badge>
                </div>
                <div className="flex gap-2">
                  {(['all','pending','picking','packed','shipped','on-hold'] as const).map((s) => (
                    <Button key={s} size="sm" variant={orderStatus===s?'secondary':'outline'} onClick={() => setOrderStatus(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-3 mt-3">
                {filteredOrders.map(o => (
                  <OrderRow key={o.id} order={o} parts={partsByOrder[o.id] || []} onChange={refreshAll} onOpen={() => onViewOrder?.(o)} />
                ))}
                {filteredOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground">No orders match your filters.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries" className="mt-4">
            <Card className="p-4 border bg-card">
              <div className="text-sm text-muted-foreground mb-2">Today</div>
              <div className="grid gap-3">
                {todaysDeliveries.map(d => (
                  <DeliveryRow key={d.id} delivery={d} onChange={refreshAll} />
                ))}
                {todaysDeliveries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No deliveries scheduled for today.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Dock Calendar Tab */}
          <TabsContent value="calendar" className="mt-4">
            <Card className="p-4 border bg-card space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <input type="date" className="border rounded px-2 py-1 text-sm" value={dockDate} onChange={(e) => setDockDate(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {(['all','scheduled','arrived','departed','delayed','cancelled'] as const).map((s) => (
                    <Button key={s} size="sm" variant={dockStatus===s?'secondary':'outline'} onClick={() => setDockStatus(s)}>{s}</Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="grid gap-3">
                {dockDayDeliveries.map(d => (
                  <DeliveryRow key={d.id} delivery={d} onChange={refreshAll} />
                ))}
                {dockDayDeliveries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No deliveries for selected day and filter.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Parts Readiness Tab */}
          <TabsContent value="parts" className="mt-4">
            <Card className="p-4 border bg-card">
              <div className="grid gap-3">
                {orders.map(o => (
                  <Card key={o.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <div className="font-medium">{o.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">{o.customer}</div>
                      </div>
                      <Badge variant="outline">Due {o.dueDate}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {(partsByOrder[o.id] || []).map(p => (
                        <PartRow key={p.id} part={p} />
                      ))}
                      {(partsByOrder[o.id] || []).length === 0 && (
                        <p className="text-sm text-muted-foreground">No parts tracked for this order.</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  </div>

  {/* Aging Orders Dialog */}
  <Dialog open={agingOpen} onOpenChange={setAgingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aging Orders</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {agingOrders.map(o => (
      <Card key={o.id} className="p-3 flex items-center justify-between cursor-pointer hover:shadow-sm" onClick={() => onViewOrder?.(o)}>
              <div className="text-sm">
                <div className="font-medium">{o.orderNumber} • {o.customer}</div>
                <div className="text-xs text-muted-foreground">Due {o.dueDate} • {o.items.length} items</div>
              </div>
              <Badge variant="outline">{o.status}</Badge>
            </Card>
          ))}
          {agingOrders.length === 0 && (
            <p className="text-sm text-muted-foreground">No aging orders.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

function Summary({ icon, label, value, onClick, clickable }: { icon: React.ReactNode; label: string; value: number; onClick?: () => void; clickable?: boolean }) {
  return (
    <div className={`rounded-lg border bg-muted p-3 flex items-center gap-2 ${clickable?'cursor-pointer hover:shadow-sm':''}`} onClick={onClick}>
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

async function markOrderStatus(orderId: string, status: ShippingOrder['status']) {
  if (status === 'packed') {
    await api.markOrderPacked(orderId);
  } else if (status === 'shipped') {
    await api.markOrderShipped(orderId);
  } else {
    await api.updateShippingOrder(orderId, { status });
  }
}

async function allocatePart(part: PartReadiness, qty: number) {
  await api.allocateToOrder(part.requiredForOrderId!, part.partNumber, qty);
}

function OrderRow({ order, parts, onChange, onOpen }: { order: ShippingOrder; parts: PartReadiness[]; onChange?: () => void | Promise<void>; onOpen?: () => void | Promise<void> }) {
  const ready = parts.every(p => p.status === 'ready');
  const short = parts.some(p => p.status === 'short');
  const overall = ready ? 'ready' : short ? 'short' : 'partial';
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-3 text-left hover:opacity-90" onClick={onOpen}>
          <Package className="w-4 h-4" />
          <div>
            <div className="font-medium underline underline-offset-2">{order.orderNumber} • {order.customer}</div>
            <div className="text-xs text-muted-foreground">Due {order.dueDate} • {order.items.length} items</div>
          </div>
          <Badge variant="outline" className="ml-2">{order.status}</Badge>
        </button>
        <div className="flex items-center gap-2">
          {overall === 'ready' && <Badge className="bg-green-100 text-green-800" variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1" /> Ready</Badge>}
          {overall === 'short' && <Badge className="bg-red-100 text-red-800" variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" /> Short</Badge>}
          {overall === 'partial' && <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Partial</Badge>}
          <Button size="sm" variant="outline" disabled={order.status!=='picking' && order.status!=='pending'} onClick={async () => { await markOrderStatus(order.id, 'packed'); await onChange?.(); }}>
            <ClipboardCheck className="w-3 h-3 mr-1" /> Mark Packed
          </Button>
          <Button size="sm" variant="secondary" disabled={order.status!=='packed'} onClick={async () => { await markOrderStatus(order.id, 'shipped'); await onChange?.(); }}>
            <Send className="w-3 h-3 mr-1" /> Mark Shipped
          </Button>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="grid md:grid-cols-2 gap-2">
        {order.items.map(it => (
          <div key={it.sku} className="text-sm flex items-center justify-between border rounded-md p-2 bg-muted">
            <div>
              <div className="font-medium">{it.sku}</div>
              <div className="text-xs text-muted-foreground">{it.description}</div>
            </div>
            <div className="text-xs flex items-center gap-2">
              <span>{it.readyQty ?? 0}/{it.qty} ready</span>
              <Button size="sm" variant="outline" onClick={async () => { await allocatePart({
                id: `temp-${order.id}-${it.sku}`,
                partNumber: it.sku,
                description: it.description,
                requiredForOrderId: order.id,
                requiredQty: it.qty,
                availableQty: it.readyQty ?? 0,
                status: 'allocated'
              }, 1); await onChange?.(); }}>Allocate 1</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function updateDeliveryStatus(id: string, status: Delivery['status']) {
  await api.updateDelivery(id, { status });
}

function DeliveryRow({ delivery, onChange }: { delivery: Delivery; onChange?: () => void | Promise<void> }) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-4 h-4" />
          <div>
            <div className="font-medium">{delivery.carrier} • {delivery.reference}</div>
            <div className="text-xs text-muted-foreground">Dock {delivery.dock} • {delivery.windowStart}-{delivery.windowEnd}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{delivery.status}</Badge>
          <Button size="sm" variant="outline" onClick={async () => { await updateDeliveryStatus(delivery.id, 'arrived'); await onChange?.(); }}>Arrived</Button>
          <Button size="sm" variant="secondary" onClick={async () => { await updateDeliveryStatus(delivery.id, 'departed'); await onChange?.(); }}>Departed</Button>
        </div>
      </div>
      {delivery.orderIds?.length ? (
        <div className="text-xs text-muted-foreground mt-2">Orders: {delivery.orderIds.join(', ')}</div>
      ) : null}
    </Card>
  );
}

function PartRow({ part }: { part: PartReadiness }) {
  const tone = part.status === 'ready' ? 'text-green-700 bg-green-50 border-green-200'
    : part.status === 'short' ? 'text-red-700 bg-red-50 border-red-200'
    : 'text-amber-700 bg-amber-50 border-amber-200';
  return (
    <div className={`text-sm flex items-center justify-between border rounded-md p-2 ${tone}`}>
      <div>
        <div className="font-medium">{part.partNumber}</div>
        <div className="text-xs text-muted-foreground">{part.description} • {part.location}</div>
      </div>
      <div className="text-xs">{part.availableQty}/{part.requiredQty} available</div>
    </div>
  );
}
