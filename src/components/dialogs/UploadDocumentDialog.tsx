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
import { Machine, ECO, Component } from '../../types/green-room';
import * as mock from '../../data/mock-data';
import * as api from '../../utils/api';
import { FileUp, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledMachineId?: string;
  prefilledType?: 'Program Backup' | 'Operator Manual' | 'Drawings';
  // When provided, restrict selectable machines to these IDs (e.g., production context)
  allowedMachineIds?: string[];
}

export function UploadDocumentDialog({ open, onOpenChange, prefilledMachineId, prefilledType, allowedMachineIds }: UploadDocumentDialogProps) {
  const [formData, setFormData] = useState({
    machineId: prefilledMachineId || '',
    type: prefilledType || '',
    name: '',
    version: '',
    revision: '',
    controller: '',
    notes: '',
    createdBy: '',
    approvedBy: '',
    releaseState: 'draft' as 'draft' | 'approved',
    effectiveFrom: '',
    supersedes: '',
    linkedECO: '',
    linkedComponents: [] as string[],
    partNumbers: [] as string[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [partNumberInput, setPartNumberInput] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [ecos, setECOs] = useState<ECO[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [machinesData, ecosData, componentsData] = await Promise.all([
          api.getMachines(),
          api.getECOs(),
          api.getComponents(),
        ]);
  // Fallback to mock data when API returns empty arrays
  setMachines((machinesData && machinesData.length > 0) ? machinesData : mock.machines);
  setECOs((ecosData && ecosData.length > 0) ? ecosData : mock.ecos);
  setComponents((componentsData && componentsData.length > 0) ? componentsData : mock.components);
      } catch (error) {
        console.error('Error loading data:', error);
  // Use local mock data on error
  setMachines(mock.machines);
  setECOs(mock.ecos);
  setComponents(mock.components);
      }
    }
    
    if (open) {
      loadData();
    }
  }, [open]);

  // Filter machines by context if provided
  const filteredMachines = allowedMachineIds && allowedMachineIds.length > 0
    ? machines.filter(m => allowedMachineIds.includes(m.id))
    : machines;

  const selectedMachine = filteredMachines.find(m => m.id === formData.machineId);
  const machineECOs = ecos.filter(e => e.machineId === formData.machineId);
  const machineComponents = components.filter(c => c.machineId === formData.machineId);

  // Update form when prefilled values change (e.g., when opening from backup dialog)
  useEffect(() => {
    if (open && prefilledMachineId) {
      setFormData(prev => ({ ...prev, machineId: prefilledMachineId }));
    }
    if (open && prefilledType) {
      setFormData(prev => ({ ...prev, type: prefilledType }));
    }
  }, [open, prefilledMachineId, prefilledType]);

  // Ensure selected machine stays within allowed set
  useEffect(() => {
    if (!open) return;
    if (allowedMachineIds && formData.machineId && !allowedMachineIds.includes(formData.machineId)) {
      setFormData(prev => ({ ...prev, machineId: '' }));
    }
  }, [open, allowedMachineIds, formData.machineId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate name if empty
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name }));
      }
    }
  };

  const addPartNumber = () => {
    if (partNumberInput.trim() && !formData.partNumbers.includes(partNumberInput.trim())) {
      setFormData(prev => ({
        ...prev,
        partNumbers: [...prev.partNumbers, partNumberInput.trim()]
      }));
      setPartNumberInput('');
    }
  };

  const removePartNumber = (partNumber: string) => {
    setFormData(prev => ({
      ...prev,
      partNumbers: prev.partNumbers.filter(pn => pn !== partNumber)
    }));
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
      toast.error('Please select a document type');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);
    
    try {
      // Create document record
      const document = {
        id: `DOC-${Date.now()}`,
        machineId: formData.machineId,
        machineName: selectedMachine?.name || '',
        type: formData.type as import('../../types/green-room').Document['type'],
        name: formData.name,
        uploadDate: new Date().toISOString().split('T')[0],
        fileUrl: `file://${selectedFile.name}`, // In a real app, upload to storage
        version: formData.version,
        controller: formData.controller,
        createdBy: formData.createdBy,
        supersedes: formData.supersedes,
        releaseState: formData.releaseState,
        notes: formData.notes,
        revision: formData.revision,
        partNumbers: formData.partNumbers,
        approvedBy: formData.approvedBy,
        effectiveFrom: formData.effectiveFrom,
        linkedECO: formData.linkedECO,
        linkedComponents: formData.linkedComponents,
      };

      await api.createDocument(document);

      toast.success('Document uploaded successfully', {
        description: `${formData.name} has been uploaded to ${selectedMachine?.name}`,
      });

      handleClose();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      machineId: '',
      type: '',
      name: '',
      version: '',
      revision: '',
      controller: '',
      notes: '',
      createdBy: '',
      approvedBy: '',
      releaseState: 'draft',
      effectiveFrom: '',
      supersedes: '',
      linkedECO: '',
      linkedComponents: [],
      partNumbers: [],
    });
    setSelectedFile(null);
    setPartNumberInput('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document and associate it with a machine and related entities
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          <form id="upload-document-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Information Message */}
          <Card className="p-3 bg-muted border-border">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Document Upload Guide</p>
                <p className="text-xs text-muted-foreground">
                  Select a machine first to see available ECO and component associations for this document
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

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Document Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Program Backup">Program Backup</SelectItem>
                <SelectItem value="Operator Manual">Operator Manual</SelectItem>
                <SelectItem value="Drawings">Drawings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {selectedFile && (
              <Card className="p-3 flex items-center justify-between bg-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            )}
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Auto-populated from filename..."
            />
          </div>

          <Separator />

          {/* Type-specific fields */}
          <div className="grid grid-cols-2 gap-4">
            {formData.type === 'Program Backup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., v2.3.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="controller">Controller</Label>
                  <Input
                    id="controller"
                    value={formData.controller}
                    onChange={(e) => setFormData(prev => ({ ...prev, controller: e.target.value }))}
                    placeholder="e.g., GXWorks3"
                  />
                </div>
              </>
            )}

            {formData.type === 'Drawings' && (
              <div className="space-y-2">
                <Label htmlFor="revision">Revision</Label>
                <Input
                  id="revision"
                  value={formData.revision}
                  onChange={(e) => setFormData(prev => ({ ...prev, revision: e.target.value }))}
                  placeholder="e.g., Rev C"
                />
              </div>
            )}

            {formData.type === 'Operator Manual' && (
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="e.g., v3.2"
                />
              </div>
            )}

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

          <Separator />

          {/* Approval & Release */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="releaseState">Release State</Label>
              <Select 
                value={formData.releaseState} 
                onValueChange={(value: 'draft' | 'approved') => setFormData(prev => ({ ...prev, releaseState: value }))}
              >
                <SelectTrigger id="releaseState">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.releaseState === 'approved' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="approvedBy">Approved By</Label>
                  <Input
                    id="approvedBy"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, approvedBy: e.target.value }))}
                    placeholder="Approver name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effectiveFrom">Effective From</Label>
                  <Input
                    id="effectiveFrom"
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          {/* Part Numbers */}
          {formData.type === 'Drawings' && (
            <div className="space-y-2">
              <Label>Associated Part Numbers</Label>
              <div className="flex gap-2">
                <Input
                  value={partNumberInput}
                  onChange={(e) => setPartNumberInput(e.target.value)}
                  placeholder="Enter part number..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPartNumber();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addPartNumber}>
                  Add
                </Button>
              </div>
              {formData.partNumbers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.partNumbers.map(pn => (
                    <Badge key={pn} variant="secondary" className="gap-1">
                      {pn}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removePartNumber(pn)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Supersedes */}
          {formData.type === 'Program Backup' && (
            <div className="space-y-2">
              <Label htmlFor="supersedes">Supersedes</Label>
              <Input
                id="supersedes"
                value={formData.supersedes}
                onChange={(e) => setFormData(prev => ({ ...prev, supersedes: e.target.value }))}
                placeholder="Previous document ID or version..."
              />
            </div>
          )}

          <Separator />

          {/* Relationships */}
          {formData.machineId && (
            <div className="space-y-4">
              <h4>Relationships (Optional)</h4>
              
              {/* Linked ECO */}
              {machineECOs.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="linkedECO">Linked ECO</Label>
                  <Select 
                    value={formData.linkedECO} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, linkedECO: value }))}
                  >
                    <SelectTrigger id="linkedECO">
                      <SelectValue placeholder="Select an ECO (optional)..." />
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this document..."
              rows={3}
            />
          </div>

          </form>
        </div>

        {/* Static Footer */}
        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="upload-document-form" disabled={loading}>
            <FileUp className="w-4 h-4 mr-2" />
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}