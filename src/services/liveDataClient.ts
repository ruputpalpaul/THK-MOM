import type {
  Machine,
  Event,
  WorkOrder,
  Document,
  ECO,
  Component,
  MachineSetting,
  ProductionData,
  ShippingOrder,
  Delivery,
  PartReadiness,
} from '@/types/green-room';
import type { Category } from '@/utils/api';

type InitializePayload = {
  machines: Machine[];
  events: Event[];
  workOrders: WorkOrder[];
  documents: Document[];
  ecos: ECO[];
  components: Component[];
  machineSettings: MachineSetting[];
  productionData: ProductionData[];
  categories: Category[];
};

type AllocateResponse = { order: ShippingOrder; parts: PartReadiness[] };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const ensureBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is required when VITE_USE_LIVE_API is enabled.',
    );
  }
};

const buildHeaders = (init?: RequestInit) => {
  const headers = new Headers(init?.headers ?? {});

  if (API_TOKEN && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${API_TOKEN}`);
  }

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', JSON_HEADERS['Content-Type']);
  }

  return headers;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  ensureBaseUrl();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `Live API request failed [${response.status} ${response.statusText}] ${detail}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export async function ping(): Promise<void> {
  await request('/health', { method: 'GET' });
}

export async function initializeDatabase(_: InitializePayload) {
  await ping().catch(() => {
    // If a health endpoint is unavailable we still allow the UI to proceed;
    // downstream requests will surface connection issues.
  });

  return {
    initialized: true,
    message: 'Live API mode enabled; skipping local dataset seeding.',
  };
}

// Machines
export const getMachines = () => request<Machine[]>('/machines');
export const getMachine = (id: string) =>
  request<Machine>(`/machines/${encodeURIComponent(id)}`);
export const createMachine = (machine: Machine) =>
  request<Machine>('/machines', {
    method: 'POST',
    body: JSON.stringify(machine),
  });
export const updateMachine = (id: string, updates: Partial<Machine>) =>
  request<Machine>(`/machines/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

// Events
export const getEvents = () => request<Event[]>('/events');
export const createEvent = (event: Event) =>
  request<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });

// Work Orders
export const getWorkOrders = () => request<WorkOrder[]>('/work-orders');
export const createWorkOrder = (workOrder: WorkOrder) =>
  request<WorkOrder>('/work-orders', {
    method: 'POST',
    body: JSON.stringify(workOrder),
  });
export const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) =>
  request<WorkOrder>(`/work-orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

// Documents
export const getDocuments = () => request<Document[]>('/documents');
export const createDocument = (document: Document) =>
  request<Document>('/documents', {
    method: 'POST',
    body: JSON.stringify(document),
  });

// ECOs
export const getECOs = () => request<ECO[]>('/ecos');
export const createECO = (eco: ECO) =>
  request<ECO>('/ecos', {
    method: 'POST',
    body: JSON.stringify(eco),
  });

// Components
export const getComponents = () => request<Component[]>('/components');

// Machine Settings
export const getMachineSettings = () =>
  request<MachineSetting[]>('/machine-settings');

// Production Data
export const getProductionData = () =>
  request<ProductionData[]>('/production-data');

// Categories
export const getCategories = () => request<Category[]>('/categories');

// Shipping
export const getShippingOrders = () =>
  request<ShippingOrder[]>('/shipping/orders');
export const updateShippingOrder = (
  id: string,
  updates: Partial<ShippingOrder>,
) =>
  request<ShippingOrder>(`/shipping/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
export const markOrderPacked = (orderId: string) =>
  request<ShippingOrder>(`/shipping/orders/${encodeURIComponent(orderId)}/pack`, {
    method: 'POST',
  });
export const markOrderShipped = (orderId: string) =>
  request<ShippingOrder>(
    `/shipping/orders/${encodeURIComponent(orderId)}/ship`,
    { method: 'POST' },
  );

export const getDeliveries = () => request<Delivery[]>('/shipping/deliveries');
export const updateDelivery = (id: string, updates: Partial<Delivery>) =>
  request<Delivery>(`/shipping/deliveries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

export const getPartsReadiness = () =>
  request<PartReadiness[]>('/shipping/parts-readiness');
export const updatePartReadiness = (
  id: string,
  updates: Partial<PartReadiness>,
) =>
  request<PartReadiness>(
    `/shipping/parts-readiness/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    },
  );

export const allocateToOrder = (
  orderId: string,
  sku: string,
  qty: number,
) =>
  request<AllocateResponse>(
    `/shipping/orders/${encodeURIComponent(orderId)}/allocate`,
    {
      method: 'POST',
      body: JSON.stringify({ sku, qty }),
    },
  );
