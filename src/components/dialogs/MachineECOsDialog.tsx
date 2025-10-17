import { Machine, ECO } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { GitBranch } from 'lucide-react';
import { ecos } from '../../data/mock-data';

interface MachineECOsDialogProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MachineECOsDialog({ machine, open, onOpenChange }: MachineECOsDialogProps) {
  if (!machine) return null;

  const machineECOs = ecos.filter(eco => eco.machineId === machine.id);

  const getStatusColor = (status: ECO['status']) => {
    switch (status) {
      case 'draft':
        return 'outline';
      case 'review':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'effective':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: ECO['type']) => {
    switch (type) {
      case 'Software':
        return 'default';
      case 'Hardware':
        return 'secondary';
      case 'Process':
        return 'outline';
      case 'Documentation':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Engineering Change Orders - {machine.name}</DialogTitle>
          <DialogDescription>
            View all Engineering Change Orders (ECOs) for this machine including software, hardware, process, and documentation changes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 overflow-auto flex-1 min-h-0">
          {machineECOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <GitBranch className="w-12 h-12 mb-3 opacity-20" />
              <p>No ECOs found for this machine</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Number</TableHead>
                  <TableHead className="min-w-[350px]">Title</TableHead>
                  <TableHead className="min-w-[160px]">Type</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machineECOs.map((eco) => (
                  <TableRow key={eco.id}>
                    <TableCell className="whitespace-nowrap">{eco.number}</TableCell>
                    <TableCell className="max-w-[500px]">{eco.title}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(eco.type)} className="whitespace-nowrap">
                        {eco.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(eco.status)} className="whitespace-nowrap">
                        {eco.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{eco.date}</TableCell>
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
