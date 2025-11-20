import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WizardStepProps } from './types';

export function Step2Details({ formData, setFormData }: WizardStepProps) {
    return (
        <div className="space-y-6">
            {/* Title & Description */}
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief summary of the work order..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of work to be performed..."
                    rows={4}
                />
            </div>

            {/* Assignment & Scheduling */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                        id="assignedTo"
                        value={formData.assignedTo}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        placeholder="Technician name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="requestedBy">Requested By</Label>
                    <Input
                        id="requestedBy"
                        value={formData.requestedBy}
                        onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                        placeholder="Requester name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                        id="estimatedHours"
                        type="number"
                        step="0.5"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                        placeholder="0.0"
                    />
                </div>
            </div>
        </div>
    );
}
