import { useState, useEffect } from 'react';
import { Machine, ECO, Component, WorkOrder } from '../../types/green-room';
import * as mock from '../../data/mock-data';
import * as api from '../../utils/api';
import { toast } from 'sonner';
import { WizardDialog, WizardStep } from '../ui/wizard-dialog';
import { WorkOrderFormData } from './work-order/types';
import { Step1Triage } from './work-order/Step1Triage';
import { Step2Details } from './work-order/Step2Details';
import { Step3Resources } from './work-order/Step3Resources';
import { Step4Review } from './work-order/Step4Review';

interface CreateWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledECO?: ECO | null;
  prefilledMachine?: Machine | null;
  onWorkOrderCreated?: (workOrder: WorkOrder) => void;
  allowedMachineIds?: string[];
}

export function CreateWorkOrderDialog({
  open,
  onOpenChange,
  prefilledECO,
  prefilledMachine,
  onWorkOrderCreated,
  allowedMachineIds
}: CreateWorkOrderDialogProps) {

  const initialFormData: WorkOrderFormData = {
    machineId: '',
    type: '',
    priority: 'medium',
    title: '',
    description: '',
    assignedTo: '',
    requestedBy: '',
    createdBy: '',
    dueDate: '',
    estimatedHours: '',
    linkedECO: '',
    linkedEvent: '',
    linkedComponents: [],
    linkedRCA: '',
    tasks: [],
    parts: []
  };

  const [formData, setFormData] = useState<WorkOrderFormData>(initialFormData);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [ecos, setECOs] = useState<ECO[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const [machinesData, ecosData, componentsData] = await Promise.all([
          api.getMachines(),
          api.getECOs(),
          api.getComponents(),
        ]);
        setMachines((machinesData && machinesData.length > 0) ? machinesData : mock.machines);
        setECOs((ecosData && ecosData.length > 0) ? ecosData : mock.ecos);
        setComponents((componentsData && componentsData.length > 0) ? componentsData : mock.components);
      } catch (error) {
        console.error('Error loading data:', error);
        setMachines(mock.machines);
        setECOs(mock.ecos);
        setComponents(mock.components);
      }
    }

    if (open) {
      loadData();
    }
  }, [open]);

  // Prefill Logic
  useEffect(() => {
    if (open) {
      if (prefilledECO) {
        setFormData(prev => ({
          ...prev,
          machineId: prefilledECO.machineId,
          type: 'PM',
          title: `Implementation: ${prefilledECO.title}`,
          description: `Implement ECO ${prefilledECO.number}: ${prefilledECO.description}`,
          linkedECO: prefilledECO.id,
          requestedBy: 'ECO System',
          priority: prefilledECO.reason === 'safety' ? 'critical' : 'high',
          linkedComponents: prefilledECO.impactedComponents || [],
          parts: prefilledECO.partsAssociated?.map((p, i) => ({
            id: `eco-part-${i}`,
            partNumber: p.partNumber,
            qty: p.qty,
            lot: ''
          })) || []
        }));
      } else if (prefilledMachine) {
        setFormData(prev => ({
          ...prev,
          machineId: prefilledMachine.id,
          title: `Work Order for ${prefilledMachine.name}`,
          description: `Maintenance work order for ${prefilledMachine.name} (${prefilledMachine.type})`
        }));
      } else {
        setFormData(initialFormData);
      }
    }
  }, [open, prefilledECO, prefilledMachine]);

  const filteredMachines = allowedMachineIds && allowedMachineIds.length > 0
    ? machines.filter(m => allowedMachineIds.includes(m.id))
    : machines;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selectedMachine = machines.find(m => m.id === formData.machineId);
      const woNumber = `WO-${Date.now().toString().slice(-6)}`;

      const newWorkOrder: WorkOrder = {
        id: woNumber,
        number: woNumber,
        title: formData.title,
        machineId: formData.machineId,
        machineName: selectedMachine?.name || '',
        type: formData.type as any,
        priority: formData.priority,
        status: 'open',
        description: formData.description,
        requestedBy: formData.requestedBy,
        assignee: formData.assignedTo,
        dueDate: formData.dueDate,
        linkedEventId: formData.linkedECO || formData.linkedEvent || undefined,
        linkedComponentId: formData.linkedComponents[0] || undefined,
        tasks: formData.tasks.map(t => ({
          description: t.description,
          status: t.status,
          notes: t.notes
        })),
        partsUsed: formData.parts.map(p => ({
          partNumber: p.partNumber,
          qty: p.qty,
          lot: p.lot
        })),
        laborHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        rcaId: formData.linkedRCA || undefined,
      };

      await api.createWorkOrder(newWorkOrder);

      if (onWorkOrderCreated) {
        onWorkOrderCreated(newWorkOrder);
      }

      toast.success('Work order created successfully', {
        description: `${woNumber}: ${formData.title}`,
        action: {
          label: 'View',
          onClick: () => console.log('Navigate to work order', woNumber), // Placeholder for navigation
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating work order:', error);
      toast.error('Failed to create work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: WizardStep[] = [
    {
      id: 'triage',
      title: 'Triage & Context',
      description: 'Select machine and classify the work',
      component: (
        <Step1Triage
          formData={formData}
          setFormData={setFormData}
          filteredMachines={filteredMachines}
          machines={machines}
          ecos={ecos}
          components={components}
        />
      ),
      validation: () => {
        if (!formData.machineId) {
          toast.error('Please select a machine');
          return false;
        }
        if (!formData.type) {
          toast.error('Please select a work order type');
          return false;
        }
        return true;
      }
    },
    {
      id: 'details',
      title: 'Details & Schedule',
      description: 'Define the work scope and assignment',
      component: (
        <Step2Details
          formData={formData}
          setFormData={setFormData}
          filteredMachines={filteredMachines}
          machines={machines}
          ecos={ecos}
          components={components}
        />
      ),
      validation: () => {
        if (!formData.title.trim()) {
          toast.error('Please enter a title');
          return false;
        }
        if (!formData.dueDate) {
          toast.error('Please select a due date');
          return false;
        }
        return true;
      }
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'Add tasks, parts, and linked items',
      component: (
        <Step3Resources
          formData={formData}
          setFormData={setFormData}
          ecos={ecos}
          components={components}
          filteredMachines={filteredMachines}
          machines={machines}
        />
      )
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Verify information before submission',
      component: (
        <Step4Review
          formData={formData}
          filteredMachines={filteredMachines}
          setFormData={setFormData}
          machines={machines}
          ecos={ecos}
          components={components}
        />
      )
    }
  ];

  return (
    <WizardDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Work Order"
      steps={steps}
      onComplete={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}