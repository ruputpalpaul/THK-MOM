import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { WizardStepProps } from './types';

export function Step3Resources({ formData, setFormData, ecos, components }: WizardStepProps) {
    const [taskInput, setTaskInput] = useState('');
    const [partInput, setPartInput] = useState({ partNumber: '', qty: '', lot: '' });

    const machineECOs = ecos.filter(e => e.machineId === formData.machineId);
    const machineComponents = components.filter(c => c.machineId === formData.machineId);

    const addTask = () => {
        if (taskInput.trim()) {
            setFormData(prev => ({
                ...prev,
                tasks: [...prev.tasks, {
                    id: Date.now().toString(),
                    description: taskInput.trim(),
                    status: 'pending',
                    notes: ''
                }]
            }));
            setTaskInput('');
        }
    };

    const removeTask = (id: string) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== id)
        }));
    };

    const addPart = () => {
        if (partInput.partNumber.trim() && partInput.qty) {
            setFormData(prev => ({
                ...prev,
                parts: [...prev.parts, {
                    id: Date.now().toString(),
                    partNumber: partInput.partNumber.trim(),
                    qty: parseInt(partInput.qty),
                    lot: partInput.lot.trim()
                }]
            }));
            setPartInput({ partNumber: '', qty: '', lot: '' });
        }
    };

    const removePart = (id: string) => {
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.filter(p => p.id !== id)
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

    return (
        <div className="space-y-6">
            {/* Tasks */}
            <div className="space-y-4">
                <Label>Tasks</Label>
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
                {formData.tasks.length > 0 && (
                    <Card className="p-3">
                        <div className="space-y-2">
                            {formData.tasks.map((task, index) => (
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
            </div>

            {/* Parts */}
            <div className="space-y-4">
                <Label>Parts Required</Label>
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
                        placeholder="Lot (opt)"
                    />
                    <Button type="button" variant="outline" onClick={addPart} className="col-span-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </div>
                {formData.parts.length > 0 && (
                    <Card className="p-3">
                        <div className="space-y-2">
                            {formData.parts.map(part => (
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
            </div>

            {/* Relationships */}
            <div className="space-y-4">
                <Label>Relationships (Optional)</Label>

                <div className="grid grid-cols-2 gap-4">
                    {/* Linked ECO */}
                    <div className="space-y-2">
                        <Label htmlFor="linkedECO">Linked ECO</Label>
                        <Select
                            value={formData.linkedECO}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, linkedECO: value }))}
                            disabled={machineECOs.length === 0}
                        >
                            <SelectTrigger id="linkedECO">
                                <SelectValue placeholder={machineECOs.length === 0 ? "No ECOs for this machine" : "Select ECO..."} />
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
        </div>
    );
}
