import { Machine, Event, WorkOrder, Document, ECO, Component, MachineSetting, ProductionData, ShippingOrder, Delivery, PartReadiness } from '../types/green-room';
import * as mock from '../data/mock-data';
import { withFormattedMachineName } from './machineNaming';

export type Category = { name: string; count: number };

// In-memory local store seeded from mock-data (no network calls)
let db = {
  machines: [...mock.machines] as Machine[],
  events: [...mock.events] as Event[],
  workOrders: [...mock.workOrders] as WorkOrder[],
  documents: [...mock.documents] as Document[],
  ecos: [...mock.ecos] as ECO[],
  components: [...mock.components] as Component[],
  machineSettings: [...mock.machineSettings] as MachineSetting[],
  productionData: [...mock.productionData] as ProductionData[],
  categories: [...mock.categories] as Category[],
  shippingOrders: [...mock.shippingOrders] as ShippingOrder[],
  deliveries: [...mock.deliveries] as Delivery[],
  partsReadiness: [...mock.partsReadiness] as PartReadiness[],
};

export async function initializeDatabase(data: {
  machines: Machine[];
  events: Event[];
  workOrders: WorkOrder[];
  documents: Document[];
  ecos: ECO[];
  components: Component[];
  machineSettings: MachineSetting[];
  productionData: ProductionData[];
  categories: Category[];
}): Promise<{ initialized: boolean; message: string }> {
  const machines = data.machines.map(machine => withFormattedMachineName(machine));
  db = {
    machines,
    events: [...data.events],
    workOrders: [...data.workOrders],
    documents: [...data.documents],
    ecos: [...data.ecos],
    components: [...data.components],
    machineSettings: [...data.machineSettings],
    productionData: [...data.productionData],
  categories: [...data.categories],
  shippingOrders: [...mock.shippingOrders],
  deliveries: [...mock.deliveries],
  partsReadiness: [...mock.partsReadiness],
  };
  return Promise.resolve({ initialized: true, message: 'Initialized local in-memory DB' });
}

// Machines
export async function getMachines(): Promise<Machine[]> { return Promise.resolve([...db.machines]); }
export async function getMachine(id: string): Promise<Machine> {
  const m = db.machines.find(m => m.id === id);
  if (!m) throw new Error('Machine not found');
  return Promise.resolve({ ...m });
}
export async function createMachine(machine: Machine): Promise<Machine> {
  const formatted = withFormattedMachineName(machine);
  db.machines.push(formatted);
  return Promise.resolve(formatted);
}
export async function updateMachine(id: string, updates: Partial<Machine>): Promise<Machine> {
  const idx = db.machines.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Machine not found');
  // Enforce downtime reason when setting status to 'down'
  if (updates.status === 'down') {
    const reason = updates.downReason ?? db.machines[idx].downReason;
    if (!reason || reason.trim().length === 0) {
      throw new Error("Downtime reason is required when setting status to 'down'.");
    }
  }
  const updated = withFormattedMachineName({ ...db.machines[idx], ...updates });
  db.machines[idx] = updated;
  return Promise.resolve(updated);
}

// Events
export async function getEvents(): Promise<Event[]> { return Promise.resolve([...db.events]); }
export async function createEvent(event: Event): Promise<Event> { db.events.push(event); return Promise.resolve(event); }

// Work Orders
export async function getWorkOrders(): Promise<WorkOrder[]> { return Promise.resolve([...db.workOrders]); }
export async function createWorkOrder(workOrder: WorkOrder): Promise<WorkOrder> { db.workOrders.push(workOrder); return Promise.resolve(workOrder); }
export async function updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
  const idx = db.workOrders.findIndex(w => w.id === id);
  if (idx === -1) throw new Error('Work order not found');
  db.workOrders[idx] = { ...db.workOrders[idx], ...updates } as WorkOrder;
  return Promise.resolve(db.workOrders[idx]);
}

