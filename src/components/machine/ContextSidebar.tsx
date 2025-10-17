import { Machine } from '../../types/green-room';
import { documents, workOrders, ecos } from '../../data/mock-data';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { FileText, Wrench, GitBranch, X, ExternalLink } from 'lucide-react';

interface ContextSidebarProps {
  machine: Machine | null;
  onClose: () => void;
  onViewDetails?: (machine: Machine) => void;
}

export function ContextSidebar({ machine, onClose, onViewDetails }: ContextSidebarProps) {
  if (!machine) return null;

  const machineDocs = documents.filter(doc => doc.machineId === machine.id);
  const machineWOs = workOrders.filter(wo => wo.machineId === machine.id);
  const machineECOs = ecos.filter(eco => eco.machineId === machine.id);

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'maintenance':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-96 border-l border-border bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3>Machine Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          variant="default" 
          className="w-full" 
          size="sm"
          onClick={() => onViewDetails?.(machine)}
        >
          View Full Details
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary */}
        <div>
          <h4 className="mb-3">Summary</h4>
          <Card className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Machine ID:</span>
              <span className="text-sm">{machine.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type:</span>
              <span className="text-sm">{machine.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`text-sm ${getStatusColor(machine.status)}`}>
                {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
              </span>
            </div>
            {machine.oem && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">OEM:</span>
                <span className="text-sm">{machine.oem}</span>
              </div>
            )}
            {machine.controller && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Controller:</span>
                <span className="text-sm">{machine.controller}</span>
              </div>
            )}
            {machine.commissionedDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Commissioned:</span>
                <span className="text-sm">{machine.commissionedDate}</span>
              </div>
            )}
            {machine.criticality && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Criticality:</span>
                <Badge variant={machine.criticality === 'high' ? 'destructive' : 'secondary'}>
                  {machine.criticality}
                </Badge>
              </div>
            )}
          </Card>
        </div>

        <Separator />

        {/* Latest Documents */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4>Documents</h4>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          {machineDocs.length > 0 ? (
            <div className="space-y-2">
              {machineDocs.slice(0, 5).map(doc => (
                <Card key={doc.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                      </div>
                      <p className="text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents available</p>
          )}
        </div>

        <Separator />

        {/* Open Issues */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4>Open Issues</h4>
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </div>
          {machineWOs.filter(wo => wo.status !== 'completed').length > 0 ? (
            <div className="space-y-2">
              {machineWOs.filter(wo => wo.status !== 'completed').map(wo => (
                <Card key={wo.id} className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{wo.id}</p>
                      <Badge variant={wo.type === 'Emergency' ? 'destructive' : 'secondary'}>
                        {wo.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{wo.description}</p>
                    <p className="text-xs text-muted-foreground">Due: {wo.dueDate}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No open issues</p>
          )}
        </div>

        <Separator />

        {/* Recent Changes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4>Recent Changes</h4>
            <GitBranch className="w-4 h-4 text-muted-foreground" />
          </div>
          {machineECOs.length > 0 ? (
            <div className="space-y-2">
              {machineECOs.map(eco => (
                <Card key={eco.id} className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{eco.number}</p>
                      <Badge variant={eco.status === 'approved' ? 'default' : 'secondary'}>
                        {eco.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{eco.description}</p>
                    <p className="text-xs text-muted-foreground">{eco.date}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent changes</p>
          )}
        </div>

        <Separator />

        {/* Quick Links */}
        <div>
          <h4 className="mb-3">Quick Links</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              View All Documents
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Wrench className="w-4 h-4 mr-2" />
              Log New Issue
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
