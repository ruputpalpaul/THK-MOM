export type RoleId =
  | 'administrator'
  | 'engineer'
  | 'maintenance'
  | 'supervisor'
  | 'worker'
  | 'viewer';

export type Capability =
  | 'view:home'
  | 'view:production'
  | 'view:green-room'
  | 'view:fabrication'
  | 'view:shipping'
  | 'view:planner'
  | 'manage:documents'
  | 'manage:notes'
  | 'manage:events'
  | 'manage:workorders'
  | 'manage:ecos'
  | 'view:analytics'
  | 'manage:users';

export interface UserProfile {
  id: string;
  name: string;
  role: RoleId;
  capabilities: Capability[];
}

export interface UserRecord {
  id: string;
  name: string;
  role: RoleId;
}

export type PlantAreaKey =
  | 'home'
  | 'production'
  | 'green-room'
  | 'fabrication'
  | 'shipping'
  | 'machines'
  | 'tool-life';

export interface UserPreferences {
  defaultArea?: PlantAreaKey;
  machineFilters?: Record<string, string>;
  lastVisitedMachineId?: string;
}

export interface AuthState {
  currentUser: UserProfile;
  users: UserProfile[];
  preferences: UserPreferences;
  hasCapability: (capability: Capability) => boolean;
  signIn: (userId: string) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateUserRole: (userId: string, role: RoleId) => void;
}
