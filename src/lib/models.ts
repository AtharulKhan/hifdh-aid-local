export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
}

export const MODELS: AIModel[] = [
  {
    id: "openrouter/auto",
    name: "Auto Select",
    provider: "Open Router",
    description: "Best model for mental health conversations",
    contextWindow: 2000000
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Most capable model for therapy",
    contextWindow: 200000
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Balanced intelligence and speed",
    contextWindow: 200000
  },
  {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Advanced AI for therapeutic conversations",
    contextWindow: 128000
  },
  {
    id: "meta-llama/llama-3-70b",
    name: "Llama 3 70B",
    provider: "Meta",
    description: "Open source model for therapy",
    contextWindow: 128000
  }
];

export const getModelById = (id: string) => 
  MODELS.find(model => model.id === id) || MODELS[0];