import React from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        AI Therapist
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          {apiKey ? (
            <div>Chat interface coming soon...</div>
          ) : (
            <div className="text-center text-muted-foreground">
              Please configure your OpenRouter API key in the settings to use the AI Therapist.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;