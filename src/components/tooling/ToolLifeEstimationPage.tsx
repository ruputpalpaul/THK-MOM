import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart, Factory, Gauge, RefreshCcw, Settings, TrendingDown, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toolLifeCycles as initialToolCycles, toolLifeQualitySamples as initialQualitySamples, toolLifeRecipes, toolLifeUsageSamples as initialUsageSamples } from '@/data/tool-life';
import type { QualitySample, ToolCycle, ToolLifeStats, ToolRecipe, ToolUsageSample } from '@/types/tool-life';
import { toast } from 'sonner';

const SAFETY_MINUTES_FLOOR = 15;
const RELIABILITY_Z = 1.645; // ≈95% one-sided normal lower bound

const round = (value: number, digits = 1): number => Math.round(value * 10 ** digits) / 10 ** digits;

const formatMinutes = (value: number): string => `${round(value, 1)} min`;

const toolMap = new Map<string, ToolRecipe>(toolLifeRecipes.map(tool => [tool.id, tool]));

const calculateDimensionalLimit = (toolId: string, qualitySamples: QualitySample[]): number | undefined => {
  const driftSamples = qualitySamples
    .filter(sample => sample.toolId === toolId && typeof sample.dimensionValue === 'number')
    .sort((a, b) => a.usageMinutesAtSample - b.usageMinutesAtSample);

  if (driftSamples.length < 2) {
    const offsetOnly = qualitySamples
      .filter(sample => sample.toolId === toolId && sample.offsetAdjustment !== undefined)
      .sort((a, b) => a.usageMinutesAtSample - b.usageMinutesAtSample)[0];
    if (offsetOnly) {
      return Math.max(SAFETY_MINUTES_FLOOR, offsetOnly.usageMinutesAtSample);
    }
    return undefined;
  }

  const n = driftSamples.length;
  const sumX = driftSamples.reduce((sum, s) => sum + s.usageMinutesAtSample, 0);
  const sumY = driftSamples.reduce((sum, s) => sum + (s.dimensionValue ?? 0), 0);
  const sumXY = driftSamples.reduce((sum, s) => sum + s.usageMinutesAtSample * (s.dimensionValue ?? 0), 0);
  const sumX2 = driftSamples.reduce((sum, s) => sum + s.usageMinutesAtSample ** 2, 0);

  const denominator = n * sumX2 - sumX ** 2;
  if (denominator === 0) return undefined;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  if (!Number.isFinite(slope) || slope === 0) return undefined;

  const limitSample =
    qualitySamples
      .filter(
        sample =>
          sample.toolId === toolId &&
          (sample.qualityRating !== 'OK' || sample.withinTolerance === false || sample.offsetAdjustment !== undefined),
      )
      .sort((a, b) => a.usageMinutesAtSample - b.usageMinutesAtSample)[0] ?? driftSamples[driftSamples.length - 1];
  if (!limitSample) return undefined;

  if (typeof limitSample.dimensionValue !== 'number') {
    return Math.max(SAFETY_MINUTES_FLOOR, limitSample.usageMinutesAtSample);
  }

  const projected = (limitSample.dimensionValue - intercept) / slope;
  if (!Number.isFinite(projected) || projected <= 0) {
    return Math.max(SAFETY_MINUTES_FLOOR, limitSample.usageMinutesAtSample);
  }

  const conservativeLimit = Math.min(projected, limitSample.usageMinutesAtSample);
  return Math.max(round(conservativeLimit, 1), SAFETY_MINUTES_FLOOR);
};

const averageSpeed = (toolId: string, usageSamples: ToolUsageSample[], nominal?: number): number | undefined => {
  const samples = usageSamples.filter(sample => sample.toolId === toolId && sample.surfaceSpeedSfm !== undefined);
  if (!samples.length) return nominal;
  const avg = samples.reduce((sum, s) => sum + (s.surfaceSpeedSfm ?? 0), 0) / samples.length;
  return avg || nominal;
};

