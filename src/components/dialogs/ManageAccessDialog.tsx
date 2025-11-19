import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ROLE_OPTIONS } from '@/data/users';
import type { RoleId } from '@/types/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ManageAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageAccessDialog({ open, onOpenChange }: ManageAccessDialogProps) {
  const { users, updateUserRole, currentUser } = useAuth();

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User Access Levels</DialogTitle>
          <DialogDescription>
            Assign an access level to each user. Changes apply immediately for the selected profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {sortedUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/40 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.id === currentUser.id ? 'Active session' : user.id}
                </p>
              </div>
              <Select
                value={user.role}
                onValueChange={value => updateUserRole(user.id, value as RoleId)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent align="end">
                  {ROLE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
