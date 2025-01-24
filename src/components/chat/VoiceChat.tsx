import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useJournalContext } from '@/hooks/use-journal-context';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function VoiceChat() {
  const { toast } = useToast();
  const { selectedJournals } = useJournalContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const [agentResponse, setAgentResponse] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'connecting' | 'connected'>('idle');
  const [isRecording, setIsRecording] = React.useState(false);
  
  const wsRef = React.useRef<WebSocket | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  React.useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          wsRef.current.send(arrayBuffer);
        }
      };

      mediaRecorderRef.current.start(500);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Please enable microphone access",
        variant: "destructive",
      });
    }
  };

  const handleStartStop = async () => {
    try {
      if (status === 'connected') {
        wsRef.current?.close();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setStatus('idle');
        setIsRecording(false);
        return;
      }

      const openAIKey = localStorage.getItem('OPENAI_API_KEY');
      if (!openAIKey) {
        toast({
          title: "API Key Missing",
          description: "Please set your OpenAI API key in settings",
          variant: "destructive",
        });
        return;
      }

      setStatus('connecting');
      
      const ws = new WebSocket(
        'wss://api.openai.com/v1/audio/speech',
        [
          'openai-api-key.' + openAIKey,
        ]
      );

      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        toast({ 
          title: "Connected", 
          description: "Voice chat is now active" 
        });
        
        ws.send(JSON.stringify({
          type: 'session.create',
          context: {
            messages: [{
              role: "system",
              content: `Journal context: ${selectedJournals.map(j => j.content).join('\n')}`
            }]
          }
        }));

        startRecording();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'response') {
            setAgentResponse(prev => `${prev}\n${data.content}`);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onerror = () => {
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice service",
          variant: "destructive"
        });
        setStatus('idle');
        setIsRecording(false);
      };

      ws.onclose = () => {
        setStatus('idle');
        setIsRecording(false);
        toast({ 
          title: "Disconnected", 
          description: "Voice chat session ended" 
        });
      };

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice chat",
        variant: "destructive"
      });
      setStatus('idle');
      setIsRecording(false);
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
                  (isRecording ? "Recording..." : "Connected") : 
                  "Ready to start"}
              </span>
            </div>
          </div>

          {agentResponse && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{agentResponse}</p>
            </div>
          )}

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