// Documents
export async function getDocuments(): Promise<Document[]> { return Promise.resolve([...db.documents]); }
export async function createDocument(document: Document): Promise<Document> { db.documents.push(document); return Promise.resolve(document); }

// ECOs
export async function getECOs(): Promise<ECO[]> { return Promise.resolve([...db.ecos]); }
export async function createECO(eco: ECO): Promise<ECO> { db.ecos.push(eco); return Promise.resolve(eco); }

// Components
export async function getComponents(): Promise<Component[]> { return Promise.resolve([...db.components]); }

// Machine Settings
export async function getMachineSettings(): Promise<MachineSetting[]> { return Promise.resolve([...db.machineSettings]); }

// Production Data
export async function getProductionData(): Promise<ProductionData[]> { return Promise.resolve([...db.productionData]); }

// Categories
export async function getCategories(): Promise<Category[]> { return Promise.resolve([...db.categories]); }

// Shipping: Orders, Deliveries, Parts Readiness
export async function getShippingOrders(): Promise<ShippingOrder[]> { return Promise.resolve([...db.shippingOrders]); }
export async function updateShippingOrder(id: string, updates: Partial<ShippingOrder>): Promise<ShippingOrder> {
  const idx = db.shippingOrders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Shipping order not found');
  db.shippingOrders[idx] = { ...db.shippingOrders[idx], ...updates } as ShippingOrder;
  return Promise.resolve(db.shippingOrders[idx]);
}

export async function getDeliveries(): Promise<Delivery[]> { return Promise.resolve([...db.deliveries]); }
export async function updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery> {
  const idx = db.deliveries.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Delivery not found');
  db.deliveries[idx] = { ...db.deliveries[idx], ...updates } as Delivery;
  return Promise.resolve(db.deliveries[idx]);
}

export async function getPartsReadiness(): Promise<PartReadiness[]> { return Promise.resolve([...db.partsReadiness]); }
export async function updatePartReadiness(id: string, updates: Partial<PartReadiness>): Promise<PartReadiness> {
  const idx = db.partsReadiness.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Part readiness not found');
  db.partsReadiness[idx] = { ...db.partsReadiness[idx], ...updates } as PartReadiness;
  return Promise.resolve(db.partsReadiness[idx]);
}

// Domain helpers for Shipping
export async function markOrderPacked(orderId: string): Promise<ShippingOrder> {
  const order = db.shippingOrders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  order.status = 'packed';
  order.packedAt = new Date().toISOString();
  return Promise.resolve({ ...order });
}

export async function markOrderShipped(orderId: string): Promise<ShippingOrder> {
  const order = db.shippingOrders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  order.status = 'shipped';
  order.shippedAt = new Date().toISOString();
  return Promise.resolve({ ...order });
}

// Allocate quantity of a part towards an order item and update readiness accordingly.
export async function allocateToOrder(orderId: string, sku: string, qty: number): Promise<{ order: ShippingOrder; parts: PartReadiness[] }>{
  const order = db.shippingOrders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  const item = order.items.find(i => i.sku === sku);
  if (!item) throw new Error('Order item not found');
  const prList = db.partsReadiness.filter(p => p.requiredForOrderId === orderId && p.partNumber === sku);
  // compute available pool
  let remaining = qty;
  for (const pr of prList) {
    if (remaining <= 0) break;
    const take = Math.min(pr.availableQty, remaining);
    pr.availableQty -= take;
    remaining -= take;
    // update status per item
    if (pr.availableQty >= pr.requiredQty) pr.status = 'ready';
    else if (pr.availableQty === 0) pr.status = 'allocated';
    else pr.status = 'short';
  }
  // update order item readyQty
  item.readyQty = Math.min((item.readyQty ?? 0) + (qty - remaining), item.qty);
  return Promise.resolve({ order: { ...order }, parts: prList.map(p => ({ ...p })) });
}
