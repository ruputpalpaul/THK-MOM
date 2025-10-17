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
import { Machine, ECO, WorkOrder, Component } from '../../types/green-room';
import * as mock from '../../data/mock-data';
import * as api from '../../utils/api';
import { AlertCircle, X, Clock, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface LogEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // When provided, restrict selectable machines to these IDs (e.g., production context)
  allowedMachineIds?: string[];
}

export function LogEventDialog({ open, onOpenChange, allowedMachineIds }: LogEventDialogProps) {
  const [formData, setFormData] = useState({
    machineId: '',
    eventType: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    startTime: '',
    endTime: '',
    description: '',
    rootCause: '',
    resolutionNotes: '',
    reporter: '',
    resolvedBy: '',
    status: 'open' as 'open' | 'in-progress' | 'resolved',
    linkedECO: '',
    linkedWorkOrder: '',
    linkedComponents: [] as string[],
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
  const [loading, setLoading] = useState(false);

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

  const selectedMachine = filteredMachines.find(m => m.id === formData.machineId);
  const machineECOs = ecos.filter(e => e.machineId === formData.machineId);
  const machineWorkOrders = workOrders.filter(wo => wo.machineId === formData.machineId);
  const machineComponents = components.filter(c => c.machineId === formData.machineId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleComponent = (componentId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedComponents: prev.linkedComponents.includes(componentId)
        ? prev.linkedComponents.filter(id => id !== componentId)
        : [...prev.linkedComponents, componentId]
    }));
  };

  // Calculate duration when both times are set
  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return `${hours}h ${minutes}m`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.machineId) {
      toast.error('Please select a machine');
      return;
    }
    if (!formData.eventType) {
      toast.error('Please select an event type');
      return;
    }
    if (!formData.startTime) {
      toast.error('Please enter a start time');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter an event description');
      return;
    }

    setLoading(true);
    
    try {
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
      });

      handleClose();
    } catch (error) {
      console.error('Error logging event:', error);
      toast.error('Failed to log event');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
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
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Log Event</DialogTitle>
          <DialogDescription>
            Record a machine event with details and associate it with related entities
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          <form id="log-event-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Information Message */}
          <Card className="p-3 bg-muted border-border">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Event Logging Guide</p>
                <p className="text-xs text-muted-foreground">
                  Select a machine first to see available ECO, Work Order, and Component associations for this event
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

          {/* Event Type & Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select event type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Downtime">Downtime</SelectItem>
                  <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                  <SelectItem value="Safety Incident">Safety Incident</SelectItem>
                  <SelectItem value="Alarm">Alarm</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Production Milestone">Production Milestone</SelectItem>
                  <SelectItem value="Calibration">Calibration</SelectItem>
                  <SelectItem value="Component Failure">Component Failure</SelectItem>
                  <SelectItem value="Process Deviation">Process Deviation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger id="severity">
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

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'open' | 'in-progress' | 'resolved') => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Time Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  {calculateDuration() || 'Auto-calculated'}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of what happened..."
              rows={4}
            />
          </div>

          {/* Root Cause & Resolution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rootCause">Root Cause</Label>
              <Textarea
                id="rootCause"
                value={formData.rootCause}
                onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                placeholder="Identified root cause..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                id="resolutionNotes"
                value={formData.resolutionNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                placeholder="How was this resolved..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Impact Metrics */}
          <div className="space-y-4">
            <h4>Impact Metrics (Optional)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitsAffected">Units Affected</Label>
                <Input
                  id="unitsAffected"
                  type="number"
                  value={formData.unitsAffected}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitsAffected: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scrapCount">Scrap Count</Label>
                <Input
                  id="scrapCount"
                  type="number"
                  value={formData.scrapCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, scrapCount: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downtime">Downtime (minutes)</Label>
                <Input
                  id="downtime"
                  type="number"
                  value={formData.downtime}
                  onChange={(e) => setFormData(prev => ({ ...prev, downtime: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Personnel */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporter">Reported By</Label>
              <Input
                id="reporter"
                value={formData.reporter}
                onChange={(e) => setFormData(prev => ({ ...prev, reporter: e.target.value }))}
                placeholder="Your name"
              />
            </div>

            {formData.status === 'resolved' && (
              <div className="space-y-2">
                <Label htmlFor="resolvedBy">Resolved By</Label>
                <Input
                  id="resolvedBy"
                  value={formData.resolvedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolvedBy: e.target.value }))}
                  placeholder="Resolver name"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Evidence/Attachments */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence/Attachments</Label>
            <Input
              id="evidence"
              type="file"
              onChange={handleFileChange}
              multiple
              className="cursor-pointer"
            />
            {evidenceFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {evidenceFiles.map((file, index) => (
                  <Card key={index} className="p-3 flex items-center justify-between bg-muted">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
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

                {/* Linked Work Order */}
                {machineWorkOrders.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="linkedWorkOrder">Linked Work Order</Label>
                    <Select 
                      value={formData.linkedWorkOrder} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, linkedWorkOrder: value }))}
                    >
                      <SelectTrigger id="linkedWorkOrder">
                        <SelectValue placeholder="Select WO..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {machineWorkOrders.map(wo => (
                          <SelectItem key={wo.id} value={wo.id}>
                            {wo.id} - {wo.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
          <Button type="submit" form="log-event-form" disabled={loading}>
            <AlertCircle className="w-4 h-4 mr-2" />
            {loading ? 'Logging...' : 'Log Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

