import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { useJournalStore } from "@/store/useJournalStore";
import { useToast } from "@/hooks/use-toast";

export function AIReflection() {
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const journals = useJournalStore((state) => state.journals);
  const { toast } = useToast();

  const generateReflection = async () => {
    setIsLoading(true);
    try {
      const apiKey = localStorage.getItem('OPENROUTER_API_KEY');
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
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a mindful AI therapist. Analyze the journal entries and provide a compassionate, insightful reflection focusing on patterns, growth opportunities, and positive observations. Keep the response concise and encouraging."
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
      setReflection(data.choices[0].message.content);
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
        <Card className="p-6 bg-secondary/5 border-none">
          <p className="text-lg leading-relaxed">{reflection}</p>
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