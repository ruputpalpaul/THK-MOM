import { useState } from 'react';
import { Machine } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertCircle, Clock, Wrench, MapPin } from 'lucide-react';
import { CreateWorkOrderDialog } from './CreateWorkOrderDialog';

interface DownMachinesDialogProps {
  machines: Machine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewMachineDetails?: (machine: Machine) => void;
}

export function DownMachinesDialog({ machines, open, onOpenChange, onViewMachineDetails }: DownMachinesDialogProps) {
  const [createWorkOrderDialogOpen, setCreateWorkOrderDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const formatDowntime = (lastDowntime?: string) => {
    if (!lastDowntime) return 'Unknown';
    
    const downDate = new Date(lastDowntime);
    const now = new Date();
    const hoursAgo = Math.floor((now.getTime() - downDate.getTime()) / (1000 * 60 * 60));
    
    if (hoursAgo < 1) return 'Less than 1 hour';
    if (hoursAgo < 24) return `${hoursAgo} hours ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'down') return 'destructive';
    if (status === 'maintenance') return 'secondary';
    return 'default';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'down') return AlertCircle;
    if (status === 'maintenance') return Wrench;
    return Clock;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Machines Down or Under Maintenance
          </DialogTitle>
          <DialogDescription>
            Machines currently offline requiring attention or scheduled maintenance
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          {machines.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">All machines are operational.</p>
            </Card>
          ) : (
            machines.map((machine) => {
              const StatusIcon = getStatusIcon(machine.status);
              
              return (
                <Card key={machine.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${machine.status === 'down' ? 'text-red-600' : 'text-yellow-600'}`} />
                        <h4>{machine.name}</h4>
                        <Badge variant="secondary">{machine.category}</Badge>
                        <Badge variant={getStatusColor(machine.status)}>
                          {machine.status.toUpperCase()}
                        </Badge>
                        {machine.criticality && (
                          <Badge 
                            variant={
                              machine.criticality === 'high' ? 'destructive' : 
                              machine.criticality === 'medium' ? 'secondary' : 'outline'
                            }
                          >
                            {machine.criticality.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{machine.type || 'N/A'}</span>
                        </div>
                        
                        {machine.lastDowntime && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Down Since:</span>
                            <span className="text-red-600">{formatDowntime(machine.lastDowntime)}</span>
                          </div>
                        )}
                        
                        {machine.oem && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">OEM:</span>
                            <span>{machine.oem}</span>
                          </div>
                        )}
                        
                        {machine.controller && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Controller:</span>
                            <span>{machine.controller}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Position:</span>
                          <span>X: {machine.x}, Y: {machine.y}</span>
                        </div>
                        
                        {machine.todayTarget && machine.todayActual !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Production Impact:</span>
                            <span className="ml-2 text-red-600">
                              {machine.todayActual}/{machine.todayTarget} units ({Math.round((machine.todayActual / machine.todayTarget) * 100)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          onViewMachineDetails?.(machine);
                          onOpenChange(false);
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMachine(machine);
                          setCreateWorkOrderDialogOpen(true);
                        }}
                      >
                        Create WO
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {machines.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-red-600">{machines.filter(m => m.status === 'down').length}</span> machines down • 
                  <span className="text-yellow-600 ml-2">{machines.filter(m => m.status === 'maintenance').length}</span> under maintenance
                </p>
                <p className="text-sm text-muted-foreground">
                  Total production capacity impact: {Math.round((machines.reduce((sum, m) => sum + (m.todayTarget || 0), 0) - machines.reduce((sum, m) => sum + (m.todayActual || 0), 0)) / machines.reduce((sum, m) => sum + (m.todayTarget || 0), 0) * 100)}%
                </p>
              </div>
              <Button>
                Generate Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Create Work Order Dialog */}
      <CreateWorkOrderDialog
        open={createWorkOrderDialogOpen}
        onOpenChange={setCreateWorkOrderDialogOpen}
        prefilledMachine={selectedMachine}
      />
    </Dialog>
  );
}
