
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AISection } from "./sections/AISection";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ConfigurationSettings() {
  const [openrouterApiKey, setOpenrouterApiKey] = useState(() => 
    localStorage.getItem('OPENROUTER_API_KEY') || ""
  );
  
  const [sideByVerseView, setSideByVerseView] = useState(() =>
    localStorage.getItem('SIDE_BY_VERSE_VIEW') === 'true'
  );

  const handleInputTokenChange = (value: string) => {
    localStorage.setItem('INPUT_TOKENS', value);
  };

  const handleOutputTokenChange = (value: string) => {
    localStorage.setItem('OUTPUT_TOKENS', value);
  };

  const handleSideByVerseViewChange = (checked: boolean) => {
    setSideByVerseView(checked);
    localStorage.setItem('SIDE_BY_VERSE_VIEW', checked.toString());
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AISection
          openrouterApiKey={openrouterApiKey}
          onOpenRouterKeyChange={setOpenrouterApiKey}
        />
        
        <AccordionItem value="quran-display">
          <AccordionTrigger className="font-medium text-gray-700">Quran Display Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="side-by-verse-view"
                  checked={sideByVerseView}
                  onCheckedChange={handleSideByVerseViewChange}
                />
                <Label htmlFor="side-by-verse-view">Side-by-Side Verse View</Label>
              </div>
              <p className="text-sm text-gray-500">
                When enabled, verses will be displayed side by side in a single row, from right to left.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
