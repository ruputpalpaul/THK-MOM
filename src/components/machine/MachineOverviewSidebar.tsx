import { Machine } from '../../types/green-room';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, FileUp, FileText, AlertCircle, ClipboardList, ExternalLink, Calendar, Activity } from 'lucide-react';

interface MachineOverviewSidebarProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullDetails: (machine: Machine) => void;
  onUploadDocument: () => void;
  onAddNote: () => void;
  onLogEvent: () => void;
  onCreateWorkOrder: () => void;
}

export function MachineOverviewSidebar({ 
  machine, 
  isOpen, 
  onClose, 
  onViewFullDetails,
  onUploadDocument,
  onAddNote,
  onLogEvent,
  onCreateWorkOrder
}: MachineOverviewSidebarProps) {
  if (!isOpen || !machine) return null;

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500 text-white';
      case 'down':
        return 'bg-red-500 text-white';
      case 'maintenance':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l-2 border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{machine.name}</h2>
          <p className="text-sm text-gray-600">{machine.type}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Status</h3>
            <Badge className={getStatusColor(machine.status)}>
              <Activity className="h-3 w-3 mr-1" />
              {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
            </Badge>
          </div>
          {machine.status === 'down' && machine.downReason && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              {machine.downReason}
            </div>
          )}
        </Card>

        {/* Key Information */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">OEM:</span>
              <span className="font-medium">{machine.oem || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Controller:</span>
              <span className="font-medium">{machine.controller || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{machine.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Criticality:</span>
              <Badge variant={machine.criticality === 'high' ? 'destructive' : machine.criticality === 'medium' ? 'secondary' : 'outline'}>
                {machine.criticality || 'Low'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Production Today */}
        {machine.todayTarget && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Today's Production</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Target:</span>
                <span className="font-medium">{machine.todayTarget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actual:</span>
                <span className="font-medium">{machine.todayActual || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scrap:</span>
                <span className="font-medium text-red-600">{machine.todayScrap || 0}</span>
              </div>
              {machine.todayTarget && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{Math.round(((machine.todayActual || 0) / machine.todayTarget) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(((machine.todayActual || 0) / machine.todayTarget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Last Backup */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Last Backup
          </h3>
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{machine.lastBackup || 'Never'}</span>
            </div>
            {machine.lastBackup && machine.lastBackup !== 'N/A' && (
              <div className="mt-2 text-xs text-gray-500">
                Backup is up to date
              </div>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        {(machine.oee || machine.mtbf || machine.mttr) && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
            <div className="space-y-2 text-sm">
              {machine.oee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">OEE:</span>
                  <span className="font-medium">{machine.oee}%</span>
                </div>
              )}
              {machine.mtbf && (
                <div className="flex justify-between">
                  <span className="text-gray-600">MTBF:</span>
                  <span className="font-medium">{machine.mtbf}h</span>
                </div>
              )}
              {machine.mttr && (
                <div className="flex justify-between">
                  <span className="text-gray-600">MTTR:</span>
                  <span className="font-medium">{machine.mttr}h</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* View Full Details Button */}
        <Button 
          onClick={() => onViewFullDetails(machine)}
          className="w-full"
          variant="outline"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Details
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="border-t bg-gray-50 p-4 space-y-2">
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
  );
}
