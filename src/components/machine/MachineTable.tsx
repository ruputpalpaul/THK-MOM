import { useState } from 'react';
import { Machine } from '../../types/green-room';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ArrowUpDown, Search } from 'lucide-react';

interface MachineTableProps {
  machines: Machine[];
  onMachineClick?: (machine: Machine) => void;
}

export function MachineTable({ machines, onMachineClick }: MachineTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Machine>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Machine) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredMachines = machines.filter(machine => 
    machine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMachines = [...filteredMachines].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });



  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search machines by ID, name, type, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-2 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2">
              <TableHead className="font-bold text-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('id')}
                  className="h-10 px-4 font-bold hover:bg-gray-100"
                >
                  Machine ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="font-bold text-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('type')}
                  className="h-10 px-4 font-bold hover:bg-gray-100"
                >
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="font-bold text-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('category')}
                  className="h-10 px-4 font-bold hover:bg-gray-100"
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="font-bold text-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="h-10 px-4 font-bold hover:bg-gray-100"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="font-bold text-gray-700">Last Backup</TableHead>
              <TableHead className="font-bold text-gray-700">Last Downtime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMachines.map((machine, index) => (
              <TableRow
                key={machine.id}
                className={`cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-sm ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
                onClick={() => onMachineClick?.(machine)}
              >
                <TableCell className="font-mono font-semibold text-gray-900">{machine.id}</TableCell>
                <TableCell className="font-medium text-gray-700">{machine.type}</TableCell>
                <TableCell className="font-medium text-gray-700">{machine.category}</TableCell>
                <TableCell>
                  <Badge 
                    className={`
                      ${machine.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                      ${machine.status === 'down' ? 'bg-rose-100 text-rose-800 border-rose-200' : ''}
                      ${machine.status === 'maintenance' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                      border-2 font-semibold
                    `}
                  >
                    {machine.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    machine.lastBackup && machine.lastBackup !== 'N/A' && 
                    new Date(machine.lastBackup) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
                      ? 'text-rose-600 font-bold'
                      : 'text-gray-700'
                  }`}>
                    {machine.lastBackup || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-gray-700">{machine.lastDowntime || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-700">
          Showing {sortedMachines.length} of {machines.length} machines
        </p>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            <span className="text-gray-600">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
            <span className="text-gray-600">Down</span>
          </div>
        </div>
      </div>
    </div>
  );
}
