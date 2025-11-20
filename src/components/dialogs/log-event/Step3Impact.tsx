import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Paperclip, X, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LogEventWizardStepProps } from './types';

export function Step3Impact({
    formData,
    setFormData,
    evidenceFiles,
    setEvidenceFiles,
    ecos = [],
    workOrders = [],
    components = []
}: LogEventWizardStepProps) {

    const machineECOs = ecos.filter(e => e.machineId === formData.machineId);
    const machineWorkOrders = workOrders.filter(wo => wo.machineId === formData.machineId);
    const machineComponents = components.filter(c => c.machineId === formData.machineId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (setEvidenceFiles) {
            setEvidenceFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        if (setEvidenceFiles) {
            setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
        }
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
            {/* Impact Metrics */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Impact Metrics (Optional)</h4>
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
                        <Label htmlFor="downtime">Downtime (min)</Label>
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

            {/* Evidence/Attachments */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="evidence">Evidence/Attachments</Label>
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Upload photos, logs, or reports related to the event.</p>
                            <p>Supported formats: JPG, PNG, PDF.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Input
                    id="evidence"
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="cursor-pointer"
                />
                {evidenceFiles && evidenceFiles.length > 0 && (
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
                    <h4 className="text-sm font-medium text-muted-foreground">Relationships (Optional)</h4>

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
                                    <SelectValue placeholder={machineECOs.length === 0 ? "No ECOs" : "Select ECO..."} />
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

                        {/* Linked Work Order */}
                        <div className="space-y-2">
                            <Label htmlFor="linkedWorkOrder">Linked Work Order</Label>
                            <Select
                                value={formData.linkedWorkOrder}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, linkedWorkOrder: value }))}
                                disabled={machineWorkOrders.length === 0}
                            >
                                <SelectTrigger id="linkedWorkOrder">
                                    <SelectValue placeholder={machineWorkOrders.length === 0 ? "No Work Orders" : "Select WO..."} />
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
        </div>
    );
}
