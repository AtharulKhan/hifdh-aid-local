
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
    
    setShowInstallDialog(false);
  };

  const handleShowDialog = () => {
    setShowInstallDialog(true);
  };

  if (!isInstallable) return null;

  return (
    <>
      <Button
        onClick={handleShowDialog}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-green-600 text-white border-green-600 hover:bg-green-700 shadow-lg"
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-700 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Install Hifdh Aid App
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Install the Hifdh Aid app on your device for a better experience:
            </p>
            
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Quick access from your home screen</li>
              <li>Offline access to your memorization data</li>
              <li>Native app-like experience</li>
              <li>Push notifications for review reminders</li>
            </ul>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowInstallDialog(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Not Now
              </Button>
              <Button
                onClick={handleInstallClick}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
