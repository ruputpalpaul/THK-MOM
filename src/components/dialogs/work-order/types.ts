import { Machine, ECO, Component } from '@/types/green-room';

export interface Task {
    id: string;
    description: string;
    status: 'pending' | 'pass' | 'fail';
    notes: string;
}

export interface Part {
    id: string;
    partNumber: string;
    qty: number;
    lot: string;
}

export interface WorkOrderFormData {
    machineId: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    assignedTo: string;
    requestedBy: string;
    createdBy: string;
    dueDate: string;
    estimatedHours: string;
    linkedECO: string;
    linkedEvent: string;
    linkedComponents: string[];
    linkedRCA: string;
    tasks: Task[];
    parts: Part[];
}

export interface WizardStepProps {
    formData: WorkOrderFormData;
    setFormData: React.Dispatch<React.SetStateAction<WorkOrderFormData>>;
    machines: Machine[];
    ecos: ECO[];
    components: Component[];
    filteredMachines: Machine[];
}
