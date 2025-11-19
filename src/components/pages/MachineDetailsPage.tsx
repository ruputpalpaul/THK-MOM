import { useState, useEffect, useMemo } from 'react';
import { Machine, Event, WorkOrder, ECO, Component, MachineSetting, ProductionData, Document, MachineStatus } from '../../types/green-room';
import * as api from '../../utils/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { CreateWorkOrderDialog } from '../dialogs/CreateWorkOrderDialog';
import { UploadDocumentDialog } from '../dialogs/UploadDocumentDialog';
import { AddNoteDialog } from '../dialogs/AddNoteDialog';
import { LogEventDialog } from '../dialogs/LogEventDialog';
import { CreateECODialog } from '../dialogs/CreateECODialog';
import { useAlerts } from '@/providers/AlertProvider';
import { AlertCard } from '../alerts/AlertCard';
import { 
  ArrowLeft, 
  FileUp, 
  FileText, 
  AlertCircle, 
  ClipboardList, 
  GitBranch,
  Download,
  ExternalLink,
  Package,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';

type MachineFormState = {
  name: string;
  type: string;
  category: string;
  status: MachineStatus;
  criticality: Machine['criticality'] | '';
  oem: string;
  controller: string;
  commissionedDate: string;
  lastBackup: string;
  power: string;
  air: string;
  network: string;
  todayTarget: string;
  todayActual: string;
  todayScrap: string;
  mtbf: string;
  mttr: string;
  oee: string;
  downReason: string;
};

interface MachineDetailsPageProps {
  machine: Machine;
  onBack: () => void;
  onMachineUpdated?: (machine: Machine) => void;
}

export function MachineDetailsPage({ machine, onBack, onMachineUpdated }: MachineDetailsPageProps) {
  const buildFormState = (m: Machine): MachineFormState => ({
    name: m.name ?? '',
    type: m.type ?? '',
    category: m.category ?? '',
    status: m.status,
    criticality: m.criticality ?? '',
    oem: m.oem ?? '',
    controller: m.controller ?? '',
    commissionedDate: m.commissionedDate ?? '',
    lastBackup: m.lastBackup ?? '',
    power: m.power ?? '',
    air: m.air ?? '',
    network: m.network ?? '',
    todayTarget: m.todayTarget != null ? String(m.todayTarget) : '',
    todayActual: m.todayActual != null ? String(m.todayActual) : '',
    todayScrap: m.todayScrap != null ? String(m.todayScrap) : '',
    mtbf: m.mtbf != null ? String(m.mtbf) : '',
    mttr: m.mttr != null ? String(m.mttr) : '',
    oee: m.oee != null ? String(m.oee) : '',
    downReason: m.downReason ?? '',
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [ecos, setECOs] = useState<ECO[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [machineSettings, setMachineSettings] = useState<MachineSetting[]>([]);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [machineDetails, setMachineDetails] = useState<Machine>(machine);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MachineFormState>(() => buildFormState(machine));
  const [formError, setFormError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [createWorkOrderDialogOpen, setCreateWorkOrderDialogOpen] = useState(false);
  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false);
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [logEventDialogOpen, setLogEventDialogOpen] = useState(false);
  const [createECODialogOpen, setCreateECODialogOpen] = useState(false);
  const { alerts } = useAlerts();
  const machineAlerts = useMemo(
    () => alerts.filter(alert => alert.relatedMachines?.includes(machine.id)),
    [alerts, machine.id],
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [documentsData, eventsData, workOrdersData, ecosData, componentsData, settingsData, prodData] = await Promise.all([
          api.getDocuments(),
          api.getEvents(),
          api.getWorkOrders(),
          api.getECOs(),
          api.getComponents(),
          api.getMachineSettings(),
          api.getProductionData(),
        ]);
        
        setDocuments(documentsData);
        setEvents(eventsData);
        setWorkOrders(workOrdersData);
        setECOs(ecosData);
        setComponents(componentsData);
        setMachineSettings(settingsData);
        setProductionData(prodData);
      } catch (error) {
        console.error('Error loading machine details data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [machine.id]);

  useEffect(() => {
    setMachineDetails(machine);
    setFormData(buildFormState(machine));
  }, [machine]);

  useEffect(() => {
    if (editDialogOpen) {
      setFormData(buildFormState(machineDetails));
      setFormError(null);
    }
  }, [editDialogOpen, machineDetails]);

  const updateFormField = <K extends keyof MachineFormState>(field: K, value: MachineFormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseOptionalNumber = (value: string, label: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const numeric = Number(trimmed);
    if (Number.isNaN(numeric)) {
      throw new Error(`${label} must be a number`);
    }
    return numeric;
  };

  const handleSaveMachine = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Machine name is required.');
      return;
    }
    if (!formData.type.trim()) {
      setFormError('Machine type is required.');
      return;
    }
    if (formData.status === 'down' && !formData.downReason.trim()) {
      setFormError('Please provide a downtime reason for a down machine.');
      return;
    }

    const updates: Partial<Machine> = {
      name: formData.name.trim(),
      type: formData.type.trim(),
      category: formData.category.trim() || machineDetails.category,
      status: formData.status,
      oem: formData.oem.trim() || undefined,
      controller: formData.controller.trim() || undefined,
      commissionedDate: formData.commissionedDate.trim() || undefined,
      lastBackup: formData.lastBackup.trim() || undefined,
      power: formData.power.trim() || undefined,
      air: formData.air.trim() || undefined,
      network: formData.network.trim() || undefined,
      criticality: formData.criticality || undefined,
      downReason:
        formData.status === 'down'
          ? formData.downReason.trim()
          : formData.downReason.trim() || undefined,
    };

  try {
    const numericMap: Array<[keyof Machine, string, string]> = [
      ['todayTarget', formData.todayTarget, 'Today target'],
      ['todayActual', formData.todayActual, 'Today actual'],
      ['todayScrap', formData.todayScrap, 'Today scrap'],
        ['mtbf', formData.mtbf, 'MTBF'],
        ['mttr', formData.mttr, 'MTTR'],
        ['oee', formData.oee, 'OEE'],
    ];
    for (const [key, value, label] of numericMap) {
      const parsed = parseOptionalNumber(value, label);
      const updateKey = key as string;
      const trimmed = value.trim();
      if (parsed !== undefined) {
        (updates as Record<string, unknown>)[updateKey] = parsed;
      } else if (trimmed === '') {
        (updates as Record<string, unknown>)[updateKey] = undefined;
      }
    }
  } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Invalid numeric value.');
      }
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await api.updateMachine(machineDetails.id, updates);
      setMachineDetails(updated);
      onMachineUpdated?.(updated);
      toast.success('Machine updated', {
        description: `${updated.name} details have been saved.`,
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update machine', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update machine.';
      setFormError(message);
      toast.error('Unable to update machine', {
        description: message,
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const machineDocs = documents.filter(d => d.machineId === machine.id);
  const machineEvents = events.filter(e => e.machineId === machine.id);
  const machineWOs = workOrders.filter(wo => wo.machineId === machine.id);
  const machineECOs = ecos.filter(eco => eco.machineId === machine.id);
  const machineComponents = components.filter(c => c.machineId === machine.id);
  const machineSettingsData = machineSettings.filter(s => s.machineId === machine.id);
  const todayProduction = productionData.find(p => p.machineId === machine.id && p.date === '2024-10-02');

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading machine details...</p>
      </div>
    );
  }

    const getStatusBadge = (status: Machine['status']) => {
    const variants: Record<Machine['status'], 'default' | 'destructive' | 'secondary'> = {
      active: 'default',
      down: 'destructive',
      maintenance: 'secondary'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: import('../../types/green-room').WorkOrder['priority']) => {
    const colors: Record<import('../../types/green-room').WorkOrder['priority'], import('class-variance-authority').VariantProps<typeof import('../ui/badge-variants').badgeVariants>['variant']> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={colors[priority]}>{priority}</Badge>;
  };

  const getECOStatusBadge = (status: import('../../types/green-room').ECO['status']) => {
    const colors: Record<import('../../types/green-room').ECO['status'], import('class-variance-authority').VariantProps<typeof import('../ui/badge-variants').badgeVariants>['variant']> = {
      draft: 'outline',
      review: 'secondary',
      approved: 'default',
      effective: 'default',
      closed: 'outline'
    };
    return <Badge variant={colors[status]}>{status}</Badge>;
  };

  // Build component hierarchy
  const topLevelComponents = machineComponents.filter(c => !c.parentComponentId);
  const getChildComponents = (parentId: string) => 
    machineComponents.filter(c => c.parentComponentId === parentId);

  const ComponentTree = ({ component, depth = 0 }: { component: typeof machineComponents[0], depth?: number }) => {
    const children = getChildComponents(component.id);
    const hasChildren = children.length > 0;

    return (
      <div className={`${depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}`}>
        <Card className="p-4 mb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <h4>{component.name}</h4>
                <Badge variant="outline" className="text-xs">{component.type}</Badge>
                <Badge 
                  variant={component.criticality >= 4 ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  Criticality {component.criticality}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {component.vendor && (
                  <div className="text-muted-foreground">
                    Vendor: <span className="text-foreground">{component.vendor}</span>
                  </div>
                )}
                {component.partNumber && (
                  <div className="text-muted-foreground">
                    P/N: <span className="text-foreground">{component.partNumber}</span>
                  </div>
                )}
                {component.serial && (
                  <div className="text-muted-foreground">
                    S/N: <span className="text-foreground">{component.serial}</span>
                  </div>
                )}
                {component.assetTag && (
                  <div className="text-muted-foreground">
                    Asset: <span className="text-foreground">{component.assetTag}</span>
                  </div>
                )}
                {component.spareQty !== undefined && (
                  <div className="text-muted-foreground">
                    Spares: <span className={component.spareQty === 0 ? 'text-destructive' : 'text-foreground'}>
                      {component.spareQty} @ {component.spareLocation}
                    </span>
                  </div>
                )}
                {component.expectedLife && (
                  <div className="text-muted-foreground">
                    Life: <span className="text-foreground">{component.expectedLife}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
        {hasChildren && (
          <div className="mt-2">
            {children.map(child => (
              <ComponentTree key={child.id} component={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-4">
          {/* Machine Title and Status */}
          <div className="flex items-start justify-between">
            <div>
              <h1>{machineDetails.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Green Room</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{machineDetails.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(machineDetails.status)}
              <Button size="sm" variant="outline" onClick={() => setEditDialogOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Machine Info */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm">{machineDetails.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">OEM</p>
              <p className="text-sm">{machineDetails.oem || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Controller</p>
              <p className="text-sm">{machineDetails.controller || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commissioned</p>
              <p className="text-sm">{machineDetails.commissionedDate || 'N/A'}</p>
            </div>
          </div>

          {machineAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
              <div className="space-y-2">
                {machineAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="flex gap-6">
            {machineDetails.lastBackup && (
              <div>
                <p className="text-xs text-muted-foreground">Last Backup</p>
                <p className="text-sm">{machineDetails.lastBackup}</p>
              </div>
            )}
            {machineDetails.mtbf && (
              <div>
                <p className="text-xs text-muted-foreground">MTBF</p>
                <p className="text-sm">{machineDetails.mtbf} hrs</p>
              </div>
            )}
            {machineDetails.mttr && (
              <div>
                <p className="text-xs text-muted-foreground">MTTR</p>
                <p className="text-sm">{machineDetails.mttr} hrs</p>
              </div>
            )}
            {machineDetails.oee && (
              <div>
                <p className="text-xs text-muted-foreground">OEE</p>
                <p className="text-sm">{machineDetails.oee}%</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setUploadDocumentDialogOpen(true)}
            >
              <FileUp className="w-4 h-4 mr-2" />
              Upload Doc
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAddNoteDialogOpen(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              New Note
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLogEventDialogOpen(true)}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Log Event
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setCreateWorkOrderDialogOpen(true)}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Create WO
            </Button>
                        <Button size="sm" variant="outline" onClick={() => setCreateECODialogOpen(true)}>
              <GitBranch className="w-4 h-4 mr-2" />
              New ECO
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="ecos">ECOs</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Down Machine Alert - Only shown if machine status is 'down' */}
            {machineDetails.status === 'down' && (
              <>
                {/* Down Reason Card */}
                <Card className="p-6 border-red-500 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-red-900 dark:text-red-100 mb-2">Machine Down</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        {machineDetails.downReason || 'Reason not specified'}
                      </p>
                      <div className="flex gap-4 text-sm">
                        {machineDetails.lastDowntime && (
                          <div>
                            <span className="text-red-700 dark:text-red-300">Down Since:</span>
                            <span className="ml-2 text-red-900 dark:text-red-100">
                              {machineDetails.lastDowntime ? new Date(machineDetails.lastDowntime).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        )}
                        {machineDetails.diagnosed !== undefined && (
                          <div>
                            <span className="text-red-700 dark:text-red-300">Diagnosis Status:</span>
                            <span className="ml-2">
                              <Badge variant={machineDetails.diagnosed ? 'default' : 'destructive'}>
                                {machineDetails.diagnosed ? 'Completed' : 'Pending'}
                              </Badge>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Diagnostic Checklist - Only shown if machine hasn't been diagnosed */}
                {!machineDetails.diagnosed && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="mb-1">Initial Diagnostic Checklist</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete these diagnostic steps to identify the root cause
                        </p>
                      </div>
                      <Button variant="default">
                        Mark Diagnosis Complete
                      </Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Verify safety lockout/tagout procedures completed</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ensure machine is properly locked out before any diagnostic work
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Check air pressure supply to affected zone</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Verify main air line pressure (should be ~90 PSI)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Inspect pneumatic connections for leaks</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Check all quick-disconnect fittings and hoses for air leaks
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Test gripper actuation manually</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use manual override to verify gripper movement
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Check solenoid valve operation</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Verify electrical signal to valve and listen for actuation click
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Review PLC fault codes and logs</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Check for any error codes or warnings in the controller
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Document findings and create RCA if needed</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Record all observations and initiate root cause analysis
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Production Today */}
            {todayProduction && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3>Production - Today</h3>
                  <Badge variant="outline">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Target</p>
                    <p className="text-2xl">{todayProduction.target}</p>
                    <p className="text-xs text-muted-foreground">units</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Actual</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl">{todayProduction.actual}</p>
                      {todayProduction.actual >= todayProduction.target ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <Progress 
                      value={(todayProduction.actual / todayProduction.target) * 100} 
                      className="mt-2 h-2"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Scrap</p>
                    <p className="text-2xl">{todayProduction.scrap}</p>
                    <p className="text-xs text-muted-foreground">
                      {((todayProduction.scrap / todayProduction.actual) * 100).toFixed(1)}% rate
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Downtime</p>
                    <p className="text-2xl">{todayProduction.downtime}</p>
                    <p className="text-xs text-muted-foreground">minutes</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cycle Time:</span>
                    <span className="ml-2">{todayProduction.cycleTime}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Efficiency:</span>
                    <span className="ml-2">{((todayProduction.actual / todayProduction.target) * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">First Pass Yield:</span>
                    <span className="ml-2">{(((todayProduction.actual - todayProduction.scrap) / todayProduction.actual) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* System Info */}
              <Card className="p-6">
                <h3 className="mb-4">System Information</h3>
                <div className="space-y-3">
                  {machineDetails.power && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Power:</span>
                      <span className="text-sm">{machineDetails.power}</span>
                    </div>
                  )}
                  {machineDetails.air && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Air:</span>
                      <span className="text-sm">{machineDetails.air}</span>
                    </div>
                  )}
                  {machineDetails.network && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Network:</span>
                      <span className="text-sm">{machineDetails.network}</span>
                    </div>
                  )}
                  {machineDetails.criticality && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Criticality:</span>
                      <Badge variant={machineDetails.criticality === 'high' ? 'destructive' : 'secondary'}>
                        {machineDetails.criticality}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Events */}
              <Card className="p-6">
                <h3 className="mb-4">Recent Events</h3>
                <div className="space-y-2">
                  {machineEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-start gap-2 p-2 border rounded">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{event.description}</p>
                        <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Component Summary */}
            <Card className="p-6">
              <h3 className="mb-4">Component Summary</h3>
              <p className="text-sm text-muted-foreground">
                {topLevelComponents.length} top-level assemblies • {machineComponents.length} total components
              </p>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {/* Program Backups */}
            <div>
              <h3 className="mb-3">Program Backups</h3>
              <Card className="p-4">
                <div className="space-y-2">
                  {machineDocs.filter(d => d.type === 'Program Backup').length > 0 ? (
                    machineDocs.filter(d => d.type === 'Program Backup').map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-3">No program backups available</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Operator Manual */}
            <div>
              <h3 className="mb-3">Operator Manual</h3>
              <Card className="p-4">
                <div className="space-y-2">
                  {machineDocs.filter(d => d.type === 'Operator Manual').length > 0 ? (
                    machineDocs.filter(d => d.type === 'Operator Manual').map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <div>
                            <p className="text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-3">No operator manuals available</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Drawings */}
            <div>
              <h3 className="mb-3">Drawings</h3>
              <Card className="p-4">
                <div className="space-y-2">
                  {machineDocs.filter(d => d.type === 'Drawings').length > 0 ? (
                    machineDocs.filter(d => d.type === 'Drawings').map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-3">No drawings available</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3>Component Hierarchy</h3>
                <p className="text-sm text-muted-foreground">
                  {machineComponents.length} components total
                </p>
              </div>
              {topLevelComponents.map(component => (
                <ComponentTree key={component.id} component={component} />
              ))}
              {topLevelComponents.length === 0 && (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground text-center">No components defined for this machine</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Safety Settings */}
            <div>
              <h3 className="mb-3">Safety Settings</h3>
              <Card className="p-4">
                <div className="space-y-2">
                  {machineSettingsData.filter(s => s.category === 'Safety').map(setting => (
                    <div key={setting.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{setting.key}</p>
                          {setting.subcategory && (
                            <Badge variant="outline" className="text-xs">{setting.subcategory}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Changed by {setting.changedBy} on {setting.effectiveFrom}
                        </p>
                      </div>
                      <p className="text-sm">
                        {setting.value} {setting.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Process Settings */}
            <div>
              <h3 className="mb-3">Process Settings</h3>
              <Card className="p-4">
                <div className="space-y-2">
                  {machineSettingsData.filter(s => s.category === 'Process').map(setting => (
                    <div key={setting.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{setting.key}</p>
                          {setting.subcategory && (
                            <Badge variant="outline" className="text-xs">{setting.subcategory}</Badge>
                          )}
                          {setting.linkedECO && (
                            <Badge variant="secondary" className="text-xs">ECO: {setting.linkedECO}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Changed by {setting.changedBy} on {setting.effectiveFrom}
                        </p>
                      </div>
                      <p className="text-sm">
                        {setting.value} {setting.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Communication Settings */}
            <div>
              <h3 className="mb-3">Communication Settings</h3>
              <Card className="p-4">
                <div className="space-y-2">
                  {machineSettingsData.filter(s => s.category === 'Communication').map(setting => (
                    <div key={setting.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="text-sm">{setting.key}</p>
                        <p className="text-xs text-muted-foreground">
                          Changed by {setting.changedBy} on {setting.effectiveFrom}
                        </p>
                      </div>
                      <p className="text-sm font-mono">{setting.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ECOs Tab */}
          <TabsContent value="ecos">
            <div className="space-y-4">
              {machineECOs.map(eco => (
                <Card key={eco.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3>{eco.number}</h3>
                        {getECOStatusBadge(eco.status)}
                        <Badge variant="outline">{eco.type}</Badge>
                      </div>
                      <h4>{eco.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm mb-4">{eco.description}</p>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="ml-2">{eco.reason}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requested By:</span>
                      <span className="ml-2">{eco.requestedBy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-2">{eco.date}</span>
                    </div>
                  </div>
                </Card>
              ))}
              {machineECOs.length === 0 && (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground text-center">No ECOs for this machine</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <div className="space-y-4">
              {machineWOs.map(wo => (
                <Card key={wo.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3>{wo.id}</h3>
                        <Badge variant="outline">{wo.type}</Badge>
                        {getPriorityBadge(wo.priority)}
                        <Badge variant={wo.status === 'completed' ? 'default' : 'secondary'}>{wo.status}</Badge>
                      </div>
                      <p className="text-sm">{wo.description}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Requested By:</span>
                      <span className="ml-2">{wo.requestedBy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assignee:</span>
                      <span className="ml-2">{wo.assignee}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="ml-2">{wo.dueDate}</span>
                    </div>
                  </div>
                </Card>
              ))}
              {machineWOs.length === 0 && (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground text-center">No work orders for this machine</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <div className="space-y-3">
              {machineEvents
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(event => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="w-0.5 h-full bg-border"></div>
                  </div>
                  <Card className="flex-1 p-4 mb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{event.type}</Badge>
                          <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                        </div>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Machine Details</DialogTitle>
            <DialogDescription>
              Update the machine&apos;s core information. Changes save immediately and are reflected across the application.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMachine} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machine-name">Name</Label>
                <Input
                  id="machine-name"
                  value={formData.name}
                  onChange={(event) => updateFormField('name', event.target.value)}
                  placeholder="AXH063"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-category">Category</Label>
                <Input
                  id="machine-category"
                  value={formData.category}
                  onChange={(event) => updateFormField('category', event.target.value)}
                  placeholder="AXH Assembly"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-type">Type</Label>
                <Input
                  id="machine-type"
                  value={formData.type}
                  onChange={(event) => updateFormField('type', event.target.value)}
                  placeholder="Assembly Machine"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormField('status', value as MachineStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Criticality</Label>
                <Select
                  value={formData.criticality || 'not-set'}
                  onValueChange={(value) =>
                    updateFormField('criticality', value === 'not-set' ? '' : (value as Machine['criticality']))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select criticality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-set">Not set</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-oem">OEM</Label>
                <Input
                  id="machine-oem"
                  value={formData.oem}
                  onChange={(event) => updateFormField('oem', event.target.value)}
                  placeholder="THK"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machine-controller">Controller</Label>
                <Input
                  id="machine-controller"
                  value={formData.controller}
                  onChange={(event) => updateFormField('controller', event.target.value)}
                  placeholder="Siemens S7-1500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-commissioned">Commissioned Date</Label>
                <Input
                  id="machine-commissioned"
                  type="date"
                  value={formData.commissionedDate}
                  onChange={(event) => updateFormField('commissionedDate', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-last-backup">Last Backup</Label>
                <Input
                  id="machine-last-backup"
                  type="date"
                  value={formData.lastBackup}
                  onChange={(event) => updateFormField('lastBackup', event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machine-power">Power</Label>
                <Input
                  id="machine-power"
                  value={formData.power}
                  onChange={(event) => updateFormField('power', event.target.value)}
                  placeholder="480V 3Ph"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-air">Air</Label>
                <Input
                  id="machine-air"
                  value={formData.air}
                  onChange={(event) => updateFormField('air', event.target.value)}
                  placeholder="90 PSI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-network">Network</Label>
                <Input
                  id="machine-network"
                  value={formData.network}
                  onChange={(event) => updateFormField('network', event.target.value)}
                  placeholder="192.168.10.45"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machine-target">Today Target</Label>
                <Input
                  id="machine-target"
                  type="number"
                  value={formData.todayTarget}
                  onChange={(event) => updateFormField('todayTarget', event.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-actual">Today Actual</Label>
                <Input
                  id="machine-actual"
                  type="number"
                  value={formData.todayActual}
                  onChange={(event) => updateFormField('todayActual', event.target.value)}
                  placeholder="487"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-scrap">Today Scrap</Label>
                <Input
                  id="machine-scrap"
                  type="number"
                  value={formData.todayScrap}
                  onChange={(event) => updateFormField('todayScrap', event.target.value)}
                  placeholder="8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machine-oee">OEE (%)</Label>
                <Input
                  id="machine-oee"
                  type="number"
                  step="0.1"
                  value={formData.oee}
                  onChange={(event) => updateFormField('oee', event.target.value)}
                  placeholder="87.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-mtbf">MTBF (hours)</Label>
                <Input
                  id="machine-mtbf"
                  type="number"
                  step="0.1"
                  value={formData.mtbf}
                  onChange={(event) => updateFormField('mtbf', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine-mttr">MTTR (hours)</Label>
                <Input
                  id="machine-mttr"
                  type="number"
                  step="0.1"
                  value={formData.mttr}
                  onChange={(event) => updateFormField('mttr', event.target.value)}
                />
              </div>
            </div>

            {formData.status === 'down' && (
              <div className="space-y-2">
                <Label htmlFor="machine-down-reason">Downtime Reason</Label>
                <Textarea
                  id="machine-down-reason"
                  value={formData.downReason}
                  onChange={(event) => updateFormField('downReason', event.target.value)}
                  rows={3}
                  placeholder="Describe the downtime reason"
                />
              </div>
            )}

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={savingEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Work Order Dialog */}
      <CreateWorkOrderDialog
        open={createWorkOrderDialogOpen}
        onOpenChange={setCreateWorkOrderDialogOpen}
        prefilledMachine={machineDetails}
      />

      {/* Upload Document Dialog */}
      <UploadDocumentDialog
        open={uploadDocumentDialogOpen}
        onOpenChange={setUploadDocumentDialogOpen}
        prefilledMachineId={machineDetails.id}
      />

      {/* Add Note Dialog */}
      <AddNoteDialog
        open={addNoteDialogOpen}
        onOpenChange={setAddNoteDialogOpen}
      />

      {/* Log Event Dialog */}
      <LogEventDialog
        open={logEventDialogOpen}
        onOpenChange={setLogEventDialogOpen}
      />

      {/* Create ECO Dialog */}
      <CreateECODialog
        open={createECODialogOpen}
        onOpenChange={setCreateECODialogOpen}
        prefilledMachine={machineDetails}
      />
    </div>
  );
}
