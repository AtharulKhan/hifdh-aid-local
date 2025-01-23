import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useJournalContext } from '@/hooks/use-journal-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function VoiceChat() {
  const { connectionStatus, agentStatus, agentResponse, startSession, stopSession } = useVoiceChat();
  const { selectedJournals } = useJournalContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = async () => {
    if (connectionStatus === 'connected') {
      await stopSession();
      setIsOpen(false);
    } else {
      await startSession(selectedJournals);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-primary/20 transition-colors"
        >
          <Mic className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Voice Chat Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Selected Journal Context:</h3>
            <ScrollArea className="h-[100px]">
              {selectedJournals.length > 0 ? (
                <ul className="space-y-2">
                  {selectedJournals.map((journal) => (
                    <li key={journal.id} className="text-sm text-muted-foreground">
                      {journal.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No journals selected</p>
              )}
            </ScrollArea>
          </div>

          <div className={cn(
            "p-4 rounded-lg transition-colors",
            connectionStatus === 'connected' && agentStatus === 'listening' ? "bg-green-500/10 animate-pulse" : "bg-muted/50"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {connectionStatus === 'connecting' ? "Connecting..." : 
                  connectionStatus === 'connected' ? (
                    agentStatus === 'speaking' ? "AI is speaking..." : "Listening..."
                  ) : "Ready to start"}
              </span>
              {connectionStatus === 'connecting' && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>

          {agentResponse && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm">{agentResponse}</p>
            </div>
          )}

          <Button
            onClick={handleToggle}
            variant={connectionStatus === 'connected' ? "destructive" : "default"}
            className="w-full"
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : connectionStatus === 'connected' ? (
              <Square className="mr-2 h-4 w-4" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            {connectionStatus === 'connecting' ? 'Connecting...' : 
              connectionStatus === 'connected' ? 'End Session' : 'Start Session'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}