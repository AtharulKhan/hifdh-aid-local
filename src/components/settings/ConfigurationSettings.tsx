import { Accordion } from "@/components/ui/accordion";
import { AISection } from "./sections/AISection";
import { useState } from "react";

export function ConfigurationSettings() {
  const [openrouterApiKey, setOpenrouterApiKey] = useState(() => 
    localStorage.getItem('OPENROUTER_API_KEY') || ""
  );

  const handleInputTokenChange = (value: string) => {
    localStorage.setItem('INPUT_TOKENS', value);
  };

  const handleOutputTokenChange = (value: string) => {
    localStorage.setItem('OUTPUT_TOKENS', value);
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AISection
          openrouterApiKey={openrouterApiKey}
          onOpenRouterKeyChange={setOpenrouterApiKey}
          onInputTokenChange={handleInputTokenChange}
          onOutputTokenChange={handleOutputTokenChange}
          customInstructions=""
          onCustomInstructionsChange={() => {}}
        />
      </Accordion>
    </div>
  );
}