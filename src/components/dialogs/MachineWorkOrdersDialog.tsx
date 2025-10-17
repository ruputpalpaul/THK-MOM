import { Machine, WorkOrder } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { ClipboardList } from 'lucide-react';
import { workOrders } from '../../data/mock-data';

interface MachineWorkOrdersDialogProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MachineWorkOrdersDialog({ machine, open, onOpenChange }: MachineWorkOrdersDialogProps) {
  if (!machine) return null;

  const machineWorkOrders = workOrders.filter(wo => wo.machineId === machine.id);

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'awaiting-parts':
        return 'outline';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Work Orders - {machine.name}</DialogTitle>
          <DialogDescription>
            View and manage all work orders for this machine including preventive maintenance, corrective maintenance, and calibrations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 overflow-auto flex-1 min-h-0">
          {machineWorkOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
              <p>No work orders found for this machine</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[180px]">Type</TableHead>
                  <TableHead className="min-w-[120px]">Priority</TableHead>
                  <TableHead className="min-w-[150px]">Status</TableHead>
                  <TableHead className="min-w-[350px]">Description</TableHead>
                  <TableHead className="min-w-[130px]">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machineWorkOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="whitespace-nowrap">{wo.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {wo.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(wo.priority)} className="whitespace-nowrap">
                        {wo.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(wo.status)} className="whitespace-nowrap">
                        {wo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[500px]">{wo.description}</TableCell>
                    <TableCell className="whitespace-nowrap">{wo.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
