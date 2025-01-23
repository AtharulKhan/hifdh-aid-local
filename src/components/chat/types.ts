export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
}

export interface ChatStream {
  id: string;
  messages: ChatMessage[];
  title?: string;
  createdAt: number;
}

export interface ChatHistory {
  chats: ChatStream[];
  currentChatId: string | null;
}