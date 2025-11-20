import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { LogEventWizardStepProps } from './types';

export function Step1Triage({ formData, setFormData, filteredMachines }: LogEventWizardStepProps) {
    return (
        <div className="space-y-6">
            {/* Information Message */}
            <Card className="p-3 bg-muted border-border">
                <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-foreground">Event Triage</p>
                        <p className="text-xs text-muted-foreground">
                            Select the machine and categorize the event to determine immediate impact.
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
        </div>
    );
}
