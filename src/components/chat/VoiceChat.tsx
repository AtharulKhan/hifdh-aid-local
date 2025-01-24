import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useJournalContext } from '@/hooks/use-journal-context';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import Vapi from '@vapi-ai/web';
import { useSettings } from '@/hooks/use-settings';

export function VoiceChat() {
  const { toast } = useToast();
  const { selectedJournals } = useJournalContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const [agentResponse, setAgentResponse] = React.useState('');
  const [volume, setVolume] = React.useState(1);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'connecting' | 'connected'>('idle');
  const vapiRef = React.useRef<Vapi | null>(null);
  const { settings } = useSettings();

  React.useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const initializeVapi = () => {
    if (!settings.vapiApiKey) {
      toast({
        title: "API Key Missing",
        description: "Please set your Vapi API Key in settings",
        variant: "destructive",
      });
      return null;
    }

    if (!settings.vapiAssistantId) {
      toast({
        title: "Assistant ID Missing",
        description: "Please set your Vapi Assistant ID in settings",
        variant: "destructive",
      });
      return null;
    }

    return new Vapi(settings.vapiApiKey);
  };

  const handleStartStop = async () => {
    try {
      if (status === 'connected') {
        vapiRef.current?.stop();
        setStatus('idle');
        setAgentResponse('');
        return;
      }

      const vapi = initializeVapi();
      if (!vapi) return;

      setStatus('connecting');
      
      vapi
        .on('call-start', () => {
          setStatus('connected');
          toast({ title: "Connected", description: "Voice chat is now active" });
        })
        .on('call-end', () => {
          setStatus('idle');
          toast({ title: "Disconnected", description: "Voice chat session ended" });
        })
        .on('speech-start', () => setIsSpeaking(true))
        .on('speech-end', () => setIsSpeaking(false))
        .on('message', (message) => {
          if (message.type === 'assistant-response' || message.type === 'transcript') {
            setAgentResponse(prev => `${prev}\n${message.content}`);
          }
        })
        .on('error', (error) => {
          toast({
            title: "Error",
            description: error.message || "An error occurred during voice chat",
            variant: "destructive",
          });
          setStatus('idle');
        });

      // Start call with journal context
      await vapi.start(settings.vapiAssistantId, {
        messages: [
          {
            role: "system",
            content: `Current journal context: ${selectedJournals.map(j => j.content).join('\n')}`
          }
        ]
      });

      vapiRef.current = vapi;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice chat",
        variant: "destructive",
      });
      setStatus('idle');
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (vapiRef.current) {
      vapiRef.current.setMuted(newVolume === 0);
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

          <div className={cn(
            "p-4 rounded-lg transition-colors",
            status === 'connected' ? "bg-green-500/10 animate-pulse" : "bg-muted/50"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {status === 'connected' ? 
                  (isSpeaking ? "Speaking..." : "Listening...") : 
                  "Ready to start"}
              </span>
            </div>
          </div>

          {agentResponse && (
            <div className="space-y-2">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{agentResponse}</p>
              </div>
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
            variant={status === 'connected' ? "destructive" : "default"}
            className="w-full"
            disabled={status === 'connecting'}
          >
            {status === 'connected' ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Voice Chat
              </>
            ) : status === 'connecting' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
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
