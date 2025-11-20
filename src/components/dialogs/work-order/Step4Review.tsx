import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WizardStepProps } from './types';
import { Calendar, Clock, User, AlertTriangle, CheckSquare, Package } from 'lucide-react';

export function Step4Review({ formData, filteredMachines }: WizardStepProps) {
    const machine = filteredMachines.find(m => m.id === formData.machineId);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Info */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Work Order</h4>
                        <p className="text-lg font-semibold">{formData.title}</p>
                        <p className="text-sm text-muted-foreground">{formData.description || "No description provided"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {formData.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">{formData.type}</Badge>
                    </div>

                    <Card className="p-3 bg-muted/50">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Machine</h4>
                        <p className="font-medium">{machine?.name || formData.machineId}</p>
                        <p className="text-xs text-muted-foreground">{machine?.category}</p>
                    </Card>
                </div>

                {/* Schedule & Assignment */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Schedule & Assignment</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{formData.assignedTo || "Unassigned"}</p>
                                <p className="text-xs text-muted-foreground">Assignee</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{formData.dueDate || "No date"}</p>
                                <p className="text-xs text-muted-foreground">Due Date</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{formData.estimatedHours || "0"} hrs</p>
                                <p className="text-xs text-muted-foreground">Estimate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Resources Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium">Tasks ({formData.tasks.length})</h4>
                    </div>
                    {formData.tasks.length > 0 ? (
                        <ul className="text-sm space-y-1 pl-6 list-disc text-muted-foreground">
                            {formData.tasks.map(t => (
                                <li key={t.id}>{t.description}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground pl-6">No tasks defined</p>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium">Parts ({formData.parts.length})</h4>
                    </div>
                    {formData.parts.length > 0 ? (
                        <ul className="text-sm space-y-1 pl-6 list-disc text-muted-foreground">
                            {formData.parts.map(p => (
                                <li key={p.id}>{p.partNumber} (x{p.qty})</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground pl-6">No parts required</p>
                    )}
                </div>
            </div>
        </div>
    );
}
