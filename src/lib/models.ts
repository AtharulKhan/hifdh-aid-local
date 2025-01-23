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
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "OpenAI",
    description: "Gemini",
    contextWindow: 2000000
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT4o Mini",
    provider: "OpenAI",
    description: "Mini GPT4o",
    contextWindow: 128000
  },
  {
    id: "openai/gpt-4o-2024-11-20",
    name: "GPT4o",
    provider: "OpenAI",
    description: "Advanced reasoning model",
    contextWindow: 128000
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Advanced reasoning model",
    contextWindow: 64000
  },
  {
    id: "openai/o1-mini",
    name: "OpenAI O1 Mini",
    provider: "OpenAI",
    description: "Compact version of GPT-4o",
    contextWindow: 128000
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Balanced intelligence and speed",
    contextWindow: 200000
  }
];

export const getModelById = (id: string) => 
  MODELS.find(model => model.id === id) || MODELS[0];
