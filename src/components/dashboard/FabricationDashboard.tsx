import { useEffect, useMemo, useState } from 'react';
import * as mockData from '@/data/mock-data';
import { ECO, Machine, WorkOrder } from '@/types/green-room';
import { StatusTile } from './StatusTile';
import { FloorMapView } from './FloorMapView';
import { MachineCard } from '../machine/MachineCard';
import { OldBackupsDialog } from '../dialogs/OldBackupsDialog';
import { DownMachinesDialog } from '../dialogs/DownMachinesDialog';
import { PendingWorkOrdersDialog } from '../dialogs/PendingWorkOrdersDialog';
import { ECOsInReviewDialog } from '../dialogs/ECOsInReviewDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Server, AlertTriangle, Wrench, FileText, Clock } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface Props {
  selectedMachine?: Machine | null;
  onMachineSelect?: (machine: Machine | null) => void;
  onViewMachineDetails?: (machine: Machine) => void;
  onViewECODetails?: (eco: ECO) => void;
  onBackupMachine?: (machine: Machine) => void;
  onViewWorkOrderDetails?: (workOrder: WorkOrder) => void;
  machineFilterTerm?: string;
  onMachineFilterChange?: (term: string) => void;
}

export const FABRICATION_CATEGORIES = new Set([
  'Block Grinding',
  'Cutting',
  'Drilling',
  'Injection Molding',
  'Straightening',
  'Wash',
  'CNC Cutting',
]);

