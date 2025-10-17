import { Machine } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, Calendar, Download } from 'lucide-react';

interface OldBackupsDialogProps {
  machines: Machine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackupMachine?: (machine: Machine) => void;
}

export function OldBackupsDialog({ machines, open, onOpenChange, onBackupMachine }: OldBackupsDialogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const monthsAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return { formatted: dateString, monthsAgo };
  };

  const getSeverityColor = (monthsAgo: number) => {
    if (monthsAgo >= 12) return 'text-red-600';
    if (monthsAgo >= 9) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Old Program Backups
          </DialogTitle>
          <DialogDescription>
            Machines with program backups older than 6 months. Regular backups are critical for disaster recovery.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          {machines.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No machines with old backups found.</p>
            </Card>
          ) : (
            machines.map((machine) => {
              const backup = machine.lastBackup && machine.lastBackup !== 'N/A' 
                ? formatDate(machine.lastBackup)
                : null;

              return (
                <Card key={machine.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4>{machine.name}</h4>
                        <Badge variant="secondary">{machine.category}</Badge>
                        <Badge 
                          variant={machine.status === 'active' ? 'default' : 'destructive'}
                          className={machine.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        >
                          {machine.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Last Backup:</span>
                          {backup && (
                            <span className={getSeverityColor(backup.monthsAgo)}>
                              {backup.formatted} ({backup.monthsAgo} months ago)
                            </span>
                          )}
                        </div>

                        {machine.criticality && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Criticality:</span>
                            <Badge 
                              variant={
                                machine.criticality === 'high' ? 'destructive' : 
                                machine.criticality === 'medium' ? 'secondary' : 'outline'
                              }
                            >
                              {machine.criticality.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {machine.type && (
                        <p className="text-sm text-muted-foreground">{machine.type}</p>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (onBackupMachine) {
                          onBackupMachine(machine);
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Backup Now
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {machines.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {machines.length} machine{machines.length !== 1 ? 's' : ''} requiring backup attention
              </p>
              <Button>
                Schedule All Backups
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
