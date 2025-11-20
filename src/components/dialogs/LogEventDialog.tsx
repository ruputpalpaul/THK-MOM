import { useState, useEffect } from 'react';
import { WizardDialog } from '../ui/wizard-dialog';
import { Machine, ECO, WorkOrder, Component } from '../../types/green-room';
import * as mock from '../../data/mock-data';
import * as api from '../../utils/api';
import { toast } from 'sonner';
import { LogEventFormData } from './log-event/types';
import { Step1Triage } from './log-event/Step1Triage';
import { Step2Details } from './log-event/Step2Details';
import { Step3Impact } from './log-event/Step3Impact';
import { Step4Review } from './log-event/Step4Review';

interface LogEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowedMachineIds?: string[];
}

export function LogEventDialog({ open, onOpenChange, allowedMachineIds }: LogEventDialogProps) {
  const [formData, setFormData] = useState<LogEventFormData>({
    machineId: '',
    eventType: '',
    severity: 'medium',
    startTime: '',
    endTime: '',
    description: '',
    rootCause: '',
    resolutionNotes: '',
    reporter: '',
    resolvedBy: '',
    status: 'open',
    linkedECO: '',
    linkedWorkOrder: '',
    linkedComponents: [],
    linkedRCA: '',
    unitsAffected: '',
    scrapCount: '',
    downtime: '',
  });

  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [ecos, setECOs] = useState<ECO[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [components, setComponents] = useState<Component[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [machinesData, ecosData, workOrdersData, componentsData] = await Promise.all([
          api.getMachines(),
          api.getECOs(),
          api.getWorkOrders(),
          api.getComponents(),
        ]);
        setMachines((machinesData && machinesData.length > 0) ? machinesData : mock.machines);
        setECOs((ecosData && ecosData.length > 0) ? ecosData : mock.ecos);
        setWorkOrders((workOrdersData && workOrdersData.length > 0) ? workOrdersData : mock.workOrders);
        setComponents((componentsData && componentsData.length > 0) ? componentsData : mock.components);
      } catch (error) {
        console.error('Error loading data:', error);
        setMachines(mock.machines);
        setECOs(mock.ecos);
        setWorkOrders(mock.workOrders);
        setComponents(mock.components);
      }
    }

    if (open) {
      loadData();
    }
  }, [open]);

  // Ensure selected machine stays within allowed set
  useEffect(() => {
    if (!open) return;
    if (allowedMachineIds && formData.machineId && !allowedMachineIds.includes(formData.machineId)) {
      setFormData(prev => ({ ...prev, machineId: '' }));
    }
  }, [open, allowedMachineIds, formData.machineId]);

  const filteredMachines = allowedMachineIds && allowedMachineIds.length > 0
    ? machines.filter(m => allowedMachineIds.includes(m.id))
    : machines;

  const handleComplete = async () => {
    try {
      const selectedMachine = machines.find(m => m.id === formData.machineId);

      const event = {
        id: `E${Date.now()}`,
        machineId: formData.machineId,
        machineName: selectedMachine?.name || '',
        type: formData.eventType as import('../../types/green-room').Event['type'],
        description: formData.description,
        timestamp: new Date(formData.startTime).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ''),
      };

      await api.createEvent(event);

      toast.success('Event logged successfully', {
        description: `${formData.eventType} event has been logged for ${selectedMachine?.name}`,
        action: {
          label: 'View',
          onClick: () => console.log('Navigate to event', event.id), // Placeholder for navigation
        },
      });

      // Reset form
      setFormData({
        machineId: '',
        eventType: '',
        severity: 'medium',
        startTime: '',
        endTime: '',
        description: '',
        rootCause: '',
        resolutionNotes: '',
        reporter: '',
        resolvedBy: '',
        status: 'open',
        linkedECO: '',
        linkedWorkOrder: '',
        linkedComponents: [],
        linkedRCA: '',
        unitsAffected: '',
        scrapCount: '',
        downtime: '',
      });
      setEvidenceFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error logging event:', error);
      toast.error('Failed to log event');
    }
  };

  const steps = [
    {
      id: 'triage',
      title: 'Triage',
      component: (
        <Step1Triage
          formData={formData}
          setFormData={setFormData}
          machines={machines}
          filteredMachines={filteredMachines}
        />
      ),
      validation: () => !!formData.machineId && !!formData.eventType
    },
    {
      id: 'details',
      title: 'Details',
      component: (
        <Step2Details
          formData={formData}
          setFormData={setFormData}
          machines={machines}
          filteredMachines={filteredMachines}
        />
      ),
      validation: () => !!formData.startTime && !!formData.description
    },
    {
      id: 'impact',
      title: 'Impact',
      component: (
        <Step3Impact
          formData={formData}
          setFormData={setFormData}
          evidenceFiles={evidenceFiles}
          setEvidenceFiles={setEvidenceFiles}
          ecos={ecos}
          workOrders={workOrders}
          components={components}
          machines={machines}
          filteredMachines={filteredMachines}
        />
      )
    },
    {
      id: 'review',
      title: 'Review',
      component: (
        <Step4Review
          formData={formData}
          setFormData={setFormData}
          evidenceFiles={evidenceFiles}
          machines={machines}
          filteredMachines={filteredMachines}
        />
      )
    }
  ];

  return (
    <WizardDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Log Machine Event"
      steps={steps}
      onComplete={handleComplete}
    />
  );
}

