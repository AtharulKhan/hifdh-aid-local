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
  const audioContextRef = React.useRef<AudioContext | null>(null);

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
      if (audioContextRef.current) {
        addDebugLog('Closing audio context');
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      addDebugLog('Requesting microphone access');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm; codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          addDebugLog(`Sending raw audio chunk: ${arrayBuffer.byteLength} bytes`);
          wsRef.current.send(arrayBuffer);
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
              input: { 
                enabled: true,
                format: 'webm_opus',
                sample_rate: 16000
              },
              output: { 
                enabled: true,
                format: 'wav',
                sample_rate: 24000
              }
            }
          }
        };

        addDebugLog('Sending session configuration');
        ws.send(JSON.stringify(sessionConfig));
        startRecording();
      };

      ws.onmessage = async (event) => {
        try {
          if (typeof event.data === 'string') {
            const data = JSON.parse(event.data);
            addDebugLog(`Received message type: ${data.type}`);
            
            if (data.type === 'response.update') {
              setAgentResponse(prev => `${prev}\n${data.response.content}`);
            }
          } else {
            addDebugLog('Processing audio output');
            const arrayBuffer = await event.data.arrayBuffer();
            
            if (!audioContextRef.current) {
              audioContextRef.current = new AudioContext();
            }
            
            const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            
            source.onended = () => {
              addDebugLog('Finished playing audio response');
            };
            
            source.start(0);
            addDebugLog('Started playing audio response');
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
        
        if (event.code === 4001) {
          toast({
            title: "Authentication Failed",
            description: "Invalid API key",
            variant: "destructive"
          });
        } else {
          toast({ 
            title: "Disconnected", 
            description: "Voice chat session ended" 
          });
        }
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