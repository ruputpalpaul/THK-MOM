import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildUserProfile, DEFAULT_USERS } from '@/data/users';
import type { AuthState, Capability, UserPreferences, UserProfile, UserRecord, RoleId } from '@/types/auth';

const STORAGE_USER_KEY = 'thk-mom:auth:user';
const STORAGE_PREF_KEY_PREFIX = 'thk-mom:prefs:';
const STORAGE_USERS_KEY = 'thk-mom:auth:users';

type AuthContextValue = AuthState;

const AuthContext = createContext<AuthContextValue | null>(null);

const loadStoredUsers = (): UserRecord[] => {
  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_USERS_KEY) : null;
    if (!stored) return DEFAULT_USERS;
    const parsed = JSON.parse(stored) as UserRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_USERS;
    return parsed.filter(record => record.id && record.name && record.role) as UserRecord[];
  } catch {
    return DEFAULT_USERS;
  }
};

const loadStoredUserId = (users: UserRecord[]): string => {
  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_USER_KEY) : null;
    if (!stored) return users[0]?.id ?? DEFAULT_USERS[0]?.id;
    const parsed = JSON.parse(stored) as { userId: string };
    if (parsed?.userId && users.some(user => user.id === parsed.userId)) {
      return parsed.userId;
    }
    return users[0]?.id ?? DEFAULT_USERS[0]?.id;
  } catch {
    return users[0]?.id ?? DEFAULT_USERS[0]?.id;
  }
};

const loadPreferences = (userId: string): UserPreferences => {
  try {
    const stored = window.localStorage.getItem(STORAGE_PREF_KEY_PREFIX + userId);
    return stored ? (JSON.parse(stored) as UserPreferences) : {};
  } catch {
    return {};
  }
};

const savePreferences = (userId: string, prefs: UserPreferences) => {
  try {
    window.localStorage.setItem(STORAGE_PREF_KEY_PREFIX + userId, JSON.stringify(prefs));
  } catch {
    // localStorage might fail (e.g., Safari private mode). Silently ignore.
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialUsers = useMemo<UserRecord[]>(
    () => (typeof window === 'undefined' ? DEFAULT_USERS : loadStoredUsers()),
    [],
  );
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    typeof window === 'undefined' ? initialUsers[0]?.id ?? DEFAULT_USERS[0].id : loadStoredUserId(initialUsers),
  );
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    typeof window === 'undefined' ? {} : loadPreferences(loadStoredUserId(initialUsers)),
  );

  const currentStoredUser = useMemo<UserRecord>(() => {
    const fallback = users[0] ?? DEFAULT_USERS[0];
    return users.find(user => user.id === currentUserId) ?? fallback;
  }, [currentUserId, users]);
  const currentUser = useMemo<UserProfile>(() => buildUserProfile(currentStoredUser), [currentStoredUser]);
  const userProfiles = useMemo<UserProfile[]>(() => users.map(record => buildUserProfile(record)), [users]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ userId: currentStoredUser.id }));
  }, [currentStoredUser.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    savePreferences(currentStoredUser.id, preferences);
  }, [currentStoredUser.id, preferences]);

  const hasCapability = useCallback(
    (capability: Capability) => currentUser.capabilities.includes(capability),
    [currentUser.capabilities],
  );

  const signIn = useCallback(
    (userId: string) => {
      if (!users.some(user => user.id === userId)) return;
      setCurrentUserId(userId);
      setPreferences(loadPreferences(userId));
    },
    [users],
  );

  const updatePreferences = useCallback((update: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...update }));
  }, []);

  const updateUserRole = useCallback(
    (userId: string, role: RoleId) => {
      setUsers(prev =>
        prev.map(user => (user.id === userId ? { ...user, role } : user)),
      );
    },
    [],
  );

  useEffect(() => {
    // If current user id is no longer present (e.g., user removed), default to first entry.
    if (!users.some(user => user.id === currentUserId) && users.length > 0) {
      const fallbackId = users[0].id;
      setCurrentUserId(fallbackId);
      setPreferences(loadPreferences(fallbackId));
    }
  }, [currentUserId, users]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      users: userProfiles,
      preferences,
      hasCapability,
      signIn,
      updatePreferences,
      updateUserRole,
    }),
    [currentUser, userProfiles, preferences, hasCapability, signIn, updatePreferences, updateUserRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
