import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogEventWizardStepProps } from './types';
import { Calendar, AlertTriangle, Activity, FileText, Paperclip } from 'lucide-react';

export function Step4Review({ formData, filteredMachines, evidenceFiles }: LogEventWizardStepProps) {
    const machine = filteredMachines.find(m => m.id === formData.machineId);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Info */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Event</h4>
                        <p className="text-lg font-semibold">{formData.eventType}</p>
                        <p className="text-sm text-muted-foreground">{formData.description || "No description provided"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {formData.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={formData.status === 'resolved' ? 'secondary' : 'default'}>
                            {formData.status.toUpperCase()}
                        </Badge>
                    </div>

                    <Card className="p-3 bg-muted/50">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Machine</h4>
                        <p className="font-medium">{machine?.name || formData.machineId}</p>
                        <p className="text-xs text-muted-foreground">{machine?.category}</p>
                    </Card>
                </div>

                {/* Time & Impact */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium">
                                    {formData.startTime ? new Date(formData.startTime).toLocaleString() : "Not set"}
                                </p>
                                <p className="text-xs text-muted-foreground">Start Time</p>
                            </div>
                        </div>

                        {formData.downtime && (
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{formData.downtime} mins</p>
                                    <p className="text-xs text-muted-foreground">Downtime</p>
                                </div>
                            </div>
                        )}

                        {evidenceFiles && evidenceFiles.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{evidenceFiles.length} files</p>
                                    <p className="text-xs text-muted-foreground">Evidence Attached</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Analysis */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium">Analysis</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Root Cause</p>
                        <p className="text-sm">{formData.rootCause || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Resolution</p>
                        <p className="text-sm">{formData.resolutionNotes || "Not specified"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
