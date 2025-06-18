
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WebhookExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WebhookExportDialog: React.FC<WebhookExportDialogProps> = ({ open, onOpenChange }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAllLocalStorageData = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            // Try to parse as JSON, if it fails, store as string
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }
    }
    return data;
  };

  const handleSendToWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Webhook URL required",
        description: "Please enter a valid webhook URL.",
        variant: "destructive"
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(webhookUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid webhook URL.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const localData = getAllLocalStorageData();
      const payload = {
        timestamp: new Date().toISOString(),
        source: 'quran-hifz-aid',
        data: localData
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Data sent successfully",
          description: `Local cache data has been sent to the webhook endpoint.`
        });
        onOpenChange(false);
        setWebhookUrl('');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook export error:', error);
      toast({
        title: "Failed to send data",
        description: error instanceof Error ? error.message : "An error occurred while sending data to the webhook.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export to Webhook</DialogTitle>
          <DialogDescription>
            Send all local cache data as JSON to a webhook endpoint
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will send all your local data to the specified webhook URL. Make sure you trust the destination.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-webhook-endpoint.com/data"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSendToWebhook} disabled={isLoading || !webhookUrl.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
