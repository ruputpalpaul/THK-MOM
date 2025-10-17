import { useEffect, useMemo, useState } from 'react';
import { ShippingOrder, PartReadiness, Delivery } from '@/types/green-room';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Package, User, Calendar, ClipboardCheck, Send, Truck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import * as api from '@/utils/api';

interface Props {
  order: ShippingOrder;
  onBack: () => void;
}

export function ShippingOrderDetailsPage({ order: initialOrder, onBack }: Props) {
  const [order, setOrder] = useState<ShippingOrder>(initialOrder);
  const [parts, setParts] = useState<PartReadiness[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder.id]);

  async function refresh() {
    setLoading(true);
    try {
      const [orders, allParts, allDeliveries] = await Promise.all([
        api.getShippingOrders(),
        api.getPartsReadiness(),
        api.getDeliveries(),
      ]);
      const found = orders.find(o => o.id === initialOrder.id);
      if (found) setOrder(found);
      setParts(allParts.filter(p => p.requiredForOrderId === initialOrder.id));
      setDeliveries(allDeliveries.filter(d => (d.orderIds || []).includes(initialOrder.id)));
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const totalQty = order.items.reduce((a, it) => a + it.qty, 0);
    const totalReady = order.items.reduce((a, it) => a + (it.readyQty ?? 0), 0);
    const readyPct = Math.round((totalReady / Math.max(totalQty, 1)) * 100);
    return { totalQty, totalReady, readyPct };
  }, [order]);

  const overall = useMemo(() => {
    const ready = parts.every(p => p.status === 'ready');
    const short = parts.some(p => p.status === 'short');
    return ready ? 'ready' : short ? 'short' : 'partial';
  }, [parts]);

  async function handlePacked() {
    await api.markOrderPacked(order.id);
    await refresh();
  }

  async function handleShipped() {
    await api.markOrderShipped(order.id);
    await refresh();
  }

  async function allocateOne(sku: string, qty = 1) {
    await api.allocateToOrder(order.id, sku, qty);
    await refresh();
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading order…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-background p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shipping
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{order.orderNumber}</h1>
              <Badge variant="outline">{order.status}</Badge>
              <Badge variant="secondary">{order.priority}</Badge>
              {overall === 'ready' && (
                <Badge className="bg-green-100 text-green-800" variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1" /> Ready</Badge>
              )}
              {overall === 'short' && (
                <Badge className="bg-red-100 text-red-800" variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" /> Short</Badge>
              )}
              {overall === 'partial' && (
                <Badge className="bg-blue-100 text-blue-800" variant="secondary"><Clock className="w-3 h-3 mr-1" /> Partial</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Customer: <span className="text-foreground">{order.customer}</span></span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Assigned: <span className="text-foreground">{order.assignedTo || 'Unassigned'}</span></span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Due: <span className="text-foreground">{order.dueDate}</span></span>
              </div>
              {order.packedAt && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Packed: <span className="text-foreground">{new Date(order.packedAt).toLocaleString()}</span></span>
                  </div>
                </>
              )}
              {order.shippedAt && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Shipped: <span className="text-foreground">{new Date(order.shippedAt).toLocaleString()}</span></span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={order.status!=='picking' && order.status!=='pending'} onClick={handlePacked}>
              <ClipboardCheck className="w-4 h-4 mr-2" /> Mark Packed
            </Button>
            <Button size="sm" variant="secondary" disabled={order.status!=='packed'} onClick={handleShipped}>
              <Send className="w-4 h-4 mr-2" /> Mark Shipped
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Summary</div>
            <div className="text-sm">Ready: <span className="font-medium">{totals.totalReady}/{totals.totalQty}</span> ({totals.readyPct}%)</div>
          </div>
        </Card>

        <Tabs defaultValue="items" className="w-full">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-3">
            <Card className="p-3">
              <div className="grid gap-2">
                {order.items.map(it => (
                  <div key={it.sku} className="text-sm flex items-center justify-between border rounded-md p-2 bg-muted">
                    <div>
                      <div className="font-medium">{it.sku}</div>
                      <div className="text-xs text-muted-foreground">{it.description}</div>
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <span>{it.readyQty ?? 0}/{it.qty} ready</span>
                      <Button size="sm" variant="outline" onClick={() => allocateOne(it.sku, 1)}>Allocate 1</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="parts" className="mt-3">
            <Card className="p-3">
              <div className="grid md:grid-cols-2 gap-2">
                {parts.map(p => (
                  <div key={p.id} className={`text-sm flex items-center justify-between border rounded-md p-2 ${p.status==='ready'?'text-green-700 bg-green-50 border-green-200':p.status==='short'?'text-red-700 bg-red-50 border-red-200':'text-blue-700 bg-blue-50 border-blue-200'}`}>
                    <div>
                      <div className="font-medium">{p.partNumber}</div>
                      <div className="text-xs text-muted-foreground">{p.description} • {p.location}</div>
                    </div>
                    <div className="text-xs">{p.availableQty}/{p.requiredQty} available</div>
                  </div>
                ))}
                {parts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No parts tracked for this order.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="mt-3">
            <Card className="p-3">
              <div className="grid gap-2">
                {deliveries.map(d => (
                  <Card key={d.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <div className="font-medium">{d.carrier} • {d.reference}</div>
                      </div>
                      <Badge variant="outline">{d.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{d.scheduledDate} • {d.windowStart}-{d.windowEnd} • Dock {d.dock}</div>
                  </Card>
                ))}
                {deliveries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No deliveries linked to this order.</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
