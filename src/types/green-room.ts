export type MachineStatus = 'active' | 'down' | 'maintenance';

export interface Machine {
  id: string;
  name: string;
  type: string;
  category: string;
  status: MachineStatus;
  oem?: string;
  controller?: string;
  commissionedDate?: string;
  criticality?: 'high' | 'medium' | 'low';
  lastBackup?: string;
  lastDowntime?: string;
  mtbf?: number; // Mean Time Between Failures (hours)
  mttr?: number; // Mean Time To Repair (hours)
  oee?: number; // Overall Equipment Effectiveness (%)
  power?: string;
  air?: string;
  network?: string;
  x?: number; // Position on floor map
  y?: number;
  todayTarget?: number; // Today's production target
  todayActual?: number; // Today's actual production count
  todayScrap?: number; // Today's scrap count
  downReason?: string; // Reason for machine being down
  diagnosed?: boolean; // Whether diagnosis has been completed
}

export interface Event {
  id: string;
  machineId: string;
  machineName: string;
  type: 'fault' | 'downtime' | 'uptime' | 'backup' | 'eco' | 'maintenance';
  description: string;
  timestamp: string;
}

export interface Component {
  id: string;
  machineId: string;
  name: string;
  type: 'spindle' | 'conveyor' | 'clamp' | 'vision_cam' | 'valve_bank' | 'servo_axis' | 'air_micro' | 'laser_head' | 'cylinder' | 'solenoid' | 'sensor' | 'ballscrew';
  parentComponentId?: string;
  vendor?: string;
  model?: string;
  partNumber?: string;
  assetTag?: string;
  serial?: string;
  criticality: 1 | 2 | 3 | 4 | 5;
  expectedLife?: string;
  spareQty?: number;
  spareLocation?: string;
}

export interface RCA {
  id: string;
  method: '5-Why' | 'Fishbone' | 'Fault-Tree';
  symptom: string;
  occurrenceTime: string;
  reproSteps?: string;
  rootCauses: Array<{
    category: string;
    description: string;
    evidence: string;
  }>;
  correctiveActions: Array<{
    action: string;
    owner: string;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
  verification?: string;
  linkedDocs?: string[];
  linkedComponents?: string[];
}

export interface WorkOrder {
  id: string;
  number?: string; // Work order number
  title?: string; // Optional title for work order
  machineId: string;
  machineName: string;
  type: 'PM' | 'CM' | 'Calibration' | 'Emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'awaiting-parts' | 'completed';
  description: string;
  requestedBy?: string;
  assignee?: string;
  dueDate: string;
  linkedEventId?: string;
  linkedComponentId?: string;
  tasks?: Array<{
    description: string;
    status: 'pass' | 'fail' | 'pending';
    notes?: string;
  }>;
  partsUsed?: Array<{
    partNumber: string;
    qty: number;
    lot?: string;
  }>;
  laborHours?: number;
  rcaId?: string;
  evidence?: string[];
  verifiedBy?: string;
  completedDate?: string;
}

export interface Document {
  id: string;
  machineId: string;
  machineName: string;
  type: 'Program Backup' | 'Operator Manual' | 'Drawings';
  name: string;
  uploadDate: string;
  fileUrl: string;
  version?: string;
  controller?: string;
  fileHash?: string;
  createdBy?: string;
  supersedes?: string;
  releaseState?: 'draft' | 'approved';
  notes?: string;
  revision?: string;
  partNumbers?: string[];
  approvedBy?: string;
  effectiveFrom?: string;
  linkedECO?: string;
  linkedComponents?: string[];
}

export interface ProductionData {
  id: string;
  machineId: string;
  date: string;
  target: number;
  actual: number;
  scrap: number;
  downtime: number; // minutes
  cycleTime: number; // seconds
}

export interface ECO {
  id: string;
  machineId: string;
  machineName: string;
  number: string;
  title: string;
  type: 'Software' | 'Hardware' | 'Process' | 'Documentation';
  status: 'draft' | 'review' | 'approved' | 'effective' | 'closed';
  description: string;
  reason: 'safety' | 'quality' | 'cost' | 'capacity';
  requestedBy?: string;
  approvers?: string[];
  impactedComponents?: string[];
  impactedDocuments?: string[];
  impactedSettings?: string[];
  attachments?: string[];
  effectiveFrom?: string;
  rollbackPlan?: string;
  rcaId?: string;
  partsAssociated?: Array<{
    partNumber: string;
    qty: number;
  }>;
  date: string;
  modSheet?: ModSheet;
}

export interface ModSheetRequestSection {
  receiptNumber?: string;
  date?: string;
  machineName?: string;
  machineNumber?: string;
  parkLinkRailModification?: boolean;
  controlPlanUpdate?: boolean;
  pfmeaUpdate?: boolean;
  requestedDueDate?: string;
  requestedBy?: string;
  confirmedBy?: string;
}

export interface ModSheetDetail {
  description?: string;
  printNumber?: string;
  designLocation?: string;
  installLocation?: string;
  testType?: string;
  consumablesOrSoftware?: string;
  componentCost?: string;
  additionalNotes?: string;
}

export interface ModSheetEngineeringSection {
  mechanical: ModSheetDetail;
  electrical: ModSheetDetail;
  documentationNotes?: string;
  totalCost?: string;
  hours?: string;
}

export interface ModSheetApprovals {
  preparedBy?: string;
  confirmedBy?: string;
  checkedBy?: string;
  engineer?: string;
  engineerDate?: string;
}

export interface ModSheet {
  request: ModSheetRequestSection;
  engineering: ModSheetEngineeringSection;
  approvals?: ModSheetApprovals;
}

export interface MachineSetting {
  id: string;
  machineId: string;
  category: 'Safety' | 'Process' | 'Communication';
  subcategory?: string;
  key: string;
  value: string;
  unit?: string;
  effectiveFrom?: string;
  changedBy?: string;
  linkedECO?: string;
}

// Shipping domain
export type OrderStatus = 'pending' | 'picking' | 'packed' | 'shipped' | 'on-hold';
export interface ShippingOrderItem {
  sku: string;
  description: string;
  qty: number;
  readyQty?: number;
}
export interface ShippingOrder {
  id: string;
  orderNumber: string;
  customer: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: OrderStatus;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  packedAt?: string; // ISO timestamp
  shippedAt?: string; // ISO timestamp
  assignedTo?: string;
  notes?: string;
  items: ShippingOrderItem[];
}

export type DeliveryStatus = 'scheduled' | 'arrived' | 'departed' | 'delayed' | 'cancelled';
export interface Delivery {
  id: string;
  carrier: string;
  reference?: string; // tracking or BOL
  scheduledDate: string; // YYYY-MM-DD
  windowStart?: string; // HH:mm
  windowEnd?: string; // HH:mm
  dock?: string;
  status: DeliveryStatus;
  orderIds: string[]; // linked shipping orders
  eta?: string; // ISO or HH:mm for today
  notes?: string;
}

export type PartReadinessStatus = 'ready' | 'short' | 'allocated';
export interface PartReadiness {
  id: string;
  partNumber: string;
  description?: string;
  location?: string;
  requiredForOrderId?: string;
  requiredQty: number;
  availableQty: number;
  status: PartReadinessStatus;
}
