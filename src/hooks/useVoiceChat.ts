import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ELEVENLABS_AGENT_ID } from '@/config/voice';
import { JournalEntry } from '@/store/useJournalStore';
import { Conversation } from '@11labs/client';

// Import Role type from the client library instead of defining our own
import type { Role } from '@11labs/client';

interface AgentMessage {
  message: string;
  source: Role;
}

export const useVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [agentResponse, setAgentResponse] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const conversationRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession();
      }
    };
  }, []);

  const initConnection = async (journals: JournalEntry[]) => {
    const apiKey = localStorage.getItem('ELEVENLABS_API_KEY');

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your ElevenLabs API key in settings first",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setConnectionState('connecting');

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create context from journals
      const journalContext = journals.map(journal => 
        `Context from journal "${journal.title}": ${journal.content}`
      ).join('\n\n');

      // Start the conversation using the official client
      conversationRef.current = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setConnectionState('connected');
          setIsConnecting(false);
          toast({
            title: "Connected",
            description: "Voice chat is now active",
          });
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setConnectionState('disconnected');
          setIsListening(false);
          toast({
            title: "Disconnected",
            description: "Voice chat has ended",
          });
        },
        onError: (message: string, context?: any) => {
          console.error('ElevenLabs error:', message, context);
          toast({
            title: "Connection Error",
            description: message || "Failed to connect to voice service",
            variant: "destructive"
          });
          setIsConnecting(false);
          setIsListening(false);
          setConnectionState('disconnected');
        },
        onMessage: (props: { message: string; source: Role }) => {
          console.log('Received message:', props);
          setAgentResponse(props.message);
        },
        overrides: {
          agent: {
            firstMessage: `Hello! I'm your AI therapist. ${journalContext}`,
            language: "en",
          }
        }
      });

    } catch (error) {
      console.error("Connection error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect to voice service";
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsConnecting(false);
      setIsListening(false);
      setConnectionState('disconnected');
    }
  };

  return {
    isListening,
    isConnecting,
    connectionState,
    agentResponse,
    startSession: (journals: JournalEntry[]) => {
      setIsListening(true);
      initConnection(journals);
    },
    stopSession: async () => {
      if (conversationRef.current) {
        await conversationRef.current.endSession();
        conversationRef.current = null;
      }
      setIsListening(false);
      setConnectionState('disconnected');
      toast({
        title: "Voice Chat Ended",
        description: "Voice chat session has been terminated",
      });
    }
  };
};