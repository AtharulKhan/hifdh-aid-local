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
  const [debugLogs, setDebugLogs] = React.useState<string[]>([]);
  
  const wsRef = React.useRef<WebSocket | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  const addDebugLog = (message: string) => {
    console.log(`[VoiceChat Debug] ${message}`);
    setDebugLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
  };

  React.useEffect(() => {
    return () => {
      if (wsRef.current) {
        addDebugLog('Cleaning up WebSocket connection');
        wsRef.current.close();
      }
      if (mediaRecorderRef.current) {
        addDebugLog('Stopping media recorder');
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      addDebugLog('Requesting microphone access');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          addDebugLog(`Sending audio chunk: ${event.data.size} bytes`);
          
          wsRef.current.send(JSON.stringify({
            type: 'audio.input',
            data: Array.from(new Uint8Array(arrayBuffer)),
            format: 'webm'
          }));
        }
      };

      mediaRecorderRef.current.start(500);
      addDebugLog('Started recording');
      setIsRecording(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugLog(`Microphone error: ${errorMessage}`);
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
        addDebugLog('Stopping current session');
        wsRef.current?.close();
        mediaRecorderRef.current?.stop();
        setStatus('idle');
        setIsRecording(false);
        return;
      }

      const openAIKey = localStorage.getItem('OPENAI_API_KEY');
      if (!openAIKey) {
        addDebugLog('OpenAI API key missing');
        toast({
          title: "API Key Missing",
          description: "Please set your OpenAI API key in settings",
          variant: "destructive",
        });
        return;
      }

      setStatus('connecting');
      addDebugLog('Initiating WebSocket connection');
      
      const ws = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        [
          'realtime',
          `openai-insecure-api-key.${openAIKey}`,
          'openai-beta.realtime-v1'
        ]
      );

      wsRef.current = ws;

      ws.onopen = () => {
        addDebugLog('WebSocket connection established');
        setStatus('connected');
        toast({ 
          title: "Connected", 
          description: "Voice chat is now active" 
        });
        
        const sessionConfig = {
          type: 'session.create',
          session: {
            model: {
              messages: [{
                role: "system",
                content: `Journal context: ${selectedJournals.map(j => j.content).join('\n')}`
              }]
            },
            audio: {
              input: { enabled: true, format: 'webm' },
              output: { enabled: true, format: 'wav' }
            }
          }
        };

        addDebugLog('Sending session configuration');
        ws.send(JSON.stringify(sessionConfig));
        startRecording();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addDebugLog(`Received message type: ${data.type}`);
          
          if (data.type === 'response.update') {
            setAgentResponse(prev => `${prev}\n${data.response.content}`);
          }
          
          if (data.type === 'audio.output' && data.data) {
            addDebugLog('Processing audio output');
            const audioBlob = new Blob([new Uint8Array(data.data)], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onplay = () => addDebugLog('Started playing audio response');
            audio.onended = () => {
              addDebugLog('Finished playing audio response');
              URL.revokeObjectURL(audioUrl);
            };
            
            audio.play().catch(error => {
              addDebugLog(`Audio playback error: ${error.message}`);
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addDebugLog(`Message processing error: ${errorMessage}`);
        }
      };

      ws.onerror = (error) => {
        addDebugLog(`WebSocket error: ${error.type}`);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice service",
          variant: "destructive"
        });
        setStatus('idle');
        setIsRecording(false);
      };

      ws.onclose = (event) => {
        addDebugLog(`WebSocket closed: ${event.code} - ${event.reason || 'No reason provided'}`);
        setStatus('idle');
        setIsRecording(false);
        toast({ 
          title: "Disconnected", 
          description: "Voice chat session ended" 
        });
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugLog(`General error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
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

          {debugLogs.length > 0 && (
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Debug Logs:</h4>
              <ScrollArea className="h-[100px]">
                <div className="space-y-1">
                  {debugLogs.map((log, index) => (
                    <p key={index} className="text-xs text-muted-foreground font-mono">
                      {log}
                    </p>
                  ))}
                </div>
              </ScrollArea>
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