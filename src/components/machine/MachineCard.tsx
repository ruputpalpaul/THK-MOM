import { useState } from 'react';
import { Machine } from '../../types/green-room';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, Wrench, AlertCircle, GitBranch } from 'lucide-react';
import { MachineDocumentsDialog } from '../dialogs/MachineDocumentsDialog';
import { MachineEventsDialog } from '../dialogs/MachineEventsDialog';
import { MachineWorkOrdersDialog } from '../dialogs/MachineWorkOrdersDialog';
import { MachineECOsDialog } from '../dialogs/MachineECOsDialog';

interface MachineCardProps {
  machine: Machine;
  onSelect?: (machine: Machine) => void;
}

export function MachineCard({ machine, onSelect }: MachineCardProps) {
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false);
  const [workOrdersDialogOpen, setWorkOrdersDialogOpen] = useState(false);
  const [ecosDialogOpen, setEcosDialogOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger onSelect if clicking directly on the card, not on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onSelect?.(machine);
  };

  const getStatusVariant = (status: Machine['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'down':
        return 'destructive';
      case 'maintenance':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: Machine['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'down':
        return 'Down';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };



  const isBackupOld = machine.lastBackup && machine.lastBackup !== 'N/A' ? 
    new Date(machine.lastBackup) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) : false;

  return (
    <Card
  className="p-6 border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-foreground">{machine.name}</h4>
          <p className="text-sm font-medium text-muted-foreground">{machine.type}</p>
        </div>
        <Badge 
          variant={getStatusVariant(machine.status)}
          className={`
            ${machine.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
            ${machine.status === 'down' ? 'bg-rose-100 text-rose-800 border-rose-200' : ''}
            ${machine.status === 'maintenance' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
            border-2 font-semibold px-3 py-1
          `}
        >
          {getStatusText(machine.status)}
        </Badge>
      </div>

  <div className="space-y-4 mb-5">
        {machine.todayTarget !== undefined && machine.todayActual !== undefined && (
          <div className="p-4 bg-muted rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Production Today</span>
              <span className={`text-sm font-bold ${
                machine.todayActual >= machine.todayTarget 
                  ? 'text-emerald-700' 
                  : machine.todayActual >= machine.todayTarget * 0.9 
                    ? 'text-amber-700' 
                    : 'text-rose-700'
              }`}>
                {machine.todayActual} / {machine.todayTarget}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    machine.todayActual >= machine.todayTarget 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                      : machine.todayActual >= machine.todayTarget * 0.9 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600' 
                        : 'bg-gradient-to-r from-rose-500 to-rose-600'
                  }`}
                  style={{ width: `${Math.min((machine.todayActual / machine.todayTarget) * 100, 100)}%` }}
                />
              </div>
              <div className="absolute -top-1 right-0 text-xs font-semibold text-muted-foreground">
                {Math.round((machine.todayActual / machine.todayTarget) * 100)}%
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3">
          {(machine.mtbf || machine.mttr) && (
            <div className="p-2 bg-card rounded-lg border">
              <div className="text-sm font-semibold text-foreground mb-2">Reliability</div>
              <div className="flex items-center gap-3 text-xs">
                {machine.mtbf !== undefined && (
                  <div className="flex-1">
                    <div className="flex justify-between"><span>MTBF</span><span>{machine.mtbf}h</span></div>
                    <div className="w-full bg-muted rounded h-1 mt-1"><div className="h-1 bg-emerald-600 rounded" style={{ width: `${Math.min(machine.mtbf / 10, 100)}%` }}></div></div>
                  </div>
                )}
                {machine.mttr !== undefined && (
                  <div className="flex-1">
                    <div className="flex justify-between"><span>MTTR</span><span>{machine.mttr}h</span></div>
                    <div className="w-full bg-muted rounded h-1 mt-1"><div className="h-1 bg-rose-600 rounded" style={{ width: `${Math.min((machine.mttr / 5) * 100, 100)}%` }}></div></div>
                  </div>
                )}
              </div>
            </div>
          )}
          {machine.oem && (
            <div className="flex justify-between items-center p-2 bg-card rounded-lg border">
              <span className="text-sm font-medium text-muted-foreground">OEM:</span>
              <span className="text-sm font-semibold text-foreground">{machine.oem}</span>
            </div>
          )}
          {machine.controller && (
            <div className="flex justify-between items-center p-2 bg-card rounded-lg border">
              <span className="text-sm font-medium text-muted-foreground">Controller:</span>
              <span className="text-sm font-semibold text-foreground">{machine.controller}</span>
            </div>
          )}
          {machine.criticality && (
            <div className="flex justify-between items-center p-2 bg-card rounded-lg border">
              <span className="text-sm font-medium text-muted-foreground">Criticality:</span>
              <Badge 
                className={`
                  ${machine.criticality === 'high' ? 'bg-rose-100 text-rose-800 border-rose-200' : ''}
                  ${machine.criticality === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                  ${machine.criticality === 'low' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                  border font-semibold
                `}
              >
                {machine.criticality.toUpperCase()}
              </Badge>
            </div>
          )}
          {machine.lastBackup && (
            <div className="flex justify-between items-center p-2 bg-card rounded-lg border">
              <span className="text-sm font-medium text-muted-foreground">Last Backup:</span>
              <span className={`text-sm font-semibold ${isBackupOld ? 'text-rose-700' : 'text-foreground'}`}>
                {machine.lastBackup}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="border hover:bg-muted hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setDocsDialogOpen(true);
          }}
        >
          <FileText className="w-4 h-4 mr-2" />
          Docs
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border hover:bg-muted hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setEventsDialogOpen(true);
          }}
        >
          <Wrench className="w-4 h-4 mr-2" />
          Events
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border hover:bg-muted hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setWorkOrdersDialogOpen(true);
          }}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          WOs
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border hover:bg-muted hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setEcosDialogOpen(true);
          }}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          ECOs
        </Button>
      </div>

      {/* Quick View Dialogs */}
      <MachineDocumentsDialog 
        machine={machine}
        open={docsDialogOpen}
        onOpenChange={setDocsDialogOpen}
      />
      <MachineEventsDialog 
        machine={machine}
        open={eventsDialogOpen}
        onOpenChange={setEventsDialogOpen}
      />
      <MachineWorkOrdersDialog 
        machine={machine}
        open={workOrdersDialogOpen}
        onOpenChange={setWorkOrdersDialogOpen}
      />
      <MachineECOsDialog 
        machine={machine}
        open={ecosDialogOpen}
        onOpenChange={setEcosDialogOpen}
      />
    </Card>
  );
}