export function FabricationDashboard({ selectedMachine, onMachineSelect, onViewMachineDetails, onViewECODetails, onBackupMachine, onViewWorkOrderDetails, machineFilterTerm = '', onMachineFilterChange }: Props) {
  const [oldBackupsDialogOpen, setOldBackupsDialogOpen] = useState(false);
  const [downMachinesDialogOpen, setDownMachinesDialogOpen] = useState(false);
  const [pendingWOsDialogOpen, setPendingWOsDialogOpen] = useState(false);
  const [ecosDialogOpen, setEcosDialogOpen] = useState(false);

  const [machines, setMachines] = useState<Machine[]>([]);
  // const [events, setEvents] = useState<Event[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  // const [documents, setDocuments] = useState<Document[]>([]);
  const [ecos, setECOs] = useState<ECO[]>([]);
  const [documentFilterTerm, setDocumentFilterTerm] = useState('');
  const [eventFilterTerm, setEventFilterTerm] = useState('');
  const [maintenanceFilterTerm, setMaintenanceFilterTerm] = useState('');
  const [changeFilterTerm, setChangeFilterTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [handoffNote, setHandoffNote] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; text: string; pinned?: boolean; ts: number }>>([]);

  useEffect(() => {
    // Strictly local data only
    const fabricationMachines = mockData.machines.filter(m => FABRICATION_CATEGORIES.has(m.category));
    setMachines(fabricationMachines);
    setWorkOrders(mockData.workOrders);
    setECOs(mockData.ecos);
    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('notes:area:fabrication');
      if (stored) setNotes(JSON.parse(stored));
    } catch (err) {
      console.warn('Failed to load fabrication notes', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('notes:area:fabrication', JSON.stringify(notes));
    } catch (err) {
      console.warn('Failed to save fabrication notes', err);
    }
  }, [notes]);

  // Filtering logic
  const filteredMachines = machineFilterTerm.trim() ? machines.filter(machine =>
    machine.name.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    machine.category.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    machine.id.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    (machine.oem && machine.oem.toLowerCase().includes(machineFilterTerm.toLowerCase()))
  ) : machines;

  const activeMachines = filteredMachines.filter(m => m.status === 'active').length;
  const downMachinesList = filteredMachines.filter(m => m.status === 'down' || m.status === 'maintenance');
  const downMachines = downMachinesList.length;
  const pendingWOsList = workOrders.filter(wo => wo.status !== 'completed');
  const pendingWOs = pendingWOsList.length;
  const ecosInReviewList = ecos.filter(eco => eco.status === 'review');
  const ecosInReview = ecosInReviewList.length;
  const oldBackupsMachines = filteredMachines.filter((m: Machine) => m.lastBackup && m.lastBackup !== 'N/A' && new Date(m.lastBackup) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000));
  const oldBackups = oldBackupsMachines.length;

  const getMachinesByCategory = (categoryName: string) => filteredMachines.filter(m => m.category === categoryName);
  const categories = useMemo(() => {
    // Build category list dynamically from present fabrication categories
    const map = new Map<string, number>();
    for (const m of filteredMachines) {
      map.set(m.category, (map.get(m.category) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [filteredMachines]);

  // Lines Utilization (per category): based on today target/actual; down minutes from productionData
  const linesUtilization = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    const byCat: Record<string, { target: number; actual: number; downMin: number } > = {};
    for (const m of filteredMachines) {
      const cat = m.category;
      if (!byCat[cat]) byCat[cat] = { target: 0, actual: 0, downMin: 0 };
      byCat[cat].target += m.todayTarget || 0;
      byCat[cat].actual += m.todayActual || 0;
      const pd = mockData.productionData.find(p => p.machineId === m.id && p.date === today);
      if (pd) byCat[cat].downMin += pd.downtime;
    }
    return Object.entries(byCat).map(([category, v]) => ({
      category,
      util: Math.round((v.actual / Math.max(v.target, 1)) * 100),
      downMin: v.downMin,
    }));
  }, [filteredMachines]);

  // Build production machine ID set for filtering related records
  const fabricationMachineIds = useMemo(() => new Set(machines.map(m => m.id)), [machines]);

  // Quick Access filtered datasets
  const filteredDocuments = useMemo(() => {
    const all = mockData.documents.filter(d => fabricationMachineIds.has(d.machineId));
    if (!documentFilterTerm.trim()) return all;
    const q = documentFilterTerm.toLowerCase();
    return all.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.machineName.toLowerCase().includes(q) ||
      (d.version?.toLowerCase().includes(q) ?? false)
    );
  }, [documentFilterTerm, fabricationMachineIds]);

  const filteredEvents = useMemo(() => {
    const all = mockData.events.filter(e => fabricationMachineIds.has(e.machineId));
    if (!eventFilterTerm.trim()) return all;
    const q = eventFilterTerm.toLowerCase();
    return all.filter(e =>
      e.description.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.machineName.toLowerCase().includes(q)
    );
  }, [eventFilterTerm, fabricationMachineIds]);

  const filteredWorkOrders = useMemo(() => {
    const all = workOrders.filter(wo => fabricationMachineIds.has(wo.machineId));
    if (!maintenanceFilterTerm.trim()) return all;
    const q = maintenanceFilterTerm.toLowerCase();
    return all.filter(wo =>
      wo.id.toLowerCase().includes(q) ||
      wo.description.toLowerCase().includes(q) ||
      wo.type.toLowerCase().includes(q) ||
      wo.status.toLowerCase().includes(q) ||
      wo.machineName.toLowerCase().includes(q)
    );
  }, [maintenanceFilterTerm, workOrders, fabricationMachineIds]);

  const filteredECOs = useMemo(() => {
    const all = ecos.filter(eco => fabricationMachineIds.has(eco.machineId));
    if (!changeFilterTerm.trim()) return all;
    const q = changeFilterTerm.toLowerCase();
    return all.filter(eco =>
      eco.number.toLowerCase().includes(q) ||
      eco.description.toLowerCase().includes(q) ||
      eco.status.toLowerCase().includes(q) ||
      eco.machineName.toLowerCase().includes(q)
    );
  }, [changeFilterTerm, ecos, fabricationMachineIds]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background overflow-auto">
      <div className="p-4 sm:p-6 space-y-8 pb-24">
        {/* Overview tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <StatusTile title={machineFilterTerm ? "Filtered Machines" : "Fabrication Machines"} value={filteredMachines.length} icon={Server} variant="default" />
          <StatusTile title="Active" value={activeMachines} icon={Server} variant="success" subtitle={`${downMachines} down`} onClick={() => setDownMachinesDialogOpen(true)} />
          <StatusTile title="Pending Maintenance" value={pendingWOs} icon={Wrench} variant={pendingWOs > 3 ? 'warning' : 'default'} subtitle="Work Orders" onClick={() => setPendingWOsDialogOpen(true)} />
          <StatusTile title="ECOs in Review" value={ecosInReview} icon={FileText} variant="default" onClick={() => setEcosDialogOpen(true)} />
          <StatusTile title="Old Backups" value={oldBackups} icon={AlertTriangle} variant={oldBackups > 0 ? 'danger' : 'success'} subtitle=">6 months" onClick={() => setOldBackupsDialogOpen(true)} />
        </div>

        {/* Filter & Floor Map */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Input
              placeholder="Filter by machine name, category, or ID..."
              className="pl-3 pr-8"
              value={machineFilterTerm}
              onChange={(e) => onMachineFilterChange?.(e.target.value)}
            />
            {machineFilterTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                onClick={() => onMachineFilterChange?.('')}
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {filteredMachines.length === 0 ? (
          <Card className="p-6 bg-card border">
            <div className="text-center py-10">
              <p className="text-muted-foreground">No fabrication machines match the current filter.</p>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => onMachineFilterChange?.('')}>Clear filter</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-card border">
            <FloorMapView
              machines={filteredMachines}
              onMachineClick={(machine) => {
                onMachineSelect?.(machine);
              }}
              selectedMachineId={selectedMachine?.id}
            />
          </Card>
        )}

        {/* Lines Utilization */}
  <Card className="p-6 bg-card border">
          <h3 className="text-base font-semibold mb-4">Lines Utilization</h3>
          {linesUtilization.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {linesUtilization.map(item => (
                <div key={item.category} className="border rounded-lg p-3 bg-muted">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{item.category}</div>
                    <div className="text-sm">{item.util}%</div>
                  </div>
                  <div className="w-full bg-muted rounded h-2 mt-2">
                    <div className="h-2 bg-primary rounded" style={{ width: `${Math.min(item.util,100)}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Down: {item.downMin} min</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Machine Sections by Category */}
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center">
            <div className="w-1 h-6 sm:h-8 bg-primary rounded-full mr-3 sm:mr-4"></div>
            Fabrication Sections
          </h2>
          <Accordion type="multiple" defaultValue={[]} className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 w-full">
            {categories.map(category => {
              const categoryMachines = getMachinesByCategory(category.name);
              const activeCount = categoryMachines.filter(m => m.status === 'active').length;
              const downCount = categoryMachines.filter(m => m.status === 'down').length;
              const maintenanceCount = categoryMachines.filter(m => m.status === 'maintenance').length;

              return (
                <AccordionItem key={category.name} value={category.name} className="border rounded-xl bg-card px-4 sm:px-6 py-2 transition-colors">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base sm:text-lg font-bold text-foreground truncate">{category.name}</span>
                        <Badge variant="secondary" className="font-semibold w-fit">
                          {category.count} machines
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-end">
                        {activeCount > 0 && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 border-2 font-semibold text-xs sm:text-sm">
                            {activeCount} active
                          </Badge>
                        )}
                        {maintenanceCount > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 border-2 font-semibold text-xs sm:text-sm">
                            {maintenanceCount} maintenance
                          </Badge>
                        )}
                        {downCount > 0 && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 border-2 font-semibold text-xs sm:text-sm">
                            {downCount} down
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 px-2 sm:px-0">
                      {categoryMachines.map(machine => (
                        <MachineCard
                          key={machine.id}
                          machine={machine}
                          onSelect={(m) => onMachineSelect?.(m)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Shift Handoff Notes */}
  <Card className="p-6 bg-card border">
          <h3 className="text-base font-semibold mb-3">Shift Handoff Notes</h3>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Add a note for next shift..." value={handoffNote} onChange={(e) => setHandoffNote(e.target.value)} />
            <Button size="sm" onClick={() => { if (!handoffNote.trim()) return; setNotes(prev => [{ id: crypto.randomUUID?.() || String(Date.now()), text: handoffNote.trim(), ts: Date.now() }, ...prev]); setHandoffNote(''); }}>Add</Button>
          </div>
          <div className="grid gap-2">
            {notes.map(n => (
              <div key={n.id} className="border rounded p-2 bg-muted flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{new Date(n.ts).toLocaleString()}</div>
                  <div className="text-muted-foreground text-sm">{n.text}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant={n.pinned? 'secondary':'outline'} onClick={() => setNotes(prev => prev.map(x => x.id===n.id? { ...x, pinned: !x.pinned }: x))}>{n.pinned? 'Unpin':'Pin'}</Button>
                  <Button size="sm" variant="outline" onClick={() => setNotes(prev => prev.filter(x => x.id!==n.id))}>Remove</Button>
                </div>
              </div>
            ))}
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
          </div>
        </Card>

        {/* Quick Access Tabs (Fabrication context) */}
        <div className="mt-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full mr-4"></div>
            Quick Access
          </h2>
          <Card className="rounded-xl text-card-foreground shadow border-2 bg-white p-4 mb-8 w-full">
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-12 bg-gray-50 rounded-lg mb-4 p-1 gap-1 overflow-x-auto">
                <TabsTrigger value="documents" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Documents</TabsTrigger>
                <TabsTrigger value="events" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Events</TabsTrigger>
                <TabsTrigger value="maintenance" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Maintenance</TabsTrigger>
                <TabsTrigger value="changes" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-pink-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Changes</TabsTrigger>
              </TabsList>
              <TabsContent value="documents" className="mt-0 w-full">
                <div className="space-y-6 w-full">
                  <div className="mb-4">
                    <Input
                      placeholder="Filter documents by name, type, machine, or version..."
                      value={documentFilterTerm}
                      onChange={(e) => setDocumentFilterTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold">Program Backups</h3>
                    <div className="space-y-2">
                      {filteredDocuments.filter(d => d.type === 'Program Backup').length > 0 ? (
                        filteredDocuments.filter(d => d.type === 'Program Backup').map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.machineName} • {doc.uploadDate}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-3">No program backups available</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold">Operator Manual</h3>
                    <div className="space-y-2">
                      {filteredDocuments.filter(d => d.type === 'Operator Manual').length > 0 ? (
                        filteredDocuments.filter(d => d.type === 'Operator Manual').map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-orange-600" />
                              <div>
                                <p className="text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.machineName} • {doc.uploadDate}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-3">No operator manuals available</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold">Drawings</h3>
                    <div className="space-y-2">
                      {filteredDocuments.filter(d => d.type === 'Drawings').length > 0 ? (
                        filteredDocuments.filter(d => d.type === 'Drawings').map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.machineName} • {doc.uploadDate}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-3">No drawings available</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="events" className="mt-0 w-full">
                <div className="space-y-3 w-full">
                  <div className="mb-4">
                    <Input
                      placeholder="Filter events by description, type, or machine..."
                      value={eventFilterTerm}
                      onChange={(e) => setEventFilterTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {filteredEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground">{event.machineName} • {event.timestamp}</p>
                        </div>
                      </div>
                      <Badge variant={event.type === 'fault' ? 'destructive' : event.type === 'downtime' ? 'secondary' : 'default'}>
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="maintenance" className="mt-0 w-full">
                <div className="space-y-3 w-full">
                  <div className="mb-4">
                    <Input
                      placeholder="Filter work orders by ID, description, type, status, or machine..."
                      value={maintenanceFilterTerm}
                      onChange={(e) => setMaintenanceFilterTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {filteredWorkOrders.map(wo => (
                    <div key={wo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{wo.id}: {wo.description}</p>
                          <p className="text-xs text-muted-foreground">{wo.machineName} • Due: {wo.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={wo.type === 'Emergency' ? 'destructive' : 'secondary'}>{wo.type}</Badge>
                        <Badge variant="outline">{wo.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="changes" className="mt-0 w-full">
                <div className="space-y-3 w-full">
                  <div className="mb-4">
                    <Input
                      placeholder="Filter ECOs by number, description, status, or machine..."
                      value={changeFilterTerm}
                      onChange={(e) => setChangeFilterTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {filteredECOs.map(eco => (
                    <div key={eco.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{eco.number}: {eco.description}</p>
                          <p className="text-xs text-muted-foreground">{eco.machineName} • {eco.date}</p>
                        </div>
                      </div>
                      <Badge variant={eco.status === 'approved' ? 'default' : 'secondary'}>
                        {eco.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
  <OldBackupsDialog open={oldBackupsDialogOpen} onOpenChange={setOldBackupsDialogOpen} machines={oldBackupsMachines} onBackupMachine={onBackupMachine} />
  <DownMachinesDialog open={downMachinesDialogOpen} onOpenChange={setDownMachinesDialogOpen} machines={downMachinesList} onViewMachineDetails={onViewMachineDetails} />
  <PendingWorkOrdersDialog open={pendingWOsDialogOpen} onOpenChange={setPendingWOsDialogOpen} workOrders={pendingWOsList} onViewWorkOrderDetails={onViewWorkOrderDetails} />
  <ECOsInReviewDialog open={ecosDialogOpen} onOpenChange={setEcosDialogOpen} ecos={ecosInReviewList} onViewDetails={onViewECODetails} />
    </div>
  );
}
