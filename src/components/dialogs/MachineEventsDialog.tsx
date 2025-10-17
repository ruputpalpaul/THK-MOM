import { Machine, Event } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { AlertCircle } from 'lucide-react';
import { events } from '../../data/mock-data';

interface MachineEventsDialogProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MachineEventsDialog({ machine, open, onOpenChange }: MachineEventsDialogProps) {
  if (!machine) return null;

  const machineEvents = events.filter(event => event.machineId === machine.id);

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'fault':
        return 'destructive';
      case 'downtime':
        return 'destructive';
      case 'uptime':
        return 'default';
      case 'backup':
        return 'secondary';
      case 'eco':
        return 'outline';
      case 'maintenance':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Events - {machine.name}</DialogTitle>
          <DialogDescription>
            View all logged events for this machine including faults, downtime, maintenance, and backups.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 overflow-auto flex-1 min-h-0">
          {machineEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
              <p>No events found for this machine</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Type</TableHead>
                  <TableHead className="min-w-[400px]">Description</TableHead>
                  <TableHead className="min-w-[180px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machineEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge variant={getEventTypeColor(event.type)} className="whitespace-nowrap">
                        {event.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[600px]">{event.description}</TableCell>
                    <TableCell className="whitespace-nowrap">{event.timestamp}</TableCell>
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
