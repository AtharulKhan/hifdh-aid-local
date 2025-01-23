import { useState, useEffect } from 'react';
import { Conversation } from '@11labs/client';
import { useToast } from "@/hooks/use-toast";
import { JournalEntry } from '@/store/useJournalStore';
import { ELEVENLABS_AGENT_ID } from '@/config/voice';

interface MessageEvent {
  type: 'transcript' | 'agent_response' | 'debug';
  text?: string;
  transcript?: string;
  debug?: any;
}

export const useVoiceChat = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [agentStatus, setAgentStatus] = useState<'listening' | 'speaking'>('listening');
  const [agentResponse, setAgentResponse] = useState('');
  const { toast } = useToast();

  const initializeConversation = async (journals: JournalEntry[]) => {
    try {
      const apiKey = localStorage.getItem('ELEVENLABS_API_KEY');
      if (!apiKey) throw new Error('API key not found');

      // Format journal context
      const journalContext = journals
        .map(j => `Journal entry "${j.title}": ${j.content.substring(0, 500)}`)
        .join('\n\n');

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log('Initializing ElevenLabs conversation...');
      
      const newConversation = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        overrides: {
          agent: {
            firstMessage: `Hello! I'm your AI therapist. I've reviewed your journal entries.`,
            prompt: {
              prompt: `You are a helpful AI therapist. Consider this context from the user's journals: ${journalContext}`
            }
          },
          tts: {
            voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah voice
            modelId: "eleven_monolingual_v2"
          }
        },
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setConnectionStatus('connected');
          toast({ title: 'Connected', description: 'Voice chat active' });
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setConnectionStatus('disconnected');
          setConversation(null);
          toast({ title: 'Disconnected', description: 'Voice chat ended' });
        },
        onError: (error: string) => {
          console.error('ElevenLabs error:', error);
          toast({
            title: 'Connection Error',
            description: error,
            variant: 'destructive'
          });
          setConnectionStatus('disconnected');
          setConversation(null);
        },
        onModeChange: (mode: { mode: 'speaking' | 'listening' }) => {
          console.log('Mode changed:', mode.mode);
          setAgentStatus(mode.mode);
        },
        onMessage: (event: MessageEvent) => {
          console.log('Received message event:', event);
          
          if (event.type === 'transcript' && event.transcript) {
            console.log('User transcript:', event.transcript);
          }
          
          if (event.type === 'agent_response' && event.text) {
            console.log('Agent response:', event.text);
            setAgentResponse(event.text);
          }
          
          if (event.type === 'debug') {
            console.log('Debug event:', event.debug);
          }
        }
      });

      console.log('Conversation initialized successfully');
      setConversation(newConversation);
      return newConversation;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize voice chat';
      console.error('Voice chat initialization error:', error);
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const startSession = async (journals: JournalEntry[]) => {
    try {
      setConnectionStatus('connecting');
      await initializeConversation(journals);
    } catch (error) {
      console.error('Failed to start session:', error);
      setConnectionStatus('disconnected');
    }
  };

  const stopSession = async () => {
    if (conversation) {
      console.log('Stopping voice chat session...');
      await conversation.endSession();
      setConversation(null);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    return () => {
      if (conversation) {
        console.log('Cleaning up voice chat session...');
        conversation.endSession();
      }
    };
  }, [conversation]);

  return {
    connectionStatus,
    agentStatus,
    agentResponse,
    startSession,
    stopSession
  };
};