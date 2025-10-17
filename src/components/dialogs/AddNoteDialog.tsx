import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card } from '../ui/card';
// import { Switch } from '../ui/switch';
import { Switch } from '@radix-ui/react-switch';
import { machines, ecos, workOrders, components } from '../../data/mock-data';
import { FileText, X, AlertCircle, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // When provided, restrict selectable machines to these IDs (e.g., production context)
  allowedMachineIds?: string[];
}

export function AddNoteDialog({ open, onOpenChange, allowedMachineIds }: AddNoteDialogProps) {
  const [formData, setFormData] = useState({
    machineId: '',
    title: '',
    content: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    author: '',
    linkedECO: '',
    linkedWorkOrder: '',
    linkedComponents: [] as string[],
    linkedEvent: '',
    tags: [] as string[],
    isPrivate: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const filteredMachines = allowedMachineIds && allowedMachineIds.length > 0
    ? machines.filter(m => allowedMachineIds.includes(m.id))
    : machines;

  const selectedMachine = filteredMachines.find(m => m.id === formData.machineId);
  const machineECOs = ecos.filter(e => e.machineId === formData.machineId);
  const machineWorkOrders = workOrders.filter(wo => wo.machineId === formData.machineId);
  const machineComponents = components.filter(c => c.machineId === formData.machineId);

  // Ensure selected machine stays within allowed set when dialog opens or constraint changes
  if (open && allowedMachineIds && formData.machineId && !allowedMachineIds.includes(formData.machineId)) {
    // Reset invalid selection
    // Note: Avoid setState during render in strict mode loops; guard with microtask
    queueMicrotask(() => {
      setFormData(prev => ({ ...prev, machineId: '' }));
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.machineId) {
      toast.error('Please select a machine');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a note title');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please enter note content');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    // Simulate save
    console.log('Saving note:', {
      ...formData,
      attachments,
    });

    toast.success('Note added successfully', {
      description: `"${formData.title}" has been added to ${selectedMachine?.name}`,
    });

    // Reset form and close
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      machineId: '',
      title: '',
      content: '',
      category: '',
      priority: 'medium',
      author: '',
      linkedECO: '',
      linkedWorkOrder: '',
      linkedComponents: [],
      linkedEvent: '',
      tags: [],
      isPrivate: false,
    });
    setAttachments([]);
    setTagInput('');
    onOpenChange(false);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Create a new note and associate it with a machine and related entities
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          <form id="add-note-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Information Message */}
          <Card className="p-3 bg-muted border-border">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Note Creation Guide</p>
                <p className="text-xs text-muted-foreground">
                  Select a machine first to see available ECO, Work Order, and Component associations for this note
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

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Calibration">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}
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
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      High
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of the note..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detailed note content..."
              rows={6}
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          <Separator />

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <Input
              id="attachments"
              type="file"
              onChange={handleFileChange}
              multiple
              className="cursor-pointer"
            />
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((file, index) => (
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
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

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

              {/* Linked Work Order */}
              {machineWorkOrders.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="linkedWorkOrder">Linked Work Order</Label>
                  <Select 
                    value={formData.linkedWorkOrder} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, linkedWorkOrder: value }))}
                  >
                    <SelectTrigger id="linkedWorkOrder">
                      <SelectValue placeholder="Select a work order (optional)..." />
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

          {/* Privacy */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="private">Private Note</Label>
              <p className="text-sm text-muted-foreground">
                Only visible to administrators and supervisors
              </p>
            </div>
            <Switch
              id="private"
              checked={formData.isPrivate}
              onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
            />
          </div>

          </form>
        </div>

        {/* Static Footer */}
        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-note-form">
            <FileText className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
