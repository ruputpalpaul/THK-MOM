import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GreenRoomDashboard, GlobalSearch, HomeDashboard, FabricationDashboard, ShippingDashboard, MachineAreaBoard, ProductionOverviewDashboard } from '@/components/dashboard';
import { MachineDetailsPage, ECODetailsPage, WorkOrderDetailsPage, ShippingOrderDetailsPage } from '@/components/pages';
import { Machine, ECO, WorkOrder, ShippingOrder } from '@/types/green-room';
import * as mockData from '@/data/mock-data';
import * as api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Menu, FileUp, FileText, AlertCircle, ClipboardList, GitBranch, Home as HomeIcon, Factory, Package, Layers, Gauge } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AddNoteDialog } from './components/dialogs/AddNoteDialog';
import { CreateWorkOrderDialog } from './components/dialogs/CreateWorkOrderDialog';
import { LogEventDialog } from './components/dialogs/LogEventDialog';
import { UploadDocumentDialog } from './components/dialogs/UploadDocumentDialog';
import { UniversalMachineSidebar } from './components/machine/UniversalMachineSidebar';
import { ToolLifeEstimationPage } from './components/tooling/ToolLifeEstimationPage';
import { CreateECODialog } from './components/dialogs/CreateECODialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/providers/AuthProvider';
import { UserMenu } from '@/components/layout/UserMenu';
import { AlertCenter } from '@/components/layout/AlertCenter';
import type { PlantAreaKey, Capability } from '@/types/auth';

const ORDERED_AREAS: PlantAreaKey[] = ['home', 'production', 'green-room', 'fabrication', 'shipping', 'machines', 'tool-life'];
const AREA_CAPABILITIES: Record<PlantAreaKey, Capability> = {
  home: 'view:home',
  production: 'view:production',
  'green-room': 'view:green-room',
  fabrication: 'view:fabrication',
  shipping: 'view:shipping',
  machines: 'view:planner',
  'tool-life': 'view:analytics',
};
const MACHINE_FILTER_AREAS: PlantAreaKey[] = ['fabrication', 'green-room'];
type NavGroup = {
  title: string;
  items: Array<{ area: PlantAreaKey; label: string; icon: LucideIcon }>;
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ area: 'home', label: 'Home', icon: HomeIcon }],
  },
  {
    title: 'Plant Floor',
    items: [
      { area: 'production', label: 'Production', icon: Layers },
      { area: 'fabrication', label: 'Fabrication', icon: Factory },
      { area: 'green-room', label: 'Green Room', icon: Factory },
      { area: 'shipping', label: 'Shipping', icon: Package },
    ],
  },
  {
    title: 'Management',
    items: [
      { area: 'machines', label: 'Machine Planner', icon: Factory },
      { area: 'tool-life', label: 'Tool Life', icon: Gauge },
    ],
  },
];

