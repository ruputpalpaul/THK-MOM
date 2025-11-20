import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EmptyState } from '@/components/ui/empty-state';
import { Machine, WorkOrder, ECO } from '@/types/green-room';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertCircle, Wrench, FileText, ChevronRight } from 'lucide-react';

export type DrillDownItem = Machine | WorkOrder | ECO;

interface DrillDownDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: DrillDownItem[];
    type: 'machine' | 'work-order' | 'eco';
    onItemClick?: (item: DrillDownItem) => void;
}

export function DrillDownDrawer({ isOpen, onClose, title, items, type, onItemClick }: DrillDownDrawerProps) {

    const renderMachine = (machine: Machine) => (
        <div key={machine.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => onItemClick?.(machine)}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${machine.status === 'active' ? 'bg-green-100 text-green-600' : machine.status === 'down' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Activity className="w-4 h-4" />
                </div>
                <div>
                    <p className="font-medium text-sm">{machine.name}</p>
                    <p className="text-xs text-muted-foreground">{machine.type}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={machine.status === 'active' ? 'default' : machine.status === 'down' ? 'destructive' : 'secondary'}>
                    {machine.status}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
    );

    const renderWorkOrder = (wo: WorkOrder) => (
        <div key={wo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => onItemClick?.(wo)}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <Wrench className="w-4 h-4" />
                </div>
                <div>
                    <p className="font-medium text-sm">{wo.title}</p>
                    <p className="text-xs text-muted-foreground">{wo.machineName} • {wo.type}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline">{wo.priority}</Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
    );

    const renderECO = (eco: ECO) => (
        <div key={eco.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => onItemClick?.(eco)}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <FileText className="w-4 h-4" />
                </div>
                <div>
                    <p className="font-medium text-sm">{eco.title}</p>
                    <p className="text-xs text-muted-foreground">{eco.machineName}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="secondary">{eco.status}</Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
    );

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>{title}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{items.length} items found</p>
                </SheetHeader>
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-3">
                        {items.length === 0 ? (
                            <EmptyState
                                icon={AlertCircle}
                                title="No items found"
                                description={`No ${type.replace('-', ' ')}s matching your criteria were found.`}
                            />
                        ) : (
                            items.map(item => {
                                if (type === 'machine') return renderMachine(item as Machine);
                                if (type === 'work-order') return renderWorkOrder(item as WorkOrder);
                                if (type === 'eco') return renderECO(item as ECO);
                                return null;
                            })
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-muted/50">
                    <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
