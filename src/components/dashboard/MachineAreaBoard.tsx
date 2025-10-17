import { useEffect, useMemo, useState } from 'react';
import { MACHINE_CODES, MachineCode } from '@/data/machine-codes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as api from '@/utils/api';
import { Machine } from '@/types/green-room';

type AreaOption = 'unassigned' | 'green-room' | 'fabrication' | 'shipping';

const AREA_OPTIONS: ReadonlyArray<{ value: AreaOption; label: string; badgeClass: string }> = [
  { value: 'unassigned', label: 'Unassigned', badgeClass: 'border-border text-muted-foreground' },
  { value: 'green-room', label: 'Green Room', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'fabrication', label: 'Fabrication', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'shipping', label: 'Shipping', badgeClass: 'bg-orange-100 text-orange-800 border-orange-200' },
];

const STORAGE_KEY = 'machine-area-board:v1';

type AssignmentState = Partial<Record<MachineCode, AreaOption>>;
type StoredAssignmentState = Partial<Record<MachineCode, AreaOption | 'production'>>;

const sanitizeStoredAssignments = (raw: StoredAssignmentState | null | undefined): AssignmentState => {
  if (!raw) return {};
  const cleaned: AssignmentState = {};
  for (const [code, area] of Object.entries(raw)) {
    if (!area) continue;
    const normalised = area === 'production' ? 'fabrication' : area;
    if (AREA_OPTIONS.some(option => option.value === normalised)) {
      cleaned[code as MachineCode] = normalised as AreaOption;
    }
  }
  return cleaned;
};

const classifyMachineArea = (machine: Machine): AreaOption => {
  const category = (machine.category || '').toLowerCase();
  const type = (machine.type || '').toLowerCase();

  const isGreenRoom = ['assembly', 'retainer', 'measurement', 'green room', 'inspection'].some(term =>
    category.includes(term) || type.includes(term)
  );
  if (isGreenRoom) return 'green-room';

  const isShipping = ['shipping', 'wrap', 'pack', 'logistics', 'forklift', 'warehouse'].some(term =>
    category.includes(term) || type.includes(term)
  );
  if (isShipping) return 'shipping';

  return 'fabrication';
};

const EMPTY_ASSIGNMENTS: AssignmentState = Object.freeze({});

export interface MachineAreaBoardProps {
  presetAssignments?: AssignmentState;
  onAssignmentChange?: (code: MachineCode, area: AreaOption) => void;
}

export function MachineAreaBoard(props?: MachineAreaBoardProps) {
  const presetAssignments = props?.presetAssignments ?? EMPTY_ASSIGNMENTS;
  const onAssignmentChange = props?.onAssignmentChange;

  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<AreaOption | 'all'>('all');
  const [defaults, setDefaults] = useState<AssignmentState>({ ...presetAssignments });
  const [assignments, setAssignments] = useState<AssignmentState>(() => {
    if (typeof window === 'undefined') {
      return { ...presetAssignments };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredAssignmentState) : {};
      return { ...presetAssignments, ...sanitizeStoredAssignments(parsed) };
    } catch (error) {
      console.error('Failed to read saved machine areas', error);
      return { ...presetAssignments };
    }
  });

  useEffect(() => {
    setDefaults(prev => ({ ...presetAssignments, ...prev }));
  }, [presetAssignments]);

  useEffect(() => {
    (async () => {
      try {
        const machines = await api.getMachines();
        const machineDefaults: AssignmentState = {};
        for (const machine of machines) {
          machineDefaults[machine.id as MachineCode] = classifyMachineArea(machine);
        }
        setDefaults(prev => ({ ...machineDefaults, ...presetAssignments, ...prev }));
      } catch (error) {
        console.error('Failed to load machine data for planner', error);
      }
    })();
  }, [presetAssignments]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  const getAreaForCode = (code: MachineCode): AreaOption => {
    if (Object.prototype.hasOwnProperty.call(assignments, code)) {
      return assignments[code]!;
    }
    if (Object.prototype.hasOwnProperty.call(defaults, code)) {
      return defaults[code]!;
    }
    return 'unassigned';
  };

  const summary = useMemo(() => {
    return MACHINE_CODES.reduce(
      (acc, code) => {
        const area = getAreaForCode(code);
        acc[area] = (acc[area] ?? 0) + 1;
        return acc;
      },
      {} as Record<AreaOption, number>
    );
  }, [assignments, defaults]);

  const sortedCodes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return MACHINE_CODES.filter(code => {
      const area = getAreaForCode(code);
      const areaMatches = areaFilter === 'all' || area === areaFilter;
      const searchMatches = term.length === 0 || code.toLowerCase().includes(term);
      return areaMatches && searchMatches;
    });
  }, [assignments, defaults, searchTerm, areaFilter]);

  const handleAreaChange = (code: MachineCode, value: AreaOption) => {
    setAssignments(prev => {
      const next = { ...prev, [code]: value };
      onAssignmentChange?.(code, value);
      return next;
    });
  };

  const handleResetAll = () => {
    setAssignments({});
    setAreaFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="w-full h-full bg-background overflow-auto">
      <div className="p-4 sm:p-6 space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Machine Area Planner</h2>
            <p className="text-sm text-muted-foreground">
              Assign each machine to an area. Planner pre-populates assignments based on existing data, but you can override anything.
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {AREA_OPTIONS.map(option => (
                <Badge
                  key={option.value}
                  variant="outline"
                  className={`font-medium ${option.badgeClass}`}
                >
                  {option.label}: {summary[option.value] ?? 0}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by machine code..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="sm:w-64"
            />
            <Select value={areaFilter} onValueChange={value => setAreaFilter(value as AreaOption | 'all')}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Filter by area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {AREA_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleResetAll}>
              Reset to Defaults
            </Button>
          </div>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedCodes.map(code => {
              const selectedArea = getAreaForCode(code);
              const areaMeta = AREA_OPTIONS.find(option => option.value === selectedArea) ?? AREA_OPTIONS[0];
              return (
                <Card
                  key={code}
                  className="p-4 border bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{code}</h3>
                    <Badge variant="outline" className={`text-xs ${areaMeta.badgeClass}`}>
                      {areaMeta.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose the area that currently best represents this machine.
                  </p>
                  <Select value={selectedArea} onValueChange={value => handleAreaChange(code, value as AreaOption)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign area" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              );
            })}
            {sortedCodes.length === 0 && (
              <Card className="p-6 border bg-card text-center text-sm text-muted-foreground">
                No machines match the current filters.
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
