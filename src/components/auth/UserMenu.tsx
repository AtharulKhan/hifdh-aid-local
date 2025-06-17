
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Cloud, Upload, Download, Trash2, HardDrive } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { useToast } from '@/hooks/use-toast';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { syncLocalDataToSupabase, loadDataFromSupabase, clearSupabaseData, clearLocalData } = useDataSync();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const handlePushData = async () => {
    await syncLocalDataToSupabase();
  };

  const handlePullData = async () => {
    await loadDataFromSupabase();
  };

  const handleClearCloudData = async () => {
    await clearSupabaseData();
  };

  const handleClearLocalData = () => {
    clearLocalData();
  };

  if (!user) return null;

  return (
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Cloud className="mr-2 h-4 w-4" />
            Sync Data
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handlePushData}>
              <Upload className="mr-2 h-4 w-4" />
              Push to Cloud
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePullData}>
              <Download className="mr-2 h-4 w-4" />
              Pull from Cloud
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearCloudData} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cloud Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearLocalData} className="text-red-600">
              <HardDrive className="mr-2 h-4 w-4" />
              Clear Local Data
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
