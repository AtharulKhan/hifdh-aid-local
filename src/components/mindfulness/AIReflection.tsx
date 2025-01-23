import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { useJournalStore } from "@/store/useJournalStore";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

export function AIReflection() {
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const journals = useJournalStore((state) => state.journals);
  const { toast } = useToast();

  // Load saved reflection from localStorage on component mount
  useEffect(() => {
    const savedReflection = localStorage.getItem('lastAIReflection');
    if (savedReflection) {
      setReflection(savedReflection);
    }
  }, []);

  const generateReflection = async () => {
    setIsLoading(true);
    toast({
      title: "Generating Reflection",
      description: "Please wait while we analyze your journal entries...",
    });

    try {
      const apiKey = localStorage.getItem('OPENROUTER_API_KEY');
      const lastModel = localStorage.getItem('lastUsedAIModel') || "openai/gpt-4";
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found');
      }

      const recentJournals = journals
        .slice(-10)
        .map(j => `${j.title}: ${j.content}`)
        .join("\n\n");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model: lastModel,
          messages: [
            {
              role: "system",
              content: "You are an empathetic AI therapist having a one-on-one conversation with the user. Read their journal entries and respond in a warm, conversational tone as if you're speaking directly to them. Use markdown formatting to structure your response, but maintain a natural dialogue. Include:\n\n1. A warm greeting and acknowledgment of their sharing\n\n2. Gentle observations about patterns or themes you notice\n\n3. Thoughtful questions that encourage self-reflection\n\n4. Specific examples from their entries to show you're really listening\n\n5. Supportive suggestions or insights\n\n6. A caring closing note\n\nKeep your tone compassionate and personal, like a trusted counselor speaking directly to their client. Make sure your output is in markdown format with proper spacing between sections (use double line breaks). Format important points with bold or italic text for emphasis."
            },
            {
              role: "user",
              content: recentJournals || "No journal entries found."
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate reflection');
      }

      const data = await response.json();
      const newReflection = data.choices[0].message.content;
      setReflection(newReflection);
      localStorage.setItem('lastAIReflection', newReflection);
    } catch (error) {
      console.error('Reflection generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to generate reflection. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-secondary">AI Reflection</h2>
        <Button
          onClick={generateReflection}
          disabled={isLoading || journals.length === 0}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          Generate Insight
        </Button>
      </div>

      {reflection ? (
        <Card className="p-6 bg-secondary/5 border-none prose prose-sm max-w-none dark:prose-invert space-y-4">
          <ReactMarkdown>{reflection}</ReactMarkdown>
        </Card>
      ) : (
        <p className="text-center text-muted-foreground">
          {journals.length === 0 
            ? "Start journaling to receive AI-powered insights"
            : "Click the button above to generate a reflection based on your recent journal entries"}
        </p>
      )}
    </div>
  );
}
