import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Clock } from 'lucide-react';
import { LogEventWizardStepProps } from './types';

export function Step2Details({ formData, setFormData }: LogEventWizardStepProps) {

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

    return (
        <div className="space-y-6">
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
        </div>
    );
}
