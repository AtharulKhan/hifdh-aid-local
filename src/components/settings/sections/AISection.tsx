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
  const [vapiApiKey, setVapiApiKey] = React.useState(() => 
    localStorage.getItem('VAPI_API_KEY') || ''
  );
  const [vapiAssistantId, setVapiAssistantId] = React.useState(() => 
    localStorage.getItem('VAPI_ASSISTANT_ID') || ''
  );

  const handleSaveApiKeys = () => {
    localStorage.setItem('OPENROUTER_API_KEY', openrouterApiKey);
    localStorage.setItem('VAPI_API_KEY', vapiApiKey);
    localStorage.setItem('VAPI_ASSISTANT_ID', vapiAssistantId);
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
              <label className="text-sm font-medium mb-2 block">Vapi API Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={vapiApiKey}
                  onChange={(e) => setVapiApiKey(e.target.value)}
                  placeholder="Enter your Vapi API key"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Get your API key from the{" "}
                <a 
                  href="https://vapi.ai/dashboard" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Vapi dashboard
                </a>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Vapi Assistant ID</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={vapiAssistantId}
                  onChange={(e) => setVapiAssistantId(e.target.value)}
                  placeholder="Enter your Vapi Assistant ID"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Find your Assistant ID in the{" "}
                <a 
                  href="https://vapi.ai/dashboard/assistants" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Vapi Assistants page
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