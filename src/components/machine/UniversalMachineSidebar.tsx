import { useState, useEffect, useCallback } from 'react';
import { Machine, WorkOrder, Document, ECO } from '../../types/green-room';
import * as api from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  X, 
  FileUp, 
  FileText, 
  AlertCircle, 
  ClipboardList, 
  ExternalLink, 
  Calendar, 
  Activity,
  Wrench,
  GitBranch,
  Download,
  TrendingUp,
  BellRing,
  Timer
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UniversalMachineSidebarProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullDetails: (machine: Machine) => void;
  onUploadDocument: () => void;
  onAddNote: () => void;
  onLogEvent: () => void;
  onCreateWorkOrder: () => void;
}

export function UniversalMachineSidebar({ 
  machine, 
  isOpen, 
  onClose, 
  onViewFullDetails,
  onUploadDocument,
  onAddNote,
  onLogEvent,
  onCreateWorkOrder
}: UniversalMachineSidebarProps) {
  const [machineDocuments, setMachineDocuments] = useState<Document[]>([]);
  const [openWorkOrders, setOpenWorkOrders] = useState<WorkOrder[]>([]);
  const [recentECOs, setRecentECOs] = useState<ECO[]>([]);
  const [andonReason, setAndonReason] = useState('');
  const [andonStart, setAndonStart] = useState<number | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<Machine['status']>('active');
  const [downReasonInput, setDownReasonInput] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusDisplay, setStatusDisplay] = useState<Machine['status']>(machine?.status ?? 'active');
  const [downReasonDisplay, setDownReasonDisplay] = useState<string | undefined>(machine?.downReason);

  const loadMachineData = useCallback(async () => {
    if (!machine) return;
    
    try {
      const [docs, workOrders, ecos] = await Promise.all([
        api.getDocuments(),
        api.getWorkOrders(),
        api.getECOs(),
      ]);

      // Filter data for this machine
      setMachineDocuments(docs.filter(doc => doc.machineId === machine.id).slice(0, 5));
      setOpenWorkOrders(workOrders.filter(wo => wo.machineId === machine.id && wo.status !== 'completed'));
      setRecentECOs(ecos.filter(eco => eco.machineId === machine.id).slice(0, 3));
    } catch (error) {
      console.error('Error loading machine data:', error);
    }
  }, [machine]);

  useEffect(() => {
    if (machine && isOpen) {
      loadMachineData();
    }
  }, [machine, isOpen, loadMachineData]);

  useEffect(() => {
    if (!machine) return;
    setStatusDisplay(machine.status);
    setDownReasonDisplay(machine.downReason);
    setNextStatus(machine.status);
    setDownReasonInput(machine.downReason || '');
  }, [machine]);

  if (!isOpen || !machine) return null;

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'active':
  return 'bg-green-600 text-white';
      case 'down':
  return 'bg-red-600 text-white';
      case 'maintenance':
  return 'bg-blue-600 text-white';
      default:
  return 'bg-muted text-foreground';
    }
  };



  const getCriticalityVariant = (criticality?: string) => {
    switch (criticality) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
  <div className="fixed inset-y-0 right-0 w-96 bg-card border-l-2 border shadow-xl z-50 flex flex-col max-h-screen">
      {/* Header */}
    <div className="flex items-center justify-between p-6 border-b bg-muted">
        <div className="flex-1">
      <h2 className="text-xl font-bold text-foreground">{machine.name}</h2>
      <p className="text-sm text-muted-foreground">{machine.type}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 overscroll-contain">
        <div className="p-6 space-y-6 pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Status and Summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Machine Summary</h3>
              <Badge className={getStatusColor(statusDisplay)}>
                <Activity className="h-3 w-3 mr-1" />
                {statusDisplay.charAt(0).toUpperCase() + statusDisplay.slice(1)}
              </Badge>
            </div>
            
            {statusDisplay === 'down' && downReasonDisplay && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {downReasonDisplay}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Machine ID:</span>
                <span className="font-medium">{machine.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">OEM:</span>
                <span className="font-medium">{machine.oem || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Controller:</span>
                <span className="font-medium">{machine.controller || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{machine.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criticality:</span>
                <Badge variant={getCriticalityVariant(machine.criticality)}>
                  {machine.criticality || 'Low'}
                </Badge>
              </div>
              {machine.commissionedDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commissioned:</span>
                  <span className="font-medium">{machine.commissionedDate}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Production Today */}
      {machine.todayTarget && (
            <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Today's Production
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
          <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium">{machine.todayTarget}</span>
                </div>
                <div className="flex justify-between">
          <span className="text-muted-foreground">Actual:</span>
                  <span className="font-medium">{machine.todayActual || 0}</span>
                </div>
                <div className="flex justify-between">
          <span className="text-muted-foreground">Scrap:</span>
          <span className="font-medium">{machine.todayScrap || 0}</span>
                </div>
                {machine.todayTarget && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{Math.round(((machine.todayActual || 0) / machine.todayTarget) * 100)}%</span>
                    </div>
          <div className="w-full bg-muted rounded-full h-2">
                      <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(((machine.todayActual || 0) / machine.todayTarget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Performance Metrics */}
          {(machine.oee || machine.mtbf || machine.mttr) && (
            <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-3">Performance</h3>
              <div className="space-y-2 text-sm">
                {machine.oee && (
                  <div className="flex justify-between">
        <span className="text-muted-foreground">OEE:</span>
                    <span className="font-medium">{machine.oee}%</span>
                  </div>
                )}
                {machine.mtbf && (
                  <div className="flex justify-between">
        <span className="text-muted-foreground">MTBF:</span>
                    <span className="font-medium">{machine.mtbf}h</span>
                  </div>
                )}
                {machine.mttr && (
                  <div className="flex justify-between">
        <span className="text-muted-foreground">MTTR:</span>
                    <span className="font-medium">{machine.mttr}h</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* e-Andon */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center">
                <BellRing className="w-4 h-4 mr-2 text-primary" />
                e-Andon
              </h3>
            </div>
            {!andonStart ? (
              <div className="space-y-2">
                <select className="w-full border rounded px-2 py-1 text-sm" value={andonReason} onChange={(e) => setAndonReason(e.target.value)}>
                  <option value="">Select reason…</option>
                  <option value="Quality">Quality</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Safety">Safety</option>
                  <option value="Supply">Supply</option>
                </select>
                <Button size="sm" disabled={!andonReason} onClick={() => { setAndonStart(Date.now()); }}>Call Help</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm">{andonReason} help requested</div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  <AndonTimer start={andonStart} />
                </Badge>
              </div>
            )}
          </Card>

          {/* Open Issues - Scrollable */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center">
                <Wrench className="w-4 h-4 mr-2" />
                Open Issues ({openWorkOrders.length})
              </h3>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {openWorkOrders.length > 0 ? (
                <div className="space-y-2 pr-2">
                  {openWorkOrders.map(wo => (
                    <div key={wo.id} className="border rounded-lg p-3 bg-muted">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{wo.id}</p>
                        <Badge variant={wo.type === 'Emergency' ? 'destructive' : 'secondary'}>
                          {wo.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{wo.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">Due: {wo.dueDate}</p>
                        <Badge variant="outline" className="text-xs">
                          {wo.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No open issues</p>
              )}
            </div>
          </Card>

          {/* Recent Documents */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Recent Documents
              </h3>
            </div>
            {machineDocuments.length > 0 ? (
              <div className="space-y-2">
                {machineDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                      </div>
                      <p className="text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents available</p>
            )}
          </Card>

          {/* Recent Changes */}
          {recentECOs.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center">
                  <GitBranch className="w-4 h-4 mr-2 text-primary" />
                  Recent Changes
                </h3>
              </div>
              <div className="space-y-2">
                {recentECOs.map(eco => (
                  <div key={eco.id} className="border rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{eco.number}</p>
                      <Badge variant={eco.status === 'approved' ? 'default' : 'secondary'}>
                        {eco.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{eco.description}</p>
                    <p className="text-xs text-gray-500">{eco.date}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Last Backup */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Last Backup
            </h3>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{machine.lastBackup || 'Never'}</span>
              </div>
              {machine.lastBackup && machine.lastBackup !== 'N/A' && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                  Backup is up to date
                </div>
              )}
              {(!machine.lastBackup || machine.lastBackup === 'N/A') && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  No backup found - consider creating one
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
  <div className="border-t bg-muted p-4 space-y-3">
        {/* View Full Details Button */}
        <Button 
          onClick={() => machine && onViewFullDetails(machine)}
          className="w-full"
          variant="default"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Details
        </Button>

        {/* Change Status */}
        <Button 
          onClick={() => setStatusDialogOpen(true)}
          className="w-full"
          variant="outline"
        >
          Change Status
        </Button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onUploadDocument}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            Upload
          </Button>
          <Button
            onClick={onAddNote}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Note
          </Button>
          <Button
            onClick={onLogEvent}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Event
          </Button>
          <Button
            onClick={onCreateWorkOrder}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            Work Order
          </Button>
        </div>
      </div>
    </div>

    {/* Change Status Dialog */}
    <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Machine Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm">Status</label>
            <select className="w-full border rounded px-2 py-1 text-sm" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as Machine['status'])}>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="down">Down</option>
            </select>
          </div>
          {nextStatus === 'down' && (
            <div className="space-y-1">
              <label className="text-sm">Downtime Reason (required)</label>
              <textarea className="w-full border rounded px-2 py-1 text-sm" rows={3} value={downReasonInput} onChange={(e) => setDownReasonInput(e.target.value)} />
            </div>
          )}
          {statusError && <div className="text-sm text-red-600">{statusError}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            setStatusError(null);
            try {
              if (!machine) return;
              const updates: Partial<Machine> = { status: nextStatus };
              if (nextStatus === 'down') updates.downReason = downReasonInput.trim();
              const updated = await api.updateMachine(machine.id, updates);
              setStatusDisplay(updated.status);
              setDownReasonDisplay(updated.downReason);
              setStatusDialogOpen(false);
            } catch (err) {
              let message = 'Failed to update status';
              if (err instanceof Error) {
                message = err.message;
              } else if (typeof err === 'object' && err && 'message' in err) {
                const m = (err as { message?: unknown }).message;
                if (typeof m === 'string') message = m;
              }
              setStatusError(message);
            }
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function AndonTimer({ start }: { start: number | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 1000);
    return () => clearInterval(id);
  }, [start]);
  const seconds = Math.floor(elapsed / 1000) % 60;
  const minutes = Math.floor(elapsed / (1000 * 60)) % 60;
  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const fmt = [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':');
  return <span className="tabular-nums">{fmt}</span>;
}