const calculateStats = (
  toolId: string,
  cycles: ToolCycle[],
  qualitySamples: QualitySample[],
  usageSamples: ToolUsageSample[],
  k: number,
): ToolLifeStats => {
  const relevant = cycles.filter(
    cycle => cycle.toolId === toolId && (cycle.endReason === 'WORN' || cycle.endReason === 'SCRAP'),
  );
  const lifetimes = relevant.map(cycle => cycle.lifeMinutes);
  const dimensionalLimit = calculateDimensionalLimit(toolId, qualitySamples);
  if (lifetimes.length === 0) {
    return {
      meanLifeMinutes: 0,
      sigmaMinutes: 0,
      statLimitMin: 0,
      reliabilityLimitMin: 0,
      dimensionalLimitMin: dimensionalLimit,
      taylorLimitMin: undefined,
      recommendedLimitMin: dimensionalLimit ?? 0,
      warningMin: dimensionalLimit ? round(dimensionalLimit * 0.9, 1) : 0,
      sampleCount: 0,
      kFactor: k,
    };
  }

  const mean = lifetimes.reduce((sum, val) => sum + val, 0) / lifetimes.length;
  const variance =
    lifetimes.reduce((sum, val) => sum + (val - mean) ** 2, 0) / Math.max(lifetimes.length - 1, 1);
  const sigma = Math.sqrt(variance);

  const statLimit = Math.max(round(mean - k * sigma, 1), SAFETY_MINUTES_FLOOR);
  const reliabilityLimit = Math.max(round(mean - RELIABILITY_Z * sigma, 1), SAFETY_MINUTES_FLOOR);
  const conservativeStat = Math.min(statLimit, reliabilityLimit);

  const tool = toolMap.get(toolId);
  const observedSpeed = averageSpeed(toolId, usageSamples, tool?.nominalSpeedSfm);
  const taylorLimit =
    tool && observedSpeed && tool.taylorC && tool.taylorN
      ? Math.max(round((tool.taylorC / observedSpeed) ** (1 / tool.taylorN), 1), SAFETY_MINUTES_FLOOR)
      : undefined;

  const combined = Math.min(
    conservativeStat,
    dimensionalLimit ?? Number.POSITIVE_INFINITY,
    taylorLimit ?? Number.POSITIVE_INFINITY,
  );
  return {
    meanLifeMinutes: round(mean, 1),
    sigmaMinutes: round(sigma, 2),
    statLimitMin: statLimit,
    reliabilityLimitMin: reliabilityLimit,
    dimensionalLimitMin: dimensionalLimit,
    taylorLimitMin: taylorLimit,
    recommendedLimitMin: combined,
    warningMin: round(combined * 0.9, 1),
    sampleCount: lifetimes.length,
    kFactor: k,
  };
};

const getLastCycle = (toolId: string, cycles: ToolCycle[]): ToolCycle | undefined =>
  [...cycles.filter(cycle => cycle.toolId === toolId)].sort((a, b) => b.cycleIndex - a.cycleIndex)[0];

const TOOL_CHANGE_REASONS = ['WORN', 'BROKEN', 'PREVENTIVE', 'TRIAL', 'SCRAP'] as const;
const QUALITY_RATINGS = ['OK', 'WARN', 'SCRAP'] as const;

type ToolChangeFormState = {
  machineId: string;
  toolId: string;
  cuttingMinutesTotal: number;
  reason: (typeof TOOL_CHANGE_REASONS)[number];
  programId: string;
  material: string;
  notes: string;
};

type QualityFormState = {
  toolId: string;
  toolCycleId: string;
  usageMinutesAtSample: number;
  qualityRating: (typeof QUALITY_RATINGS)[number];
  dimensionName: string;
  dimensionValue: string;
  withinTolerance: boolean;
  note: string;
};

