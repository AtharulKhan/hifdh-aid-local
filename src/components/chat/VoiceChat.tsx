import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useVoiceChat } from '@/hooks/useVoiceChat';

export function VoiceChat() {
  const { isListening, agentResponse, startSession, stopSession } = useVoiceChat();
  
  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={isListening ? stopSession : startSession}
        variant={isListening ? "destructive" : "default"}
        className="w-full sm:w-auto"
      >
        {isListening ? (
          <Square className="mr-2 h-4 w-4" />
        ) : (
          <Mic className="mr-2 h-4 w-4" />
        )}
        {isListening ? 'Stop Voice Chat' : 'Start Voice Chat'}
      </Button>

      {agentResponse && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{agentResponse}</p>
        </div>
      )}
    </div>
  );
}