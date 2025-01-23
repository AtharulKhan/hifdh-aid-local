import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";
import { useConversation } from '@11labs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useJournalContext } from '@/hooks/use-journal-context';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

export function VoiceChat() {
  const { toast } = useToast();
  const { selectedJournals } = useJournalContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [agentResponse, setAgentResponse] = React.useState<string>('');
  
  const conversation = useConversation({
    preferHeadphonesForIosDevices: true,
    onConnect: () => {
      toast({
        title: "Connected",
        description: "Voice chat is now active",
      });
    },
    onDisconnect: () => {
      toast({
        title: "Disconnected",
        description: "Voice chat session ended",
      });
    },
    onMessage: (message) => {
      if (message.type === 'assistant_response') {
        setAgentResponse(message.text);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred during voice chat",
        variant: "destructive",
      });
    }
  });

  const handleStartStop = async () => {
    try {
      if (conversation.status === 'connected') {
        await conversation.endSession();
      } else {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start conversation with journal context
        await conversation.startSession({ 
          agentId: process.env.ELEVENLABS_AGENT_ID || '',
          overrides: {
            agent: {
              prompt: {
                prompt: `Context from selected journals: ${selectedJournals.map(j => j.content).join('\n')}`,
              }
            }
          }
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice chat",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    await conversation.setVolume({ volume: newVolume });
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

          <div className={cn(
            "p-4 rounded-lg transition-colors",
            conversation.status === 'connected' ? "bg-green-500/10 animate-pulse" : "bg-muted/50"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {conversation.status === 'connected' ? 
                  (conversation.isSpeaking ? "Speaking..." : "Listening...") : 
                  "Ready to start"}
              </span>
            </div>
          </div>

          {agentResponse && (
            <div className="space-y-2">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm">{agentResponse}</p>
              </div>
              {conversation.canSendFeedback && (
                <div className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => conversation.sendFeedback(true)}
                  >
                    👍 Helpful
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => conversation.sendFeedback(false)}
                  >
                    👎 Not Helpful
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>
          </div>

          <Button
            onClick={handleStartStop}
            variant={conversation.status === 'connected' ? "destructive" : "default"}
            className="w-full"
          >
            {conversation.status === 'connected' ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Voice Chat
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Voice Chat
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}