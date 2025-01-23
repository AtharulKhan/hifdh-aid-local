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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-glow">
        AI Therapist
      </h1>
      
      <div className="max-w-4xl mx-auto">
        {apiKey ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl -z-10 animate-breathe" />
            <div className="relative backdrop-blur-sm bg-background/80 rounded-lg border border-primary/20 shadow-lg animate-scaleIn">
              <ChatInterface />
            </div>
          </div>
        ) : (
          <div className="text-center p-8 rounded-lg border border-primary/20 bg-background/80 backdrop-blur-sm text-muted-foreground animate-fadeIn">
            Please configure your OpenRouter API key in the settings to use the AI Therapist.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;