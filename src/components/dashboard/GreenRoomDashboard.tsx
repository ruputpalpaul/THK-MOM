import { useState, useEffect } from 'react';
import { Machine, ECO, WorkOrder, Event, Document } from '../../types/green-room';
import * as api from '../../utils/api';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Server, AlertTriangle, Wrench, Clock, FileText } from 'lucide-react';

interface GreenRoomDashboardProps {
  selectedMachine?: Machine | null;
  onMachineSelect?: (machine: Machine | null) => void;
  onViewMachineDetails?: (machine: Machine) => void;
  onViewECODetails?: (eco: ECO) => void;
  onBackupMachine?: (machine: Machine) => void;
  onViewWorkOrderDetails?: (workOrder: WorkOrder) => void;
  machineFilterTerm?: string;
  onMachineFilterChange?: (term: string) => void;
}

type Category = { name: string; count: number };

export function GreenRoomDashboard({ selectedMachine, onMachineSelect, onViewMachineDetails, onViewECODetails, onBackupMachine, onViewWorkOrderDetails, machineFilterTerm = '', onMachineFilterChange }: GreenRoomDashboardProps) {
  const [oldBackupsDialogOpen, setOldBackupsDialogOpen] = useState(false);
  const [downMachinesDialogOpen, setDownMachinesDialogOpen] = useState(false);
  const [pendingWOsDialogOpen, setPendingWOsDialogOpen] = useState(false);
  const [ecosDialogOpen, setEcosDialogOpen] = useState(false);
  
  const [machines, setMachines] = useState<Machine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [ecos, setECOs] = useState<ECO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states for each tab
  const [documentFilterTerm, setDocumentFilterTerm] = useState('');
  const [eventFilterTerm, setEventFilterTerm] = useState('');
  const [maintenanceFilterTerm, setMaintenanceFilterTerm] = useState('');
  const [changeFilterTerm, setChangeFilterTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [machinesData, categoriesData, eventsData, workOrdersData, documentsData, ecosData] = await Promise.all([
          api.getMachines(),
          api.getCategories(),
          api.getEvents(),
          api.getWorkOrders(),
          api.getDocuments(),
          api.getECOs(),
        ]);
        
        setMachines(machinesData);
        setCategories(categoriesData);
        setEvents(eventsData);
        setWorkOrders(workOrdersData);
        setDocuments(documentsData);
        setECOs(ecosData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Filter machines based on search term
  const filteredMachines = machineFilterTerm.trim() ? machines.filter(machine => 
    machine.name.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    machine.category.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    machine.id.toLowerCase().includes(machineFilterTerm.toLowerCase()) ||
    (machine.oem && machine.oem.toLowerCase().includes(machineFilterTerm.toLowerCase()))
  ) : machines;

  // Filter documents based on search term
  const filteredDocuments = documentFilterTerm.trim() ? documents.filter(document => 
    document.name.toLowerCase().includes(documentFilterTerm.toLowerCase()) ||
    document.type.toLowerCase().includes(documentFilterTerm.toLowerCase()) ||
    document.machineName.toLowerCase().includes(documentFilterTerm.toLowerCase()) ||
    (document.version && document.version.toLowerCase().includes(documentFilterTerm.toLowerCase()))
  ) : documents;

  // Filter events based on search term
  const filteredEvents = eventFilterTerm.trim() ? events.filter(event => 
    event.description.toLowerCase().includes(eventFilterTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(eventFilterTerm.toLowerCase()) ||
    event.machineName.toLowerCase().includes(eventFilterTerm.toLowerCase())
  ) : events;

  // Filter work orders based on search term
  const filteredWorkOrders = maintenanceFilterTerm.trim() ? workOrders.filter(wo => 
    wo.id.toLowerCase().includes(maintenanceFilterTerm.toLowerCase()) ||
    wo.description.toLowerCase().includes(maintenanceFilterTerm.toLowerCase()) ||
    wo.type.toLowerCase().includes(maintenanceFilterTerm.toLowerCase()) ||
    wo.status.toLowerCase().includes(maintenanceFilterTerm.toLowerCase()) ||
    wo.machineName.toLowerCase().includes(maintenanceFilterTerm.toLowerCase())
  ) : workOrders;

  // Filter ECOs based on search term
  const filteredECOs = changeFilterTerm.trim() ? ecos.filter(eco => 
    eco.number.toLowerCase().includes(changeFilterTerm.toLowerCase()) ||
    eco.description.toLowerCase().includes(changeFilterTerm.toLowerCase()) ||
    eco.status.toLowerCase().includes(changeFilterTerm.toLowerCase()) ||
    eco.machineName.toLowerCase().includes(changeFilterTerm.toLowerCase())
  ) : ecos;

  const activeMachines = filteredMachines.filter(m => m.status === 'active').length;
  
  const downMachinesList = filteredMachines.filter(m => m.status === 'down' || m.status === 'maintenance');
  const downMachines = downMachinesList.length;
  
  const pendingWOsList = workOrders.filter(wo => wo.status !== 'completed');
  const pendingWOs = pendingWOsList.length;
  
  const ecosInReviewList = ecos.filter(eco => eco.status === 'review');
  const ecosInReview = ecosInReviewList.length;
  
  const oldBackupsMachines = filteredMachines.filter((m: Machine) => 
    m.lastBackup && m.lastBackup !== 'N/A' && 
    new Date(m.lastBackup) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  );
  
  const oldBackups = oldBackupsMachines.length;

  const getMachinesByCategory = (categoryName: string) => {
    return filteredMachines.filter(m => m.category === categoryName);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white overflow-auto">
      {/* Main Content */}
      <div className="w-full">
        <div className="p-4 sm:p-6 space-y-8 pb-24">
          {/* Overview Panel */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
              System Overview
            </h2>
            
            {/* Status Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <StatusTile
                title={machineFilterTerm ? "Filtered Machines" : "Total Machines"}
                value={filteredMachines.length}
                icon={Server}
                variant="default"
              />
              <StatusTile
                title="Active Machines"
                value={activeMachines}
                icon={Server}
                variant="success"
                subtitle={`${downMachines} down`}
                onClick={() => setDownMachinesDialogOpen(true)}
              />
              <StatusTile
                title="Pending Maintenance"
                value={pendingWOs}
                icon={Wrench}
                variant={pendingWOs > 3 ? 'warning' : 'default'}
                subtitle="Work Orders"
                onClick={() => setPendingWOsDialogOpen(true)}
              />
              <StatusTile
                title="ECOs in Review"
                value={ecosInReview}
                icon={FileText}
                variant="default"
                onClick={() => setEcosDialogOpen(true)}
              />
              <StatusTile
                title="Old Backups"
                value={oldBackups}
                icon={AlertTriangle}
                variant={oldBackups > 0 ? 'danger' : 'success'}
                subtitle=">6 months"
                onClick={() => setOldBackupsDialogOpen(true)}
              />
            </div>

            {/* Machine Filter */}
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
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => onMachineFilterChange?.('')}
                  >
                    ✕
                  </Button>
                )}
              </div>
              {machineFilterTerm && (
                <p className="text-sm text-blue-700 mt-2">
                  <span className="font-semibold">Filtered:</span> Showing {filteredMachines.length} of {machines.length} machines
                </p>
              )}
            </div>

            {/* Floor Map */}
            <Card className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 border-2">
              <FloorMapView
                machines={filteredMachines}
                onMachineClick={(machine) => {
                  onMachineSelect?.(machine);
                }}
                selectedMachineId={selectedMachine?.id}
              />
            </Card>
          </div>

          {/* Machine Sections */}
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3 sm:mr-4"></div>
              Machine Sections
            </h2>
            <Accordion type="multiple" defaultValue={[]} className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 w-full">
              {categories.map(category => {
                const categoryMachines = getMachinesByCategory(category.name);
                const activeCount = categoryMachines.filter(m => m.status === 'active').length;
                const downCount = categoryMachines.filter(m => m.status === 'down').length;
                const maintenanceCount = categoryMachines.filter(m => m.status === 'maintenance').length;

                return (
                  <AccordionItem key={category.name} value={category.name} className="border-2 border-gray-200 rounded-xl bg-gradient-to-r from-white to-gray-50 px-4 sm:px-6 py-2 hover:border-gray-300 transition-colors">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4 gap-2 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                          <span className="text-base sm:text-lg font-bold text-gray-900 truncate">{category.name}</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 border-2 font-semibold w-fit">
                            {category.count} machines
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-end">
                          {activeCount > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border-2 font-semibold text-xs sm:text-sm">
                              {activeCount} active
                            </Badge>
                          )}
                          {maintenanceCount > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 border-2 font-semibold text-xs sm:text-sm">
                              {maintenanceCount} maintenance
                            </Badge>
                          )}
                          {downCount > 0 && (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-200 border-2 font-semibold text-xs sm:text-sm">
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
                            onSelect={(machine) => onMachineSelect?.(machine)}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {/* Quick Access Tabs */}
          <div className="mt-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
              Quick Access
            </h2>
            <Card className="border-2 bg-white p-4 mb-8 w-full">
              <Tabs defaultValue="documents" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-12 bg-gray-50 rounded-lg mb-4 p-1 gap-1 overflow-x-auto">
                  <TabsTrigger value="documents" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Documents</TabsTrigger>
                  <TabsTrigger value="events" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Events</TabsTrigger>
                  <TabsTrigger value="maintenance" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Maintenance</TabsTrigger>
                  <TabsTrigger value="changes" className="font-semibold text-xs sm:text-sm data-[state=active]:bg-pink-600 data-[state=active]:text-white whitespace-nowrap px-2 py-2">Changes</TabsTrigger>
                </TabsList>

              <TabsContent value="documents" className="mt-0 w-full">
                <div className="space-y-6 w-full">
                  {/* Filter Input */}
                  <div className="mb-4">
                    <Input
                      placeholder="Filter documents by name, type, machine, or version..."
                      value={documentFilterTerm}
                      onChange={(e) => setDocumentFilterTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Program Backups */}
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
                                <p className="text-xs text-muted-foreground">
                                  {doc.machineName} • {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-3">No program backups available</p>
                      )}
                    </div>
                  </div>

                  {/* Operator Manual */}
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
                                <p className="text-xs text-muted-foreground">
                                  {doc.machineName} • {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-3">No operator manuals available</p>
                      )}
                    </div>
                  </div>

                  {/* Drawings */}
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
                                <p className="text-xs text-muted-foreground">
                                  {doc.machineName} • {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
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
                  {/* Filter Input */}
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
                          <p className="text-xs text-muted-foreground">
                            {event.machineName} • {event.timestamp}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        event.type === 'fault' ? 'destructive' : 
                        event.type === 'downtime' ? 'secondary' : 'default'
                      }>
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="mt-0 w-full">
                <div className="space-y-3 w-full">
                  {/* Filter Input */}
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
                          <p className="text-xs text-muted-foreground">
                            {wo.machineName} • Due: {wo.dueDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={wo.type === 'Emergency' ? 'destructive' : 'secondary'}>
                          {wo.type}
                        </Badge>
                        <Badge variant="outline">{wo.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="changes" className="mt-0 w-full">
                <div className="space-y-3 w-full">
                  {/* Filter Input */}
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
                          <p className="text-xs text-muted-foreground">
                            {eco.machineName} • {eco.date}
                          </p>
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
      </div>



      {/* Old Backups Dialog */}
      <OldBackupsDialog
        machines={oldBackupsMachines}
        open={oldBackupsDialogOpen}
        onOpenChange={setOldBackupsDialogOpen}
        onBackupMachine={(machine) => {
          setOldBackupsDialogOpen(false);
          onBackupMachine?.(machine);
        }}
      />

      {/* Down Machines Dialog */}
      <DownMachinesDialog
        machines={downMachinesList}
        open={downMachinesDialogOpen}
        onOpenChange={setDownMachinesDialogOpen}
        onViewMachineDetails={onViewMachineDetails}
      />

      {/* Pending Work Orders Dialog */}
      <PendingWorkOrdersDialog
        workOrders={pendingWOsList}
        open={pendingWOsDialogOpen}
        onOpenChange={setPendingWOsDialogOpen}
        onViewWorkOrderDetails={onViewWorkOrderDetails}
      />

      {/* ECOs in Review Dialog */}
      <ECOsInReviewDialog
        ecos={ecosInReviewList}
        open={ecosDialogOpen}
        onOpenChange={setEcosDialogOpen}
        onViewDetails={onViewECODetails}
      />
    </div>
  );
}
