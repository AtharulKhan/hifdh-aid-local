
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebhookExportDialog } from './WebhookExportDialog';
import { SyncDataDialog } from './SyncDataDialog';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSyncDialogOpen(true)}>
            <Cloud className="mr-2 h-4 w-4" />
            Sync Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SyncDataDialog 
        open={syncDialogOpen} 
        onOpenChange={setSyncDialogOpen}
        onWebhookClick={() => setWebhookDialogOpen(true)}
      />

      <WebhookExportDialog 
        open={webhookDialogOpen} 
        onOpenChange={setWebhookDialogOpen} 
      />
    </>
  );
};
