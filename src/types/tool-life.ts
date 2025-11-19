export type ToolEndReason = 'WORN' | 'BROKEN' | 'PREVENTIVE' | 'SCRAP' | 'TRIAL' | 'CHIP_CONTROL';

export type QualityRating = 'OK' | 'WARN' | 'SCRAP';

export interface ToolRecipe {
  id: string;
  machineId: string;
  machineName: string;
  haasToolNumber: string;
  description: string;
  operationCode: string;
  materialGroup: string;
  currentLifeLimitMin: number;
  currentWarningMin: number;
  kFactor: number;
  taylorC: number;
  taylorN: number;
  nominalSpeedSfm?: number;
  manufacturerSpecMin?: number;
  lastUpdated?: string;
}

export interface ToolCycle {
  id: string;
  toolId: string;
  cycleIndex: number;
  startMinutesTotal: number;
  endMinutesTotal: number;
  lifeMinutes: number;
  endReason: ToolEndReason;
}

export interface ToolUsageSample {
  id: string;
  toolId: string;
  machineId: string;
  timestamp: string;
  cuttingMinutesTotal: number;
  programId?: string;
  material?: string;
  surfaceSpeedSfm?: number;
  spindleRpm?: number;
  feedPerTooth?: number;
}

export interface QualitySample {
  id: string;
  toolId: string;
  toolCycleId: string;
  timestamp: string;
  usageMinutesAtSample: number;
  qualityRating: QualityRating;
  dimensionName?: string;
  dimensionValue?: number;
  withinTolerance?: boolean;
  offsetAdjustment?: number;
  offsetAxis?: string;
  note?: string;
}

export interface ToolLifeStats {
  meanLifeMinutes: number;
  sigmaMinutes: number;
  statLimitMin: number;
  reliabilityLimitMin: number;
  dimensionalLimitMin?: number;
  taylorLimitMin?: number;
  recommendedLimitMin: number;
  warningMin: number;
  sampleCount: number;
  kFactor: number;
}
