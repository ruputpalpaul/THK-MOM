import { WorkOrder } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ClipboardList, Calendar, User, AlertTriangle } from 'lucide-react';

interface PendingWorkOrdersDialogProps {
  workOrders: WorkOrder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewWorkOrderDetails?: (workOrder: WorkOrder) => void;
}

export function PendingWorkOrdersDialog({ workOrders, open, onOpenChange, onViewWorkOrderDetails }: PendingWorkOrdersDialogProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in-progress': return 'secondary';
      case 'on-hold': return 'outline';
      default: return 'default';
    }
  };

  const getTypeColor = () => 'bg-muted text-foreground border-border';

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const formatDueDate = (dueDate: string) => {
    const daysLeft = getDaysUntilDue(dueDate);
    if (daysLeft < 0) return { text: `${Math.abs(daysLeft)} days overdue`, color: 'text-red-600' };
    if (daysLeft === 0) return { text: 'Due today', color: 'text-muted-foreground' };
    if (daysLeft === 1) return { text: 'Due tomorrow', color: 'text-muted-foreground' };
    if (daysLeft <= 3) return { text: `Due in ${daysLeft} days`, color: 'text-muted-foreground' };
    return { text: `Due in ${daysLeft} days`, color: 'text-muted-foreground' };
  };

  // Sort by priority and due date
  const sortedWorkOrders = [...workOrders].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    return getDaysUntilDue(a.dueDate) - getDaysUntilDue(b.dueDate);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
            Pending Work Orders
          </DialogTitle>
          <DialogDescription>
            All open and in-progress work orders requiring attention
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          {sortedWorkOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No pending work orders.</p>
            </Card>
          ) : (
            sortedWorkOrders.map((wo) => {
              const dueDateInfo = formatDueDate(wo.dueDate);
              const isOverdue = getDaysUntilDue(wo.dueDate) < 0;
              
              return (
    <Card key={wo.id} className={`p-4`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {isOverdue && <AlertTriangle className="w-5 h-5 text-red-600" />}
                        <h4>{wo.id}</h4>
                        <Badge variant="secondary">{wo.machineName}</Badge>
                        <Badge variant={getPriorityColor(wo.priority)}>
                          {wo.priority.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusColor(wo.status)}>
                          {wo.status.toUpperCase()}
                        </Badge>
      <Badge className={getTypeColor()} variant="outline">
                          {wo.type}
                        </Badge>
                      </div>

                      <p className="text-sm">{wo.description}</p>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Due:</span>
                          <span className={dueDateInfo.color}>{wo.dueDate}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Assignee:</span>
                          <span>{wo.assignee}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Requested by:</span>
                          <span>{wo.requestedBy}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${dueDateInfo.color}`}>
                          {dueDateInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          onViewWorkOrderDetails?.(wo);
                          onOpenChange(false);
                        }}
                      >
                        View Details
                      </Button>
                      <Button size="sm">
                        {wo.status === 'open' ? 'Start Work' : 'Update Status'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {sortedWorkOrders.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-red-600">{sortedWorkOrders.filter(wo => wo.priority === 'critical').length}</span> critical • 
                  <span className="text-muted-foreground ml-2">{sortedWorkOrders.filter(wo => wo.priority === 'high').length}</span> high priority • 
                  <span className="text-red-600 ml-2">{sortedWorkOrders.filter(wo => getDaysUntilDue(wo.dueDate) < 0).length}</span> overdue
                </p>
                <p className="text-sm text-muted-foreground">
                  {sortedWorkOrders.filter(wo => wo.status === 'in-progress').length} in progress • 
                  {sortedWorkOrders.filter(wo => wo.status === 'open').length} awaiting assignment
                </p>
              </div>
              <Button>
                Export List
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
