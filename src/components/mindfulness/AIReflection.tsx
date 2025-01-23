import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { useJournalStore } from "@/store/useJournalStore";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { ModelSelector } from "@/components/chat/ModelSelector";

export function AIReflection() {
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const journals = useJournalStore((state) => state.journals);
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(() => 
    localStorage.getItem('LAST_REFLECTION_MODEL') || 'openrouter/auto'
  );

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
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are an empathetic AI therapist having a one-on-one conversation with the user. Read their journal entries and respond in a warm, conversational tone as if you're speaking directly to them, focusing on providing reflective insights and gentle guidance without expecting responses. Use markdown formatting to structure your response, maintaining a natural dialogue that includes: 1) A warm greeting and acknowledgment of their sharing, 2) Gentle observations about patterns or themes you notice, 3) Reflective statements phrased as considerations rather than direct questions, 4) Specific examples from their entries to show you're really listening, 5) Supportive suggestions or insights framed as possibilities to explore, and 6) A caring closing note. Keep your tone compassionate and personal, like a trusted counselor speaking directly to their client, while ensuring all observations and insights are offered without creating pressure for the user to respond. Format your output in markdown with proper spacing between sections (using double line breaks) and emphasize important points with bold or italic text."
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
      localStorage.setItem('LAST_REFLECTION_MODEL', selectedModel);
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
        <div className="flex items-center gap-4">
          <ModelSelector currentModel={selectedModel} onModelChange={setSelectedModel} />
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
