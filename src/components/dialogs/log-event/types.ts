import { Machine, ECO, WorkOrder, Component } from '@/types/green-room';

export interface LogEventFormData {
    machineId: string;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'resolved';
    startTime: string;
    endTime: string;
    description: string;
    rootCause: string;
    resolutionNotes: string;
    reporter: string;
    resolvedBy: string;
    linkedECO: string;
    linkedWorkOrder: string;
    linkedComponents: string[];
    linkedRCA: string;
    unitsAffected: string;
    scrapCount: string;
    downtime: string;
}

export interface LogEventWizardStepProps {
    formData: LogEventFormData;
    setFormData: React.Dispatch<React.SetStateAction<LogEventFormData>>;
    machines: Machine[];
    filteredMachines: Machine[];
    ecos?: ECO[];
    workOrders?: WorkOrder[];
    components?: Component[];
    evidenceFiles?: File[];
    setEvidenceFiles?: React.Dispatch<React.SetStateAction<File[]>>;
}
