import { Accordion } from "@/components/ui/accordion";
import { AISection } from "./sections/AISection";
import { useSettings } from "@/hooks/use-settings";

export function ConfigurationSettings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AISection />
      </Accordion>
    </div>
  );
}