import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card } from '../ui/card';
import { Machine, ECO, Component, WorkOrder } from '../../types/green-room';
import * as mock from '../../data/mock-data';
import * as api from '../../utils/api';
import { ClipboardList, X, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledECO?: ECO | null;
  prefilledMachine?: Machine | null;
  onWorkOrderCreated?: (workOrder: WorkOrder) => void;
  // When provided, restrict selectable machines to these IDs (e.g., production context)
  allowedMachineIds?: string[];
}

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'pass' | 'fail';
  notes: string;
}

interface Part {
  id: string;
  partNumber: string;
  qty: number;
  lot: string;
}

export function CreateWorkOrderDialog({ open, onOpenChange, prefilledECO, prefilledMachine, onWorkOrderCreated, allowedMachineIds }: CreateWorkOrderDialogProps) {
  const [formData, setFormData] = useState({
    machineId: '',
    type: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    title: '',
    description: '',
    assignedTo: '',
    requestedBy: '',
    createdBy: '',
    dueDate: '',
    estimatedHours: '',
    linkedECO: '',
    linkedEvent: '',
    linkedComponents: [] as string[],
    linkedRCA: '',
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState('');
  
  const [parts, setParts] = useState<Part[]>([]);
  const [partInput, setPartInput] = useState({ partNumber: '', qty: '', lot: '' });
  const [machines, setMachines] = useState<Machine[]>([]);
  const [ecos, setECOs] = useState<ECO[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [, setLoading] = useState(false);

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

  const filteredMachines = allowedMachineIds && allowedMachineIds.length > 0
    ? machines.filter(m => allowedMachineIds.includes(m.id))
    : machines;

  const selectedMachine = filteredMachines.find(m => m.id === formData.machineId);
  const machineECOs = ecos.filter(e => e.machineId === formData.machineId);
  const machineComponents = components.filter(c => c.machineId === formData.machineId);

  // Pre-fill form when ECO is provided
  useEffect(() => {
    if (prefilledECO && open) {
      setFormData(prev => ({
        ...prev,
        machineId: prefilledECO.machineId,
        type: 'PM', // Default to PM for ECO implementation
        title: `Implementation: ${prefilledECO.title}`,
        description: `Implement ECO ${prefilledECO.number}: ${prefilledECO.description}`,
        linkedECO: prefilledECO.id,
        requestedBy: 'ECO System',
        priority: prefilledECO.reason === 'safety' ? 'critical' : 'high',
      }));
      
      // Pre-fill parts if ECO has associated parts
      if (prefilledECO.partsAssociated && prefilledECO.partsAssociated.length > 0) {
        setParts(prefilledECO.partsAssociated.map((part, idx) => ({
          id: `eco-part-${idx}`,
          partNumber: part.partNumber,
          qty: part.qty,
          lot: ''
        })));
      }

      // Pre-fill components if ECO has impacted components
      if (prefilledECO.impactedComponents && prefilledECO.impactedComponents.length > 0) {
        setFormData(prev => ({
          ...prev,
          linkedComponents: prefilledECO.impactedComponents || []
        }));
      }
    }
  }, [prefilledECO, open]);

  // Handle prefilled machine
  useEffect(() => {
    console.log('Prefill effect triggered:', { 
      prefilledMachine: prefilledMachine?.id, 
      open, 
      machinesCount: machines.length 
    });
    
    if (prefilledMachine && open && machines.length > 0) {
      // Ensure the machine exists in the loaded machines list
      const machineExists = machines.find(m => m.id === prefilledMachine.id);
      console.log('Machine exists in list:', machineExists?.id);
      
      if (machineExists) {
        console.log('Setting form data with machine:', prefilledMachine.id);
        setFormData(prev => ({
          ...prev,
          machineId: prefilledMachine.id,
          title: `Work Order for ${prefilledMachine.name}`,
          description: `Maintenance work order for ${prefilledMachine.name} (${prefilledMachine.type})`,
        }));
      }
    }
  }, [prefilledMachine, open, machines]);

  // Ensure selected machine stays within allowed set
  useEffect(() => {
    if (!open) return;
    if (allowedMachineIds && formData.machineId && !allowedMachineIds.includes(formData.machineId)) {
      setFormData(prev => ({ ...prev, machineId: '' }));
    }
  }, [open, allowedMachineIds, formData.machineId]);

  const addTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, {
        id: Date.now().toString(),
        description: taskInput.trim(),
        status: 'pending',
        notes: ''
      }]);
      setTaskInput('');
    }
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addPart = () => {
    if (partInput.partNumber.trim() && partInput.qty) {
      setParts([...parts, {
        id: Date.now().toString(),
        partNumber: partInput.partNumber.trim(),
        qty: parseInt(partInput.qty),
        lot: partInput.lot.trim()
      }]);
      setPartInput({ partNumber: '', qty: '', lot: '' });
    }
  };

  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const toggleComponent = (componentId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedComponents: prev.linkedComponents.includes(componentId)
        ? prev.linkedComponents.filter(id => id !== componentId)
        : [...prev.linkedComponents, componentId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.machineId) {
      toast.error('Please select a machine');
      return;
    }
    if (!formData.type) {
      toast.error('Please select a work order type');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a work order title');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    // Generate work order number
    const woNumber = `WO-${Date.now().toString().slice(-6)}`;

    // Create the work order object
    const newWorkOrder: WorkOrder = {
      id: woNumber,
      number: woNumber, // Added 'number' property
      title: formData.title, // Added 'title' property
      machineId: formData.machineId,
      machineName: selectedMachine?.name || '',
      type: formData.type as 'PM' | 'CM' | 'Calibration' | 'Emergency',
      priority: formData.priority,
      status: 'open',
      description: formData.description,
      requestedBy: formData.requestedBy,
      assignee: formData.assignedTo,
      dueDate: formData.dueDate,
      linkedEventId: formData.linkedECO || formData.linkedEvent || undefined,
      linkedComponentId: formData.linkedComponents[0] || undefined,
      tasks: tasks.map(t => ({
        description: t.description,
        status: t.status,
        notes: t.notes
      })),
      partsUsed: parts.map(p => ({
        partNumber: p.partNumber,
        qty: p.qty,
        lot: p.lot
      })),
      laborHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      rcaId: formData.linkedRCA || undefined,
    };

    setLoading(true);
    
    try {
      await api.createWorkOrder(newWorkOrder);

      // Call the callback to add the work order to the app state
      if (onWorkOrderCreated) {
        onWorkOrderCreated(newWorkOrder);
      }

      toast.success('Work order created successfully', {
        description: `${woNumber}: ${formData.title} has been created for ${selectedMachine?.name}`,
      });

      handleClose();
    } catch (error) {
      console.error('Error creating work order:', error);
      toast.error('Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
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
    });
    setTasks([]);
    setParts([]);
    setTaskInput('');
    setPartInput({ partNumber: '', qty: '', lot: '' });
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>
            Create a new work order with tasks, parts, and relationships
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] space-y-3">

        {prefilledECO && (
          <Card className="p-4 bg-muted border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h4 className="text-foreground">ECO Implementation Work Order</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This work order is pre-filled from ECO {prefilledECO.number}: {prefilledECO.title}
                </p>
              </div>
            </div>
          </Card>
        )}

        <form id="create-work-order-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Information Message */}
          <Card className="p-3 bg-muted border-border">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Work Order Creation Guide</p>
                <p className="text-xs text-muted-foreground">
                  Select a machine first to see available ECO, Event, and Component associations for this work order
                </p>
              </div>
            </div>
          </Card>

          {/* Machine Selection */}
          <div className="space-y-2">
            <Label htmlFor="machine">Machine *</Label>
            <Select 
              value={formData.machineId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, machineId: value }))}
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

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Work Order Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventive Maintenance">Preventive Maintenance</SelectItem>
                  <SelectItem value="Corrective Maintenance">Corrective Maintenance</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Calibration">Calibration</SelectItem>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Upgrade">Upgrade</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                      High
                    </span>
                  </SelectItem>
                  <SelectItem value="critical">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Critical
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Title & Description */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of the work order..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of work to be performed..."
              rows={4}
            />
          </div>

          <Separator />

          {/* Assignment & Scheduling */}
          <div className="space-y-4">
            <h4>Assignment & Scheduling</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Technician name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input
                  id="requestedBy"
                  value={formData.requestedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                  placeholder="Requester name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdBy">Created By</Label>
                <Input
                  id="createdBy"
                  value={formData.createdBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tasks */}
          <div className="space-y-4">
            <h4>Tasks</h4>
            <div className="flex gap-2">
              <Input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Add a task..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTask}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            {tasks.length > 0 && (
              <Card className="p-3">
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{index + 1}.</span>
                        <span className="text-sm">{task.description}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">No tasks added yet</p>
            )}
          </div>

          <Separator />

          {/* Parts */}
          <div className="space-y-4">
            <h4>Parts Required</h4>
            <div className="grid grid-cols-12 gap-2">
              <Input
                className="col-span-5"
                value={partInput.partNumber}
                onChange={(e) => setPartInput(prev => ({ ...prev, partNumber: e.target.value }))}
                placeholder="Part number..."
              />
              <Input
                className="col-span-2"
                type="number"
                value={partInput.qty}
                onChange={(e) => setPartInput(prev => ({ ...prev, qty: e.target.value }))}
                placeholder="Qty"
              />
              <Input
                className="col-span-3"
                value={partInput.lot}
                onChange={(e) => setPartInput(prev => ({ ...prev, lot: e.target.value }))}
                placeholder="Lot (optional)"
              />
              <Button type="button" variant="outline" onClick={addPart} className="col-span-2">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            {parts.length > 0 && (
              <Card className="p-3">
                <div className="space-y-2">
                  {parts.map(part => (
                    <div key={part.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{part.partNumber}</Badge>
                        <span className="text-sm">Qty: {part.qty}</span>
                        {part.lot && (
                          <span className="text-sm text-muted-foreground">Lot: {part.lot}</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePart(part.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {parts.length === 0 && (
              <p className="text-sm text-muted-foreground">No parts added yet</p>
            )}
          </div>

          <Separator />

          {/* Relationships */}
          {formData.machineId && (
            <div className="space-y-4">
              <h4>Relationships (Optional)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Linked ECO */}
                {machineECOs.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="linkedECO">Linked ECO</Label>
                    <Select 
                      value={formData.linkedECO} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, linkedECO: value }))}
                    >
                      <SelectTrigger id="linkedECO">
                        <SelectValue placeholder="Select ECO..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {machineECOs.map(eco => (
                          <SelectItem key={eco.id} value={eco.id}>
                            {eco.number} - {eco.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Linked Event */}
                <div className="space-y-2">
                  <Label htmlFor="linkedEvent">Linked Event</Label>
                  <Input
                    id="linkedEvent"
                    value={formData.linkedEvent}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedEvent: e.target.value }))}
                    placeholder="Event ID or reference..."
                  />
                </div>

                {/* Linked RCA */}
                <div className="space-y-2">
                  <Label htmlFor="linkedRCA">Linked RCA</Label>
                  <Input
                    id="linkedRCA"
                    value={formData.linkedRCA}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedRCA: e.target.value }))}
                    placeholder="RCA ID or reference..."
                  />
                </div>
              </div>

              {/* Linked Components */}
              {machineComponents.length > 0 && (
                <div className="space-y-2">
                  <Label>Linked Components</Label>
                  <Card className="p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {machineComponents.slice(0, 10).map(component => (
                        <label 
                          key={component.id} 
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.linkedComponents.includes(component.id)}
                            onChange={() => toggleComponent(component.id)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm">{component.name}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {component.partNumber}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </Card>
                  {formData.linkedComponents.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.linkedComponents.length} component(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

        </form>
  </div>

  {/* Static Footer */}
  <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-work-order-form">
            <ClipboardList className="w-4 h-4 mr-2" />
            Create Work Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}