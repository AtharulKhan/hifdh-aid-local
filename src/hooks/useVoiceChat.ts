import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ELEVENLABS_AGENT_ID } from '@/config/voice';
import { JournalEntry } from '@/store/useJournalStore';

export const useVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [agentResponse, setAgentResponse] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();

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

    // Create context from selected journals
    const journalContext = journals.map(journal => 
      `Context from journal "${journal.title}": ${journal.content}`
    ).join('\n\n');

    try {
      ws.current = new WebSocket(
        `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`
      );

      ws.current.onopen = () => {
        // Send initial context
        ws.current?.send(JSON.stringify({
          text: `Here is some context about the user: ${journalContext}`
        }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'audio') {
          playAudio(data.audio_event.audio_base_64);
        } else if (data.type === 'agent_response') {
          setAgentResponse(data.agent_response_event.agent_response);
        }
      };

      await initAudioCapture();
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to voice service",
        variant: "destructive"
      });
    }
  };

  const initAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (!isListening) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = convertFloat32ToInt16(inputData);
        const base64Data = btoa(String.fromCharCode.apply(null, audioData));
        
        ws.current?.send(JSON.stringify({
          user_audio_chunk: base64Data
        }));
      };
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please enable microphone access to use voice chat",
        variant: "destructive"
      });
    }
  };

  const convertFloat32ToInt16 = (float32Array: Float32Array) => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  };

  const playAudio = (base64: string) => {
    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    audio.play();
  };

  return {
    isListening,
    agentResponse,
    startSession: (journals: JournalEntry[]) => {
      setIsListening(true);
      initConnection(journals);
    },
    stopSession: () => {
      setIsListening(false);
      if (ws.current) {
        ws.current.close();
      }
    }
  };
};