export default function App() {
  const { currentUser, preferences, updatePreferences, hasCapability } = useAuth();
  const allowedAreas = useMemo<PlantAreaKey[]>(() => {
    return ORDERED_AREAS.filter(areaKey => {
      const capability = AREA_CAPABILITIES[areaKey];
      return currentUser.capabilities.includes(capability);
    });
  }, [currentUser.capabilities]);

  const derivedDefaultArea = useMemo<PlantAreaKey>(() => {
    if (preferences.defaultArea && allowedAreas.includes(preferences.defaultArea)) {
      return preferences.defaultArea;
    }
    return allowedAreas[0] ?? 'home';
  }, [allowedAreas, preferences.defaultArea]);

  const [selectedMachineDetails, setSelectedMachineDetails] = useState<Machine | null>(null);
  const [selectedECODetails, setSelectedECODetails] = useState<ECO | null>(null);
  const [selectedWorkOrderDetails, setSelectedWorkOrderDetails] = useState<WorkOrder | null>(null);
  const [selectedShippingOrder, setSelectedShippingOrder] = useState<ShippingOrder | null>(null);
  const [selectedSidebarMachine, setSelectedSidebarMachine] = useState<Machine | null>(null);
  const [sidebarMachine, setSidebarMachine] = useState<Machine | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [workOrderDialogOpen, setWorkOrderDialogOpen] = useState(false);
  const [ecoDialogOpen, setEcoDialogOpen] = useState(false);
  const [prefilledECO, setPrefilledECO] = useState<ECO | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [prefilledBackupMachine, setPrefilledBackupMachine] = useState<Machine | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [area, setArea] = useState<PlantAreaKey>(derivedDefaultArea);
  const AREA_LABELS: Record<PlantAreaKey, string> = {
    home: 'Home',
    production: 'Production Overview',
    fabrication: 'Fabrication',
    'green-room': 'Green Room',
    shipping: 'Shipping',
    machines: 'Machine Planner',
    'tool-life': 'Tool Life Estimation',
  };
  const [machineFilterTerm, setMachineFilterTerm] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => {
    if (!allowedAreas.includes(area)) {
      setArea(derivedDefaultArea);
    }
  }, [allowedAreas, area, derivedDefaultArea]);

  useEffect(() => {
    if (preferences.defaultArea !== area) {
      updatePreferences({ defaultArea: area });
    }
  }, [area, preferences.defaultArea, updatePreferences]);

  useEffect(() => {
    const storedFilters = preferences.machineFilters ?? {};
    const nextFilter = storedFilters[area] ?? '';
    setMachineFilterTerm(nextFilter);
  }, [area, preferences.machineFilters]);

  const handleMachineFilterChange = useCallback(
    (value: string) => {
      setMachineFilterTerm(value);
      if (MACHINE_FILTER_AREAS.includes(area)) {
        updatePreferences({
          machineFilters: {
            ...(preferences.machineFilters ?? {}),
            [area]: value,
          },
        });
      }
    },
    [area, preferences.machineFilters, updatePreferences],
  );

  const resetDetailSelections = useCallback(() => {
    setSelectedMachineDetails(null);
    setSelectedECODetails(null);
    setSelectedWorkOrderDetails(null);
    setSelectedShippingOrder(null);
    setSidebarMachine(null);
    setSelectedSidebarMachine(null);
    setPrefilledECO(null);
    setPrefilledBackupMachine(null);
    setUploadDialogOpen(false);
    setNoteDialogOpen(false);
    setEventDialogOpen(false);
    setWorkOrderDialogOpen(false);
    setEcoDialogOpen(false);
  }, []);

  const navigateToArea = useCallback(
    (nextArea: PlantAreaKey) => {
      if (!allowedAreas.includes(nextArea)) {
        return;
      }
      resetDetailSelections();
      setArea(nextArea);
      setNavOpen(false);
    },
    [allowedAreas, resetDetailSelections],
  );

  // Fabrication machine IDs for contextual dialogs
  const fabricationCategories = new Set([
    'Block Grinding',
    'Cutting',
    'Drilling',
    'Injection Molding',
    'Straightening',
    'Wash',
    'CNC Cutting',
  ]);
  const fabricationMachineIds = mockData.machines
    .filter(m => fabricationCategories.has(m.category))
    .map(m => m.id);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize the database with mock data
        await api.initializeDatabase({
          machines: mockData.machines,
          events: mockData.events,
          workOrders: mockData.workOrders,
          documents: mockData.documents,
          ecos: mockData.ecos,
          components: mockData.components,
          machineSettings: mockData.machineSettings,
          productionData: mockData.productionData,
          categories: mockData.categories,
        });

        console.log('Database initialized successfully');
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsInitializing(false);
      }
    }

    initializeApp();
  }, []);

  const handleAddWorkOrder = async (workOrder: WorkOrder) => {
    try {
      await api.createWorkOrder(workOrder);
      setWorkOrders(prev => [...prev, workOrder]);
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  };

  const handleMachineUpdated = (updated: Machine) => {
    setSelectedMachineDetails(updated);
    setSidebarMachine(prev => (prev && prev.id === updated.id ? updated : prev));
    setSelectedSidebarMachine(prev => (prev && prev.id === updated.id ? updated : prev));
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2">Initializing THK-MOM</h2>
          <p className="text-muted-foreground">Loading manufacturing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-full bg-background flex flex-col">
      {/* Top Navigation Bar - Sticky */}
      <header className="sticky top-0 z-50 border-b border-border bg-background px-4 py-3 w-full">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button + Sheet Navigation */}
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setNavOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <SheetContent side="left" className="p-0 w-72 gap-0 content-start">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Plant Areas</SheetTitle>
              </SheetHeader>
              <nav className="px-2 py-1">
                <div className="space-y-4">
                  {NAV_GROUPS.map((group, groupIndex) => {
                    const visibleItems = group.items.filter(item => allowedAreas.includes(item.area));
                    if (visibleItems.length === 0) return null;

                    return (
                      <div key={group.title} className="space-y-1">
                        {group.title !== 'Overview' && (
                          <h4 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {group.title}
                          </h4>
                        )}
                        <ul className="space-y-1">
                          {visibleItems.map(item => {
                            const Icon = item.icon;
                            return (
                              <li key={item.area}>
                                <Button
                                  variant={area === item.area ? 'secondary' : 'ghost'}
                                  className="w-full justify-start gap-2"
                                  onClick={() => navigateToArea(item.area)}
                                >
                                  <Icon className="w-4 h-4" /> {item.label}
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                        {groupIndex < NAV_GROUPS.length - 1 && <div className="my-2 border-t border-border/50" />}
                      </div>
                    );
                  })}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* App Title */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">THK-MOM</h1>
            <p className="text-sm text-muted-foreground">
              Manufacturing Overview Model • {AREA_LABELS[area]}
            </p>
          </div>

          {/* Quick Actions / User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {hasCapability('manage:documents') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              )}
              {hasCapability('manage:notes') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => setNoteDialogOpen(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Note
                </Button>
              )}
              {hasCapability('manage:events') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => setEventDialogOpen(true)}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Event
                </Button>
              )}
              {hasCapability('manage:workorders') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => setWorkOrderDialogOpen(true)}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Work Order
                </Button>
              )}
              {hasCapability('manage:ecos') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => setEcoDialogOpen(true)}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  ECO
                </Button>
              )}
            </div>
            <AlertCenter />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Content Container */}
        <div className="flex-1 w-full">
          {/* Header */}
          <AnimatePresence mode="wait">
            {!selectedMachineDetails && !selectedECODetails && !selectedWorkOrderDetails && !selectedShippingOrder && (
              <motion.header
                key="dashboard-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="border-b border-border bg-background w-full"
              >
                <div className="p-4 sm:p-6 space-y-4 w-full max-w-full">
                  {/* Title */}
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{AREA_LABELS[area]}</h1>
                    <p className="text-muted-foreground">Manufacturing Overview Model</p>
                  </div>

                  {/* Global Search */}
                  <GlobalSearch
                    onMachineSelect={setSelectedMachineDetails}
                    onECOSelect={setSelectedECODetails}
                    onWorkOrderSelect={setSelectedWorkOrderDetails}
                  />
                </div>
              </motion.header>
            )}
          </AnimatePresence>



          {/* Content */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait" initial={false}>
              {selectedMachineDetails ? (
                <motion.div
                  key="machine-details-page"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  className="min-h-full"
                >
                  <MachineDetailsPage
                    machine={selectedMachineDetails}
                    onBack={() => {
                      setSelectedMachineDetails(null);
                    }}
                    onMachineUpdated={handleMachineUpdated}
                  />
                </motion.div>
              ) : selectedECODetails ? (
                <motion.div
                  key="eco-details-page"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  className="min-h-full"
                >
                  <ECODetailsPage
                    eco={selectedECODetails}
                    workOrders={workOrders}
                    onBack={() => {
                      setSelectedECODetails(null);
                    }}
                    onCreateWorkOrder={(eco) => {
                      setPrefilledECO(eco);
                      setWorkOrderDialogOpen(true);
                    }}
                  />
                </motion.div>
              ) : selectedWorkOrderDetails ? (
                <motion.div
                  key="workorder-details-page"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  className="min-h-full"
                >
                  <WorkOrderDetailsPage
                    workOrder={selectedWorkOrderDetails}
                    onBack={() => {
                      setSelectedWorkOrderDetails(null);
                    }}
                  />
                </motion.div>
              ) : selectedShippingOrder ? (
                <motion.div
                  key="shipping-order-details-page"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  className="min-h-full"
                >
                  <ShippingOrderDetailsPage
                    order={selectedShippingOrder}
                    onBack={() => setSelectedShippingOrder(null)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ x: '-20%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-20%', opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  className="w-full h-full overflow-auto"
                >
                  {area === 'home' ? (
                    <HomeDashboard
                      onSelectArea={(a) => navigateToArea(a as PlantAreaKey)}
                      isAreaEnabled={(key) => allowedAreas.includes(key as PlantAreaKey)}
                    />
                  ) : area === 'production' ? (
                    <ProductionOverviewDashboard
                      onSelectArea={(nextArea) => navigateToArea(nextArea as PlantAreaKey)}
                    />
                  ) : area === 'fabrication' ? (
                    <FabricationDashboard
                      selectedMachine={selectedSidebarMachine}
                      onMachineSelect={(machine: Machine | null) => {
                        setSelectedSidebarMachine(machine);
                        setSidebarMachine(machine);
                      }}
                      onViewMachineDetails={(machine: Machine) => setSelectedMachineDetails(machine)}
                      onViewECODetails={(eco: ECO) => setSelectedECODetails(eco)}
                      onBackupMachine={(machine: Machine) => {
                        setPrefilledBackupMachine(machine);
                        setUploadDialogOpen(true);
                      }}
                      onViewWorkOrderDetails={(workOrder: WorkOrder) => setSelectedWorkOrderDetails(workOrder)}
                      machineFilterTerm={machineFilterTerm}
                      onMachineFilterChange={handleMachineFilterChange}
                    />
                  ) : area === 'shipping' ? (
                    <ShippingDashboard
                      onViewOrder={(o) => setSelectedShippingOrder(o)}
                      onMachineSelect={(machine) => {
                        setSelectedSidebarMachine(machine);
                        setSidebarMachine(machine);
                      }}
                    />
                  ) : area === 'machines' ? (
                    <MachineAreaBoard />
                  ) : area === 'tool-life' ? (
                    <ToolLifeEstimationPage />
                  ) : (
                    <GreenRoomDashboard
                      selectedMachine={selectedSidebarMachine}
                      onMachineSelect={(machine) => {
                        setSelectedSidebarMachine(machine);
                        setSidebarMachine(machine);
                      }}
                      onViewMachineDetails={(machine) => {
                        setSelectedMachineDetails(machine);
                      }}
                      onViewECODetails={(eco) => {
                        setSelectedECODetails(eco);
                      }}
                      onBackupMachine={(machine) => {
                        setPrefilledBackupMachine(machine);
                        setUploadDialogOpen(true);
                      }}
                      onViewWorkOrderDetails={(workOrder) => {
                        setSelectedWorkOrderDetails(workOrder);
                      }}
                      machineFilterTerm={machineFilterTerm}
                      onMachineFilterChange={handleMachineFilterChange}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            setPrefilledBackupMachine(null); // Clear pre-filled data when dialog closes
          }
        }}
        prefilledMachineId={prefilledBackupMachine?.id}
        prefilledType={prefilledBackupMachine ? 'Program Backup' : undefined}
        allowedMachineIds={area === 'fabrication' ? fabricationMachineIds : undefined}
      />
      <AddNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        allowedMachineIds={area === 'fabrication' ? fabricationMachineIds : undefined}
      />
      <LogEventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        allowedMachineIds={area === 'fabrication' ? fabricationMachineIds : undefined}
      />
      <CreateWorkOrderDialog
        open={workOrderDialogOpen}
        onOpenChange={(open) => {
          setWorkOrderDialogOpen(open);
          if (!open) {
            setPrefilledECO(null); // Clear pre-filled data when dialog closes
          }
        }}
        prefilledECO={prefilledECO}
        onWorkOrderCreated={handleAddWorkOrder}
        allowedMachineIds={area === 'fabrication' ? fabricationMachineIds : undefined}
      />

      {/* Create ECO Dialog */}
      <CreateECODialog
        open={ecoDialogOpen}
        onOpenChange={setEcoDialogOpen}
        prefilledMachine={null}
        allowedMachineIds={area === 'fabrication' ? fabricationMachineIds : undefined}
      />

      {/* Universal Machine Sidebar */}
      <UniversalMachineSidebar
        machine={sidebarMachine}
        isOpen={!!sidebarMachine}
        onClose={() => setSidebarMachine(null)}
        onViewFullDetails={(machine: Machine) => {
          setSelectedMachineDetails(machine);
          setSidebarMachine(null);
        }}
        onUploadDocument={() => {
          if (sidebarMachine) {
            setPrefilledBackupMachine(sidebarMachine);
            setUploadDialogOpen(true);
          }
        }}
        onAddNote={() => setNoteDialogOpen(true)}
        onLogEvent={() => setEventDialogOpen(true)}
        onCreateWorkOrder={() => setWorkOrderDialogOpen(true)}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
