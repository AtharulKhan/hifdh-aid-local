import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useJournalContext } from '@/hooks/use-journal-context';
import { ScrollArea } from "@/components/ui/scroll-area";

export function VoiceChat() {
  const { isListening, agentResponse, startSession, stopSession } = useVoiceChat();
  const { selectedJournals } = useJournalContext();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleStartStop = () => {
    if (isListening) {
      stopSession();
    } else {
      startSession(selectedJournals);
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
          <DialogTitle>Voice Chat</DialogTitle>
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

          <Button
            onClick={handleStartStop}
            variant={isListening ? "destructive" : "default"}
            className="w-full"
          >
            {isListening ? (
              <Square className="mr-2 h-4 w-4" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            {isListening ? 'Stop Voice Chat' : 'Start Voice Chat'}
          </Button>

          {agentResponse && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{agentResponse}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}