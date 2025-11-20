import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { WizardStepProps } from './types';

export function Step1Triage({ formData, setFormData, filteredMachines }: WizardStepProps) {
    return (
        <div className="space-y-6">
            {/* Information Message */}
            <Card className="p-3 bg-muted border-border">
                <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-foreground">Triage & Context</p>
                        <p className="text-xs text-muted-foreground">
                            Select the machine and classify the work to determine priority and requirements.
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
                    <div className="flex items-center gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Critical: Safety/Quality risk. Immediate action required.</p>
                                <p>High: Production stoppage. Action within 4 hours.</p>
                                <p>Medium: Potential impact. Action within 24 hours.</p>
                                <p>Low: Routine maintenance. Schedule as needed.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
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
        </div>
    );
}
