import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ManageAccessDialog } from '@/components/dialogs/ManageAccessDialog';

const initialsFor = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function UserMenu() {
  const { currentUser, signIn, users, hasCapability } = useAuth();
  const [manageOpen, setManageOpen] = useState(false);
  const canManageUsers = hasCapability('manage:users');

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initialsFor(currentUser.name)}</AvatarFallback>
      </Avatar>
      <div className="hidden sm:flex flex-col leading-tight">
        <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
        <span className="text-xs text-muted-foreground capitalize">{currentUser.role}</span>
      </div>
      <Select value={currentUser.id} onValueChange={signIn}>
        <SelectTrigger className="h-8 w-36 sm:w-48 text-sm">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent align="end">
          {users.map(user => (
            <SelectItem key={user.id} value={user.id}>
              {user.name} • {user.role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {canManageUsers && (
        <>
          <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
            Manage Access
          </Button>
          <ManageAccessDialog open={manageOpen} onOpenChange={setManageOpen} />
        </>
      )}
    </div>
  );
}