export function ToolLifeEstimationPage() {
  const [cycles, setCycles] = useState<ToolCycle[]>(initialToolCycles);
  const [usageSamples, setUsageSamples] = useState<ToolUsageSample[]>(initialUsageSamples);
  const [qualitySamples, setQualitySamples] = useState<QualitySample[]>(initialQualitySamples);
  const [selectedToolId, setSelectedToolId] = useState(toolLifeRecipes[0]?.id ?? '');
  const [kOverrides, setKOverrides] = useState<Record<string, number>>(() =>
    Object.fromEntries(toolLifeRecipes.map(tool => [tool.id, tool.kFactor])),
  );
  const [showUsageFeed, setShowUsageFeed] = useState(false);
  const [showEngineerDashboard, setShowEngineerDashboard] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(() => toolLifeRecipes[0]?.machineId ?? '');

  const machines = useMemo(
    () => Array.from(new Set(toolLifeRecipes.map(tool => tool.machineId))),
    [],
  );
  const toolsByMachine = useMemo(() => {
    const grouped = new Map<string, ToolRecipe[]>();
    toolLifeRecipes.forEach(tool => {
      grouped.set(tool.machineId, [...(grouped.get(tool.machineId) ?? []), tool]);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const [toolChangeForm, setToolChangeForm] = useState<ToolChangeFormState>({
    machineId: toolLifeRecipes[0]?.machineId ?? '',
    toolId: toolLifeRecipes[0]?.id ?? '',
    cuttingMinutesTotal: getLastCycle(toolLifeRecipes[0]?.id ?? '', initialToolCycles)?.endMinutesTotal ?? 0,
    reason: TOOL_CHANGE_REASONS[0],
    programId: '',
    material: '',
    notes: '',
  });
  const [qualityForm, setQualityForm] = useState<QualityFormState>({
    toolId: toolLifeRecipes[0]?.id ?? '',
    toolCycleId: getLastCycle(toolLifeRecipes[0]?.id ?? '', initialToolCycles)?.id ?? '',
    usageMinutesAtSample: getLastCycle(toolLifeRecipes[0]?.id ?? '', initialToolCycles)?.endMinutesTotal ?? 0,
    qualityRating: QUALITY_RATINGS[0],
    dimensionName: '',
    dimensionValue: '',
    withinTolerance: true,
    note: '',
  });

  const selectedTool = toolMap.get(selectedToolId);
  const selectedMachineTools = useMemo(
    () => toolLifeRecipes.filter(tool => tool.machineId === selectedMachineId),
    [selectedMachineId],
  );
  useEffect(() => {
    const firstTool = selectedMachineTools[0];
    if (firstTool && firstTool.id !== selectedToolId) {
      setSelectedToolId(firstTool.id);
    }
  }, [selectedMachineId, selectedMachineTools]);

  const statsByTool = useMemo(() => {
    const next: Record<string, ToolLifeStats> = {};
    for (const tool of toolLifeRecipes) {
      const k = kOverrides[tool.id] ?? tool.kFactor;
      next[tool.id] = calculateStats(tool.id, cycles, qualitySamples, usageSamples, k);
    }
    return next;
  }, [cycles, kOverrides, qualitySamples, usageSamples]);

  const brokenCycles = useMemo(
    () => cycles.filter(cycle => cycle.endReason === 'BROKEN').length,
    [cycles],
  );

  const scrapParts = useMemo(
    () => qualitySamples.filter(sample => sample.qualityRating === 'SCRAP').length,
    [qualitySamples],
  );

  const avgRecommended = useMemo(() => {
    const values = Object.values(statsByTool)
      .map(stat => stat.recommendedLimitMin)
      .filter(value => value > 0);
    if (!values.length) return 0;
    return round(values.reduce((sum, val) => sum + val, 0) / values.length, 1);
  }, [statsByTool]);

  const handleToolChangeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const minutes = Number(toolChangeForm.cuttingMinutesTotal);
    if (Number.isNaN(minutes)) return;
    const tool = toolMap.get(toolChangeForm.toolId);
    if (!tool) return;

    const lastCycle = getLastCycle(tool.id, cycles);
    const nextIndex = (lastCycle?.cycleIndex ?? 0) + 1;
    const startMinutes = lastCycle?.endMinutesTotal ?? minutes;
    const lifeMinutes = Math.max(minutes - startMinutes, 0);

    const newCycle: ToolCycle = {
      id: `${tool.id}-C${nextIndex}`,
      toolId: tool.id,
      cycleIndex: nextIndex,
      startMinutesTotal: startMinutes,
      endMinutesTotal: minutes,
      lifeMinutes,
      endReason: toolChangeForm.reason,
    };

    setCycles(prev => [...prev, newCycle]);
    setUsageSamples(prev => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        toolId: tool.id,
        machineId: tool.machineId,
        timestamp: new Date().toISOString(),
        cuttingMinutesTotal: minutes,
        programId: toolChangeForm.programId || undefined,
        material: toolChangeForm.material || undefined,
      },
    ]);

    setToolChangeForm(prev => ({
      ...prev,
      cuttingMinutesTotal: minutes + 10,
      notes: '',
    }));

    toast('Tool change logged', {
      description: `${tool.haasToolNumber} on ${tool.machineName} captured with ${lifeMinutes} minutes (${toolChangeForm.reason}).`,
    });
  };

  const handleQualitySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const tool = toolMap.get(qualityForm.toolId);
    if (!tool) return;
    const sample: QualitySample = {
      id: `q-${Date.now()}`,
      toolId: qualityForm.toolId,
      toolCycleId: qualityForm.toolCycleId,
      timestamp: new Date().toISOString(),
      usageMinutesAtSample: Number(qualityForm.usageMinutesAtSample),
      qualityRating: qualityForm.qualityRating,
      dimensionName: qualityForm.dimensionName || undefined,
      dimensionValue:
        qualityForm.dimensionValue === '' ? undefined : Number(qualityForm.dimensionValue),
      withinTolerance: qualityForm.withinTolerance,
      note: qualityForm.note || undefined,
    };
    setQualitySamples(prev => [...prev, sample]);
    toast('Quality sample logged', {
      description: `${tool.haasToolNumber} • ${sample.qualityRating} at ${sample.usageMinutesAtSample} min`,
    });
    setQualityForm(prev => ({ ...prev, note: '' }));
  };

  const machineToolOptions = (machineId: string): ToolRecipe[] =>
    toolLifeRecipes.filter(tool => tool.machineId === machineId);

  const qualityForSelected = [...qualitySamples.filter(sample => sample.toolId === selectedToolId)].sort(
    (a, b) => a.timestamp.localeCompare(b.timestamp),
  );

  const latestUsage = [...usageSamples.filter(sample => sample.toolId === selectedToolId)].sort(
    (a, b) => b.timestamp.localeCompare(a.timestamp),
  )[0];
  const offsetsForSelected = qualityForSelected
    .filter(sample => sample.offsetAdjustment !== undefined)
    .map(sample => ({
      ...sample,
      magnitude: Math.abs(sample.offsetAdjustment ?? 0),
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const historyEvents = useMemo(
    () =>
      [
        ...usageSamples.map(sample => ({
          kind: 'usage' as const,
          timestamp: sample.timestamp,
          id: sample.id,
          toolId: sample.toolId,
          machineName: toolMap.get(sample.toolId)?.machineName ?? sample.machineId,
          cuttingMinutesTotal: sample.cuttingMinutesTotal,
          programId: sample.programId,
          material: sample.material,
          offsetAdjustment: undefined,
          offsetAxis: undefined,
        })),
        ...qualitySamples.map(sample => ({
          kind: 'quality' as const,
          timestamp: sample.timestamp,
          id: sample.id,
          toolId: sample.toolId,
          qualityRating: sample.qualityRating,
          usageMinutesAtSample: sample.usageMinutesAtSample,
          dimensionName: sample.dimensionName,
          dimensionValue: sample.dimensionValue,
          withinTolerance: sample.withinTolerance,
          offsetAdjustment: sample.offsetAdjustment,
          offsetAxis: sample.offsetAxis,
          note: sample.note,
          machineName: toolMap.get(sample.toolId)?.machineName,
        })),
      ].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [qualitySamples, usageSamples],
  );
  const machineHistory = useMemo(
    () =>
      historyEvents.filter(event => {
        const recipe = toolMap.get(event.toolId);
        return recipe?.machineId === selectedMachineId || event.machineName === selectedMachineId;
      }),
    [historyEvents, selectedMachineId],
  );
  const selectedToolHistory = useMemo(
    () => historyEvents.filter(event => event.toolId === selectedToolId),
    [historyEvents, selectedToolId],
  );

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-b from-white to-slate-50">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Tool Life</Badge>
            <Badge className="bg-blue-50 text-blue-700" variant="secondary">
              CNC • Cutting • Drilling • Grinding
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Tool Life Estimation</h2>
            <p className="text-muted-foreground max-w-3xl">
              Track consumable tooling, capture operator changes, and give engineers a data-backed
              Haas life recommendation using {`μ - kσ`} blended with dimensional drift signals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tracked tools</p>
                  <p className="text-2xl font-semibold">{toolLifeRecipes.length}</p>
                  <p className="text-xs text-muted-foreground">
                    Across {machines.length} CNC/cutting assets
                  </p>
                </div>
                <Gauge className="h-6 w-6 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg recommended life</p>
                  <p className="text-2xl font-semibold">{formatMinutes(avgRecommended)}</p>
                  <p className="text-xs text-muted-foreground">Using live {`μ - kσ`} calc</p>
                </div>
                <BarChart className="h-6 w-6 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Broken pulls</p>
                  <p className="text-2xl font-semibold">{brokenCycles}</p>
                  <p className="text-xs text-muted-foreground">Investigate for early limits</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scrap hits</p>
                  <p className="text-2xl font-semibold">{scrapParts}</p>
                  <p className="text-xs text-muted-foreground">From quality samples</p>
                </div>
                <TrendingDown className="h-6 w-6 text-rose-500" />
              </div>
            </Card>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Operator console</h3>
            <p className="text-sm text-muted-foreground">
              Log tool pulls and quality calls; everything else tucks behind settings when you need it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUsageFeed(prev => !prev)}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {showUsageFeed ? 'Hide usage feed' : 'Show usage feed'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowEngineerDashboard(prev => !prev)}>
              <Settings className="mr-2 h-4 w-4" />
              {showEngineerDashboard ? 'Hide engineer view' : 'Engineer settings'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Operator console</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleToolChangeSubmit} className="space-y-3 p-3 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tool change</p>
                    <p className="text-xs text-muted-foreground">“I just pulled T12, worn”</p>
                  </div>
                  <Badge variant="outline">cycles</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Machine</Label>
                    <Select
                      value={toolChangeForm.machineId}
                      onValueChange={value => {
                        const nextTool = machineToolOptions(value)[0];
                        setToolChangeForm(prev => ({
                          ...prev,
                          machineId: value,
                          toolId: nextTool?.id ?? prev.toolId,
                          cuttingMinutesTotal:
                            getLastCycle(nextTool?.id ?? '', cycles)?.endMinutesTotal ??
                            prev.cuttingMinutesTotal,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map(machineId => (
                          <SelectItem key={machineId} value={machineId}>
                            {machineId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Tool</Label>
                    <Select
                      value={toolChangeForm.toolId}
                      onValueChange={value =>
                        setToolChangeForm(prev => ({
                          ...prev,
                          toolId: value,
                          cuttingMinutesTotal: getLastCycle(value, cycles)?.endMinutesTotal ?? prev.cuttingMinutesTotal,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose tool" />
                      </SelectTrigger>
                      <SelectContent>
                        {machineToolOptions(toolChangeForm.machineId).map(tool => (
                          <SelectItem key={tool.id} value={tool.id}>
                            {tool.haasToolNumber} • {tool.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Current cutting minutes (controller)</Label>
                    <Input
                      type="number"
                      value={toolChangeForm.cuttingMinutesTotal}
                      onChange={event =>
                        setToolChangeForm(prev => ({
                          ...prev,
                          cuttingMinutesTotal: Number(event.target.value),
                        }))
                      }
                      min={0}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Reason</Label>
                    <Select
                      value={toolChangeForm.reason}
                      onValueChange={value =>
                        setToolChangeForm(prev => ({ ...prev, reason: value as (typeof TOOL_CHANGE_REASONS)[number] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TOOL_CHANGE_REASONS.map(reason => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Program ID (optional)</Label>
                    <Input
                      value={toolChangeForm.programId}
                      onChange={event => setToolChangeForm(prev => ({ ...prev, programId: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Material (optional)</Label>
                    <Input
                      value={toolChangeForm.material}
                      onChange={event => setToolChangeForm(prev => ({ ...prev, material: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea
                    value={toolChangeForm.notes}
                    onChange={event => setToolChangeForm(prev => ({ ...prev, notes: event.target.value }))}
                    placeholder="Chip control poor, chatter on wall, etc."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Log change and recompute life
                </Button>
              </form>

              <form onSubmit={handleQualitySubmit} className="space-y-3 p-3 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quality / inspection</p>
                    <p className="text-xs text-muted-foreground">Tag finish degradation against minutes</p>
                  </div>
                  <Badge variant="outline">quality</Badge>
                </div>
                <div className="space-y-1">
                  <Label>Tool</Label>
                  <Select
                    value={qualityForm.toolId}
                    onValueChange={value => {
                      const last = getLastCycle(value, cycles);
                      setQualityForm(prev => ({
                        ...prev,
                        toolId: value,
                        toolCycleId: last?.id ?? '',
                        usageMinutesAtSample: last?.endMinutesTotal ?? 0,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toolLifeRecipes.map(tool => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.haasToolNumber} • {tool.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Cycle</Label>
                    <Select
                      value={qualityForm.toolCycleId}
                      onValueChange={value => setQualityForm(prev => ({ ...prev, toolCycleId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...cycles.filter(cycle => cycle.toolId === qualityForm.toolId)]
                          .sort((a, b) => b.cycleIndex - a.cycleIndex)
                          .map(cycle => (
                            <SelectItem key={cycle.id} value={cycle.id}>
                              Cycle {cycle.cycleIndex} • {cycle.lifeMinutes} min ({cycle.endReason})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Minutes at sample</Label>
                    <Input
                      type="number"
                      value={qualityForm.usageMinutesAtSample}
                      onChange={event =>
                        setQualityForm(prev => ({ ...prev, usageMinutesAtSample: Number(event.target.value) }))
                      }
                      min={0}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Rating</Label>
                    <Select
                      value={qualityForm.qualityRating}
                      onValueChange={value =>
                        setQualityForm(prev => ({ ...prev, qualityRating: value as (typeof QUALITY_RATINGS)[number] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUALITY_RATINGS.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Dimension value</Label>
                    <Input
                      type="number"
                      value={qualityForm.dimensionValue}
                      onChange={event =>
                        setQualityForm(prev => ({ ...prev, dimensionValue: event.target.value }))
                      }
                      placeholder="54.003"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Dimension name (optional)</Label>
                    <Input
                      value={qualityForm.dimensionName}
                      onChange={event => setQualityForm(prev => ({ ...prev, dimensionName: event.target.value }))}
                      placeholder="Bore_Dia, Slot_W"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Within tolerance?</Label>
                    <Select
                      value={qualityForm.withinTolerance ? 'true' : 'false'}
                      onValueChange={value =>
                        setQualityForm(prev => ({ ...prev, withinTolerance: value === 'true' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea
                    value={qualityForm.note}
                    onChange={event => setQualityForm(prev => ({ ...prev, note: event.target.value }))}
                    placeholder="Finish hazing, burr trend, etc."
                  />
                </div>
                <Button type="submit" className="w-full" variant="secondary">
                  Log sample
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Tool life by machine</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              {toolsByMachine.map(([machineId, tools]) => {
                const isActive = machineId === selectedMachineId;
                const qualityCount = qualitySamples.filter(sample => tools.some(tool => tool.id === sample.toolId)).length;
                const lifeBars = tools.map(tool => {
                  const stat = statsByTool[tool.id];
                  const denom = tool.manufacturerSpecMin ?? (tool.currentLifeLimitMin || 1);
                  const percent = Math.min(100, (stat?.recommendedLimitMin ?? 0) / denom * 100);
                  return { id: tool.id, percent, label: `${tool.haasToolNumber} ${Math.round(percent)}%` };
                });
                return (
                  <button
                    key={machineId}
                    type="button"
                    onClick={() => setSelectedMachineId(machineId)}
                    className={`w-full text-left rounded-md border p-3 shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      isActive ? 'border-primary bg-primary/5' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{machineId}</p>
                      <Badge variant={isActive ? 'secondary' : 'outline'}>{tools.length} tools</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {qualityCount} quality tags across this machine
                    </p>
                    <div className="mt-2 space-y-1">
                      {lifeBars.map(bar => (
                        <div key={bar.id} className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-16">{bar.label}</span>
                          <div className="h-2 flex-1 rounded bg-slate-100 overflow-hidden">
                            <div className="h-2 bg-primary/70" style={{ width: `${bar.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="lg:col-span-2 space-y-3">
              {selectedMachineId ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Machine details</p>
                      <p className="text-xs text-muted-foreground">{selectedMachineId}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline">
                        {toolsByMachine.find(([id]) => id === selectedMachineId)?.[1].length ?? 0} tools
                      </Badge>
                      <Badge variant="secondary">
                        {machineHistory.filter(event => event.kind === 'quality').length} quality
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3 border rounded-md p-3 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">Tool timeline</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedMachineTools.length} tools</Badge>
                        <Select
                          value={selectedToolId}
                          onValueChange={value => setSelectedToolId(value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedMachineTools.map(tool => (
                              <SelectItem key={tool.id} value={tool.id}>
                                {tool.haasToolNumber} • {tool.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {selectedTool && (
                      <div className="space-y-2">
                        {(() => {
                          const stat = statsByTool[selectedTool.id];
                          if (!stat) return null;
                          const denom = selectedTool.manufacturerSpecMin ?? (selectedTool.currentLifeLimitMin || 1);
                          const percent = Math.min(100, (stat.recommendedLimitMin ?? 0) / denom * 100);
                          return (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground w-20">
                                {selectedTool.haasToolNumber} {Math.round(percent)}%
                              </span>
                              <div className="h-2 flex-1 rounded bg-slate-100 overflow-hidden">
                                <div className="h-2 bg-primary/70" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-[11px] text-muted-foreground w-16 text-right">
                                {formatMinutes(stat.recommendedLimitMin ?? 0)}
                              </span>
                            </div>
                          );
                        })()}
                        <div className="space-y-2 border-l pl-3">
                          {selectedToolHistory.slice(0, 8).map(event => {
                            const recipe = toolMap.get(event.toolId);
                            const ts = new Date(event.timestamp).toLocaleString();
                            const hasOffset = event.offsetAdjustment !== undefined;
                            return (
                              <div key={event.id} className="relative pl-2">
                                <span className="absolute -left-[9px] h-2 w-2 rounded-full bg-primary" />
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium">
                                    {recipe?.haasToolNumber ?? event.toolId} • {recipe?.machineName ?? selectedMachineId}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">{ts}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {event.kind === 'usage'
                                    ? `Cycle @ ${event.cuttingMinutesTotal} min`
                                    : `${event.qualityRating} at ${event.usageMinutesAtSample} min`}
                                  {hasOffset ? ` • offset ${event.offsetAdjustment}${event.offsetAxis ? ` ${event.offsetAxis}` : ''}` : ''}
                                </p>
                              </div>
                            );
                          })}
                          {selectedToolHistory.length === 0 && (
                            <p className="text-xs text-muted-foreground">No history captured for this tool yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a machine to view details.</p>
              )}
            </div>
          </div>
        </Card>

        {showUsageFeed && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Usage feed (last push)</h3>
            </div>
            <div className="space-y-2 text-sm">
              {[...usageSamples]
                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                .slice(0, 5)
                .map(sample => {
                  const recipe = toolMap.get(sample.toolId);
                  return (
                    <div key={sample.id} className="flex items-start gap-3 rounded-md border p-2">
                      <Badge variant="secondary">{sample.cuttingMinutesTotal} min</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{recipe?.haasToolNumber ?? sample.toolId} • {recipe?.machineName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sample.timestamp).toLocaleTimeString()} • {sample.programId || 'program unknown'} {sample.material ? `• ${sample.material}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {showEngineerDashboard && (
          <>
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Engineer dashboard</h3>
              </div>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>k</TableHead>
                  <TableHead>μ (min)</TableHead>
                  <TableHead>σ (min)</TableHead>
                  <TableHead>Recommended</TableHead>
                  <TableHead>Dim limit</TableHead>
                  <TableHead>Taylor limit</TableHead>
                  <TableHead>Haas setting</TableHead>
                  <TableHead>Δ</TableHead>
                  <TableHead>Samples</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toolLifeRecipes.map(tool => {
                      const stat = statsByTool[tool.id];
                      const delta = stat.recommendedLimitMin - tool.currentLifeLimitMin;
                      return (
                        <TableRow key={tool.id} className="align-middle">
                          <TableCell>
                            <div className="font-medium">{tool.haasToolNumber}</div>
                            <div className="text-xs text-muted-foreground">{tool.description}</div>
                            <div className="text-xs text-muted-foreground">{tool.machineName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{tool.materialGroup}</Badge>
                            <div className="text-xs text-muted-foreground">{tool.operationCode}</div>
                          </TableCell>
                          <TableCell className="w-28">
                            <Input
                              type="number"
                              step={0.1}
                              min={0}
                              value={kOverrides[tool.id] ?? tool.kFactor}
                              onChange={event =>
                                setKOverrides(prev => ({ ...prev, [tool.id]: Number(event.target.value) }))
                              }
                            />
                          </TableCell>
                          <TableCell>{stat.meanLifeMinutes || '—'}</TableCell>
                          <TableCell>{stat.sigmaMinutes || '—'}</TableCell>
                      <TableCell className="font-medium">{stat.recommendedLimitMin || '—'}</TableCell>
                      <TableCell>{stat.dimensionalLimitMin ?? '—'}</TableCell>
                      <TableCell>{stat.taylorLimitMin ?? '—'}</TableCell>
                      <TableCell>
                            {tool.currentLifeLimitMin} / {tool.currentWarningMin}
                            <div className="text-xs text-muted-foreground">life / warning</div>
                          </TableCell>
                          <TableCell className={delta >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                            {delta > 0 ? '+' : ''}
                            {round(delta, 1)} min
                          </TableCell>
                          <TableCell>{stat.sampleCount}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="p-3 border-dashed border-primary/30 bg-primary/5">
              <p className="text-sm font-medium">Model rule</p>
              <p className="text-sm text-muted-foreground">
                Recommended life = min(μ - kσ, μ - {RELIABILITY_Z}σ, dimensional limit from drift fit, Taylor life from V), clamped to ≥ {SAFETY_MINUTES_FLOOR} min. Warning = 90% of recommended. Adjust k per tool family.
              </p>
                </Card>
                <Card className="p-3">
                  <p className="text-sm font-medium">Quality tie-in</p>
                  <p className="text-sm text-muted-foreground">
                    Consecutive WARN/SCRAP samples mark the cycle as “true worn” so it enters the life distribution. Broken pulls stay as outliers.
                  </p>
                </Card>
                <Card className="p-3">
                  <p className="text-sm font-medium">Action</p>
                  <p className="text-sm text-muted-foreground">
                    Push new limit to Haas during weekend changeover; set warning to 0.9×. Track verification date in tools table.
                  </p>
                </Card>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Per-tool timeline</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <Label>Select tool</Label>
              <Select value={selectedToolId} onValueChange={setSelectedToolId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toolLifeRecipes.map(tool => (
                    <SelectItem key={tool.id} value={tool.id}>
                      {tool.haasToolNumber} • {tool.machineName} • {tool.materialGroup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTool && (
                    <div className="rounded-lg border p-3 bg-white shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedTool.materialGroup}</Badge>
                        <Badge variant="outline">{selectedTool.operationCode}</Badge>
                      </div>
                      <p className="text-sm font-medium">{selectedTool.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Manufacturer spec: {formatMinutes(selectedTool.manufacturerSpecMin ?? selectedTool.currentLifeLimitMin)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estimated life: {formatMinutes(statsByTool[selectedTool.id]?.recommendedLimitMin ?? 0)} (k=
                        {statsByTool[selectedTool.id]?.kFactor ?? selectedTool.kFactor})
                      </p>
                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <p>Dim limit: {formatMinutes(statsByTool[selectedTool.id]?.dimensionalLimitMin ?? 0) || '—'}</p>
                        <p>Reliability: μ - {RELIABILITY_Z}σ ≈ {formatMinutes(statsByTool[selectedTool.id]?.reliabilityLimitMin ?? 0)}</p>
                        {statsByTool[selectedTool.id]?.taylorLimitMin ? (
                          <p>
                            Taylor: {formatMinutes(statsByTool[selectedTool.id]?.taylorLimitMin ?? 0)} @ V_sf={averageSpeed(selectedTool.id, usageSamples, selectedTool.nominalSpeedSfm) ?? selectedTool.nominalSpeedSfm ?? '—'}
                          </p>
                        ) : (
                          <p>Taylor: —</p>
                        )}
                      </div>
                      {latestUsage && (
                        <p className="text-xs text-muted-foreground">
                          Latest usage: {latestUsage.cuttingMinutesTotal} min
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 gap-3">
                  {selectedTool ? (
                    <>
                      <Card className="p-3">
                        <p className="text-sm font-medium mb-2">Degradation (offsets over time)</p>
                        <div className="space-y-2">
                          {offsetsForSelected.length === 0 && (
                            <p className="text-xs text-muted-foreground">No offsets logged for this tool.</p>
                          )}
                          {offsetsForSelected.map(sample => {
                            const width = Math.min(100, Math.abs(sample.offsetAdjustment ?? 0) * 2000); // scale small offsets
                            return (
                              <div key={sample.id} className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{new Date(sample.timestamp).toLocaleTimeString()} • {sample.offsetAdjustment} {sample.offsetAxis ?? ''}</span>
                                  <span>{sample.usageMinutesAtSample} min</span>
                                </div>
                                <div className="h-2 rounded bg-slate-100 overflow-hidden">
                                  <div className="h-2 bg-primary/70" style={{ width: `${width}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                      <Card className="p-3">
                        <p className="text-sm font-medium mb-2">Life snapshots</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded border p-2 bg-white">
                            <p className="text-[11px] text-muted-foreground">Manufacturer spec</p>
                            <p className="font-semibold">{formatMinutes(selectedTool.manufacturerSpecMin ?? selectedTool.currentLifeLimitMin)}</p>
                          </div>
                          <div className="rounded border p-2 bg-white">
                            <p className="text-[11px] text-muted-foreground">Estimated (blended)</p>
                            <p className="font-semibold">{formatMinutes(statsByTool[selectedTool.id]?.recommendedLimitMin ?? 0)}</p>
                          </div>
                          <div className="rounded border p-2 bg-white">
                            <p className="text-[11px] text-muted-foreground">Dimensional</p>
                            <p className="font-semibold">{formatMinutes(statsByTool[selectedTool.id]?.dimensionalLimitMin ?? 0) || '—'}</p>
                          </div>
                          <div className="rounded border p-2 bg-white">
                            <p className="text-[11px] text-muted-foreground">Reliability</p>
                            <p className="font-semibold">{formatMinutes(statsByTool[selectedTool.id]?.reliabilityLimitMin ?? 0)}</p>
                          </div>
                        </div>
                      </Card>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a tool to view degradation and life snapshots.</p>
                  )}
                </div>
              </div>
            </Card>
            <p className="text-xs text-muted-foreground">
              * Calculations tie to the table: μ and σ come from worn/scrap cycles for each tool, k is the per-tool factor above, reliability uses μ - {RELIABILITY_Z}σ (~95% LCB), dimensional drift fits a simple wear slope, Taylor life uses VT^n = C against observed surface speed, and recommended life is min(μ - kσ, μ - {RELIABILITY_Z}σ, dimensional limit, Taylor life) floored to {SAFETY_MINUTES_FLOOR} min; warning is 90% of that.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
