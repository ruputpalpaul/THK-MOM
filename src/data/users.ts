import type { Capability, RoleId, UserProfile, UserRecord } from '@/types/auth';

export const ROLE_CAPABILITIES: Record<RoleId, Capability[]> = {
  administrator: [
    'view:home',
    'view:production',
    'view:green-room',
    'view:fabrication',
    'view:shipping',
    'view:planner',
    'manage:documents',
    'manage:notes',
    'manage:events',
    'manage:workorders',
    'manage:ecos',
    'view:analytics',
    'manage:users',
  ],
  engineer: [
    'view:home',
    'view:production',
    'view:green-room',
    'view:fabrication',
    'manage:documents',
    'manage:ecos',
    'manage:notes',
    'view:analytics',
  ],
  maintenance: [
    'view:home',
    'view:green-room',
    'view:fabrication',
    'view:shipping',
    'manage:events',
    'manage:workorders',
    'manage:notes',
    'view:analytics',
  ],
  supervisor: [
    'view:home',
    'view:production',
    'view:green-room',
    'view:fabrication',
    'view:shipping',
    'manage:documents',
    'manage:notes',
    'manage:events',
    'manage:workorders',
    'view:analytics',
  ],
  worker: [
    'view:home',
    'view:green-room',
    'view:fabrication',
    'manage:notes',
    'view:analytics',
  ],
  viewer: [
    'view:home',
    'view:production',
    'view:green-room',
    'view:analytics',
  ],
};

export const DEFAULT_USERS: UserRecord[] = [
  { id: 'user-admin', name: 'Alex Rivera', role: 'administrator' },
  { id: 'user-engineer', name: 'Casey Morgan', role: 'engineer' },
  { id: 'user-maintenance', name: 'Riley Chen', role: 'maintenance' },
  { id: 'user-supervisor', name: 'Jordan Patel', role: 'supervisor' },
  { id: 'user-worker', name: 'Taylor Kim', role: 'worker' },
  { id: 'user-viewer', name: 'Sam Blake', role: 'viewer' },
];

export const ROLE_OPTIONS: Array<{ value: RoleId; label: string }> = [
  { value: 'administrator', label: 'Administrator' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'worker', label: 'Worker' },
  { value: 'viewer', label: 'Viewer' },
];

export const buildUserProfile = (record: UserRecord): UserProfile => ({
  ...record,
  capabilities: ROLE_CAPABILITIES[record.role] ?? [],
});
