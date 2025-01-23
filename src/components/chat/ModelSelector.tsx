import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODELS } from "@/lib/models";

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  return (
    <Select value={currentModel} onValueChange={onModelChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}