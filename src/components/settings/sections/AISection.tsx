import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AISectionProps {
  openrouterApiKey: string;
  onOpenRouterKeyChange: (value: string) => void;
  onInputTokenChange: (value: string) => void;
  onOutputTokenChange: (value: string) => void;
  customInstructions: string;
  onCustomInstructionsChange: (value: string) => void;
}

export function AISection({ 
  openrouterApiKey,
  onOpenRouterKeyChange,
}: AISectionProps) {
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    localStorage.setItem('OPENROUTER_API_KEY', openrouterApiKey);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

  return (
    <AccordionItem value="ai-integration">
      <AccordionTrigger>AI Integration Settings</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">OpenRouter API Key</label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={openrouterApiKey}
                onChange={(e) => onOpenRouterKeyChange(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Get your API key from the <a href="https://openrouter.ai/keys" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">OpenRouter dashboard</a>
            </p>
          </div>
          
          <Button onClick={handleSaveApiKey}>Save Settings</Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}