import { useState, useEffect } from 'react';
import { Conversation } from '@11labs/client';
import { useToast } from "@/hooks/use-toast";
import { JournalEntry } from '@/store/useJournalStore';
import { ELEVENLABS_AGENT_ID } from '@/config/voice';

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

      const journalContext = journals
        .map(j => `Journal entry "${j.title}": ${j.content}`)
        .join('\n\n');

      await navigator.mediaDevices.getUserMedia({ audio: true });

      const newConversation = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        overrides: {
          agent: {
            firstMessage: `Hello! I'm your AI therapist. I've reviewed your journal entries.`,
            prompt: {
              prompt: `You are a helpful AI therapist. Consider this context from the user's journals: ${journalContext}`
            }
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
          setAgentStatus(mode.mode);
        },
        onMessage: (message: { type: string; text?: string }) => {
          if (message.type === 'agent_response' && message.text) {
            setAgentResponse(message.text);
          }
        }
      });

      setConversation(newConversation);
      return newConversation;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize voice chat';
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
      setConnectionStatus('disconnected');
    }
  };

  const stopSession = async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    return () => {
      if (conversation) {
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