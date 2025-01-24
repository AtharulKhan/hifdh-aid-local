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
import { ELEVENLABS_AGENT_ID } from '@/config/voice';

// Debug logging utility
const debug = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[VoiceChat Debug] ${message}`;
  console.info(logMessage, data || '');
};

export function VoiceChat() {
  const { toast } = useToast();
  const { selectedJournals } = useJournalContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const [agentResponse, setAgentResponse] = React.useState<string>('');
  const [volume, setVolume] = React.useState(1);
  
  const conversation = useConversation({
    preferHeadphonesForIosDevices: true,
    onConnect: () => {
      debug('WebSocket connection established');
      toast({
        title: "Connected",
        description: "Voice chat is now active",
      });
    },
    onDisconnect: () => {
      debug('WebSocket connection closed');
      toast({
        title: "Disconnected",
        description: "Voice chat session ended",
      });
    },
    onMessage: (message) => {
      debug('Received message type:', message.type);
      if (message.type === 'assistant_response') {
        setAgentResponse(message.text);
      }
    },
    onError: (error) => {
      debug('Error occurred:', error);
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
        debug('Stopping voice chat session');
        debug('Stopping media recorder');
        debug('Cleaning up WebSocket connection');
        await conversation.endSession();
      } else {
        debug('Initiating WebSocket connection');
        
        // Check for API key
        const elevenLabsApiKey = localStorage.getItem('ELEVENLABS_API_KEY');
        if (!elevenLabsApiKey) {
          debug('Missing ElevenLabs API key');
          toast({
            title: "API Key Required",
            description: "Please set your ElevenLabs API key in settings first",
            variant: "destructive",
          });
          return;
        }
        
        // Request microphone permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Release stream immediately to avoid iOS issues
          stream.getTracks().forEach(track => track.stop());
          debug('Microphone access granted');
        } catch (error) {
          debug('Microphone access denied:', error);
          toast({
            title: "Microphone Required",
            description: "Please enable microphone access to use voice chat",
            variant: "destructive",
          });
          return;
        }
        
        // Start conversation with journal context
        debug('Starting session with agent ID:', ELEVENLABS_AGENT_ID);
        await conversation.startSession({ 
          agentId: ELEVENLABS_AGENT_ID,
          overrides: {
            agent: {
              prompt: {
                prompt: `Context from selected journals: ${selectedJournals.map(j => j.content).join('\n')}`,
              }
            }
          }
        }).catch(error => {
          debug('Session start error:', error);
          throw error;
        });
        
        debug('Session started successfully');
      }
    } catch (error) {
      debug('Error in handleStartStop:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice chat",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    debug('Setting volume to:', newVolume);
    setVolume(newVolume);
    await conversation.setVolume({ volume: newVolume });
  };

  // Add debug panel to show connection state and events
  const renderDebugInfo = () => (
    <div className="p-2 text-xs bg-muted/20 rounded-lg mt-2">
      <div>Status: {conversation.status}</div>
      <div>Speaking: {conversation.isSpeaking ? 'Yes' : 'No'}</div>
      <div>Can Send Feedback: {conversation.canSendFeedback ? 'Yes' : 'No'}</div>
      <div>API Key Set: {localStorage.getItem('ELEVENLABS_API_KEY') ? 'Yes' : 'No'}</div>
    </div>
  );

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

          {renderDebugInfo()}

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