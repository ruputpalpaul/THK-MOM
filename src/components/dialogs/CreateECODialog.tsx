import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Machine } from '../../types/green-room';
import * as mock from '../../data/mock-data';
import * as api from '../../utils/api';
import { GitBranch, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ModSheetForm } from '@/components/eco/ModSheetForm';
import type { ModSheet } from '@/types/green-room';

interface CreateECODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledMachine?: Machine | null;
  // When provided, restrict selectable machines to these IDs (e.g., production context)
  allowedMachineIds?: string[];
}

export function CreateECODialog({ open, onOpenChange, prefilledMachine, allowedMachineIds }: CreateECODialogProps) {
  const [formData, setFormData] = useState({
    machineId: prefilledMachine?.id || '',
    number: '',
    title: '',
    type: '' as 'Software' | 'Hardware' | 'Process' | 'Documentation' | '',
    description: '',
    reason: '' as 'safety' | 'quality' | 'cost' | 'capacity' | '',
    requestedBy: '',
    effectiveFrom: '',
    rollbackPlan: '',
  });
  const [modSheet, setModSheet] = useState<ModSheet>({
    request: {},
    engineering: {
      mechanical: {},
      electrical: {},
    },
    approvals: {},
  });

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMachines() {
      try {
  const machinesData = await api.getMachines();
  setMachines((machinesData && machinesData.length > 0) ? machinesData : mock.machines);
      } catch (error) {
        console.error('Error loading machines:', error);
  setMachines(mock.machines);
      }
    }
    
    if (open) {
      loadMachines();
    }
  }, [open]);

  // Update form when prefilled machine changes
  useEffect(() => {
    if (open && prefilledMachine) {
      setFormData(prev => ({ ...prev, machineId: prefilledMachine.id }));
    }
  }, [open, prefilledMachine]);

  const filteredMachines = allowedMachineIds && allowedMachineIds.length > 0
    ? machines.filter(m => allowedMachineIds.includes(m.id))
    : machines;

  const selectedMachine = filteredMachines.find(m => m.id === formData.machineId);

  useEffect(() => {
    if (!selectedMachine) return;
    setModSheet(prev => ({
      ...prev,
      request: {
        ...prev.request,
        machineName: selectedMachine.name,
        machineNumber: selectedMachine.id,
      },
    }));
  }, [selectedMachine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.machineId) {
      toast.error('Please select a machine');
      return;
    }
    if (!formData.number.trim()) {
      toast.error('Please enter an ECO number');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter an ECO title');
      return;
    }
    if (!formData.type) {
      toast.error('Please select an ECO type');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter an ECO description');
      return;
    }
    if (!formData.reason) {
      toast.error('Please select a reason');
      return;
    }

    setLoading(true);
    
    try {
      const eco = {
        id: `ECO-${Date.now()}`,
        machineId: formData.machineId,
        machineName: selectedMachine?.name || '',
        number: formData.number,
        title: formData.title,
  type: formData.type as import('../../types/green-room').ECO['type'],
        status: 'draft' as const,
        description: formData.description,
  reason: formData.reason as import('../../types/green-room').ECO['reason'],
        requestedBy: formData.requestedBy,
        effectiveFrom: formData.effectiveFrom,
        rollbackPlan: formData.rollbackPlan,
        date: new Date().toISOString().split('T')[0],
        modSheet,
      };

      await api.createECO(eco);

      toast.success('ECO created successfully', {
        description: `${formData.number} - ${formData.title} has been created for ${selectedMachine?.name}`,
      });

      handleClose();
    } catch (error) {
      console.error('Error creating ECO:', error);
      toast.error('Failed to create ECO');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      machineId: prefilledMachine?.id || '',
      number: '',
      title: '',
      type: '',
      description: '',
      reason: '',
      requestedBy: '',
      effectiveFrom: '',
      rollbackPlan: '',
    });
    setModSheet({
      request: {},
      engineering: {
        mechanical: {},
        electrical: {},
      },
      approvals: {},
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Create ECO</DialogTitle>
          <DialogDescription>
            Create a new Engineering Change Order and associate it with a machine
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          <form id="create-eco-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Information Message */}
          <Card className="p-3 bg-muted border-border">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">ECO Creation Guide</p>
                <p className="text-xs text-muted-foreground">
                  Engineering Change Orders track modifications to machines, processes, or documentation
                </p>
              </div>
            </div>
          </Card>

          {/* Machine Selection */}
          <div className="space-y-2">
            <Label htmlFor="machine">Machine *</Label>
            <Select 
              value={formData.machineId} 
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, machineId: value }))}
            >
              <SelectTrigger id="machine">
                <SelectValue placeholder="Select a machine..." />
              </SelectTrigger>
              <SelectContent>
                {filteredMachines.map(machine => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name} - {machine.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ECO Number and Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">ECO Number *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="e.g., ECO-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title of the change"
              />
            </div>
          </div>

          {/* Type and Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'Software' | 'Hardware' | 'Process' | 'Documentation') => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select ECO type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Process">Process</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value: 'safety' | 'quality' | 'cost' | 'capacity') => setFormData(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="capacity">Capacity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the change..."
              rows={4}
            />
          </div>

          {/* Requested By */}
          <div className="space-y-2">
            <Label htmlFor="requestedBy">Requested By</Label>
            <Input
              id="requestedBy"
              value={formData.requestedBy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          {/* Effective From */}
          <div className="space-y-2">
            <Label htmlFor="effectiveFrom">Effective From</Label>
            <Input
              id="effectiveFrom"
              type="date"
              value={formData.effectiveFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
            />
          </div>

          {/* Rollback Plan */}
          <div className="space-y-2">
            <Label htmlFor="rollbackPlan">Rollback Plan</Label>
          <Textarea
              id="rollbackPlan"
              value={formData.rollbackPlan}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, rollbackPlan: e.target.value }))}
              placeholder="Plan for reverting this change if needed..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">Mod Sheet Details</h3>
            <p className="text-xs text-muted-foreground">
              Complete the digital mod sheet to capture mechanical and electrical work requirements.
            </p>
            <ModSheetForm value={modSheet} onChange={setModSheet} />
          </div>

          </form>
        </div>

        {/* Static Footer */}
        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-eco-form" disabled={loading}>
            <GitBranch className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create ECO'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
