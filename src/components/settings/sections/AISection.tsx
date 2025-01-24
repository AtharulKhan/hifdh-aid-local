import * as React from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Key } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AISectionProps {
  openrouterApiKey: string;
  onOpenRouterKeyChange: (value: string) => void;
}

export function AISection({ 
  openrouterApiKey,
  onOpenRouterKeyChange,
}: AISectionProps) {
  const { toast } = useToast();
  const [elevenLabsApiKey, setElevenLabsApiKey] = React.useState(() => 
    localStorage.getItem('ELEVENLABS_API_KEY') || ''
  );
  const [openAIApiKey, setOpenAIApiKey] = React.useState(() => 
    localStorage.getItem('OPENAI_API_KEY') || ''
  );

  const handleSaveApiKeys = () => {
    localStorage.setItem('OPENROUTER_API_KEY', openrouterApiKey);
    localStorage.setItem('ELEVENLABS_API_KEY', elevenLabsApiKey);
    localStorage.setItem('OPENAI_API_KEY', openAIApiKey);
    toast({
      title: "Success",
      description: "API keys saved successfully",
    });
  };

  return (
    <AccordionItem value="ai-integration">
      <AccordionTrigger>AI Integration Settings</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">OpenRouter API Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={openrouterApiKey}
                  onChange={(e) => onOpenRouterKeyChange(e.target.value)}
                  placeholder="Enter your OpenRouter API key"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Get your API key from the{" "}
                <a 
                  href="https://openrouter.ai/keys" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  OpenRouter dashboard
                </a>
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">ElevenLabs API Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={elevenLabsApiKey}
                  onChange={(e) => setElevenLabsApiKey(e.target.value)}
                  placeholder="Enter your ElevenLabs API key"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Get your API key from the{" "}
                <a 
                  href="https://elevenlabs.io/api" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  ElevenLabs dashboard
                </a>
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">OpenAI API Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={openAIApiKey}
                  onChange={(e) => setOpenAIApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Get your API key from the{" "}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  OpenAI dashboard
                </a>
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your API keys are stored securely in your browser's local storage. Never share your API keys publicly.
              </AlertDescription>
            </Alert>
          </div>
          
          <Button onClick={handleSaveApiKeys} className="w-full">
            <Key className="mr-2 h-4 w-4" />
            Save API Keys
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}