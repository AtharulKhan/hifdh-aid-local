import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Chat = () => {
  const { toast } = useToast();
  const apiKey = localStorage.getItem('OPENROUTER_API_KEY');

  React.useEffect(() => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenRouter API key in settings first",
        variant: "destructive"
      });
    }
  }, [apiKey, toast]);

  return (
    <div className="min-h-screen">
      {apiKey ? (
        <ChatInterface />
      ) : (
        <div className="container mx-auto px-4 py-8 text-center">
          Please configure your OpenRouter API key in the settings to use the AI Therapist.
        </div>
      )}
    </div>
  );
};

export default Chat;