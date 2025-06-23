import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2, HardDrive, Webhook } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { Separator } from '@/components/ui/separator';

interface SyncDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebhookClick: () => void;
}

export const SyncDataDialog = ({ open, onOpenChange, onWebhookClick }: SyncDataDialogProps) => {
  const { syncLocalDataToSupabase, loadDataFromSupabase, clearSupabaseData, clearLocalData } = useDataSync();

  const handlePushData = async () => {
    console.log('Starting push to cloud...');
    try {
      await syncLocalDataToSupabase();
      console.log('Push to cloud completed successfully');
    } catch (error) {
      console.error('Push to cloud failed:', error);
    } finally {
      onOpenChange(false);
    }
  };

  const handlePullData = async () => {
    console.log('Starting pull from cloud...');
    try {
      await loadDataFromSupabase();
      console.log('Pull from cloud completed successfully');
    } catch (error) {
      console.error('Pull from cloud failed:', error);
    } finally {
      onOpenChange(false);
    }
  };

  const handleClearCloudData = async () => {
    console.log('Starting clear cloud data...');
    try {
      await clearSupabaseData();
      console.log('Clear cloud data completed successfully');
    } catch (error) {
      console.error('Clear cloud data failed:', error);
    } finally {
      onOpenChange(false);
    }
  };

  const handleClearLocalData = () => {
    console.log('Starting clear local data...');
    try {
      clearLocalData();
      console.log('Clear local data completed successfully');
    } catch (error) {
      console.error('Clear local data failed:', error);
    } finally {
      onOpenChange(false);
    }
  };

  const handleWebhookExport = () => {
    onWebhookClick();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Sync Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Cloud Sync</h4>
            <div className="space-y-2">
              <Button onClick={handlePushData} variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Push to Cloud
              </Button>
              <Button onClick={handlePullData} variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Pull from Cloud
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Export</h4>
            <Button onClick={handleWebhookExport} variant="outline" className="w-full justify-start">
              <Webhook className="mr-2 h-4 w-4" />
              Export to Webhook
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 text-red-600">Danger Zone</h4>
            <div className="space-y-2">
              <Button onClick={handleClearCloudData} variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cloud Data
              </Button>
              <Button onClick={handleClearLocalData} variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <HardDrive className="mr-2 h-4 w-4" />
                Clear Local Data
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
