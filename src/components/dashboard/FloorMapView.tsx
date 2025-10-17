import { Machine } from '../../types/green-room';
import { Card } from '../ui/card';

interface FloorMapViewProps {
  machines: Machine[];
  onMachineClick?: (machine: Machine) => void;
  selectedMachineId?: string;
}

export function FloorMapView({ machines, onMachineClick, selectedMachineId }: FloorMapViewProps) {
  const getStatusStyle = (status: Machine['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500 border-emerald-600 hover:bg-emerald-600';
      case 'down':
        return 'bg-red-500 border-red-600 hover:bg-red-600';
      case 'maintenance':
        return 'bg-amber-500 border-amber-600 hover:bg-amber-600';
      default:
        return 'bg-gray-500 border-gray-600 hover:bg-gray-600';
    }
  };

  const getStatusDot = (status: Machine['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-300';
      case 'down':
        return 'bg-red-300';
      case 'maintenance':
        return 'bg-amber-300';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
          Factory Floor Layout
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-amber-700">Maintenance</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-sm font-semibold text-rose-700">Down</span>
          </div>
        </div>
      </div>

      {/* Card-based layout container */}
      <div className="relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-2 border-slate-200 rounded-xl p-8 min-h-[600px]">
        <div className="grid grid-cols-6 gap-4 auto-rows-min">
          {machines.map((machine) => {
            const isSelected = selectedMachineId === machine.id;
            
            return (
              <Card
                key={machine.id}
                className={`
                  group cursor-pointer transition-all duration-200 ease-out
                  hover:shadow-lg hover:-translate-y-1 hover:scale-105
                  p-4 min-h-[140px] flex flex-col justify-between
                  border-2 ${getStatusStyle(machine.status)}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  relative overflow-hidden
                `}
                onClick={() => onMachineClick?.(machine)}
              >
                {/* Status indicator dot */}
                <div className="absolute top-3 right-3 z-10">
                  <div className={`w-3 h-3 rounded-full ${getStatusDot(machine.status)} animate-pulse`}></div>
                </div>

                {/* Default view */}
                <div className="group-hover:opacity-0 transition-opacity duration-200 flex flex-col justify-center items-center text-center h-full text-white">
                  <div className="font-bold text-sm mb-1">
                    {machine.name}
                  </div>
                  <div className="text-white/90 text-xs font-medium">
                    {machine.type}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-center items-center">
                  <div className="text-sm text-gray-800 space-y-3 text-center">
                    <div className="font-bold text-gray-900">{machine.name}</div>
                    
                    {/* Status button indicator */}
                    <div className={`
                      flex items-center gap-2 px-3 py-1 rounded-lg border
                      ${machine.status === 'active' ? 'bg-emerald-50 border-emerald-200' : ''}
                      ${machine.status === 'maintenance' ? 'bg-amber-50 border-amber-200' : ''}
                      ${machine.status === 'down' ? 'bg-rose-50 border-rose-200' : ''}
                    `}>
                      <div className={`
                        w-3 h-3 rounded-full
                        ${machine.status === 'active' ? 'bg-emerald-500' : ''}
                        ${machine.status === 'maintenance' ? 'bg-amber-500' : ''}
                        ${machine.status === 'down' ? 'bg-rose-500' : ''}
                      `} />
                      <span className={`
                        text-sm font-semibold capitalize
                        ${machine.status === 'active' ? 'text-emerald-700' : ''}
                        ${machine.status === 'maintenance' ? 'text-amber-700' : ''}
                        ${machine.status === 'down' ? 'text-rose-700' : ''}
                      `}>
                        {machine.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Location:</span> 
                      <span className="ml-1">{machine.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
