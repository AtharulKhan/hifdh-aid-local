import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Maximize2, Minimize2, BookOpen, Menu, RefreshCw, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, ChatStream, ChatHistory } from './types';
import { ModelSelector } from './ModelSelector';
import { JournalSelector } from './JournalSelector';
import { useJournalContext } from '@/hooks/use-journal-context';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VoiceChat } from './VoiceChat';

const CHAT_HISTORY_KEY = 'chat_history';

// Base instruction for markdown formatting
const BASE_SYSTEM_INSTRUCTION = `You are a helpful AI assistant. Please format your responses using markdown for better readability. Use:
- Headers (# ## ###) for sections
- Lists (* or -) for enumeration
- **Bold** or *italic* for emphasis
- \`code blocks\` for technical terms
- > for quotes
- --- for separators when needed
- Tables using | for columns
- [links](url) for references

Always structure your responses with clear sections using markdown headers and appropriate formatting for different types of content.`;

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedModel, setSelectedModel] = useState(() => 
    localStorage.getItem('SELECTED_MODEL') || 'openrouter/auto'
  );
  const [chatHistory, setChatHistory] = useState<ChatHistory>(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    return saved ? JSON.parse(saved) : { chats: [], currentChatId: null };
  });

  const { selectedJournals } = useJournalContext();

  useEffect(() => {
    if (chatHistory.currentChatId) {
      const currentChat = chatHistory.chats.find(chat => chat.id === chatHistory.currentChatId);
      if (currentChat) {
        setMessages(currentChat.messages);
      }
    }
  }, [chatHistory.currentChatId]);

  useEffect(() => {
    if (chatHistory.currentChatId) {
      const updatedChats = chatHistory.chats.map(chat => 
        chat.id === chatHistory.currentChatId ? { ...chat, messages } : chat
      );
      const newHistory = { ...chatHistory, chats: updatedChats };
      setChatHistory(newHistory);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
    }
  }, [messages]);

  const createNewChat = () => {
    const newChat: ChatStream = {
      id: Date.now().toString(),
      messages: [],
      createdAt: Date.now(),
      title: "New Chat"
    };
    const newHistory = {
      chats: [...chatHistory.chats, newChat],
      currentChatId: newChat.id
    };
    setChatHistory(newHistory);
    setMessages([]);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const resetChat = () => {
    setMessages([]);
    if (chatHistory.currentChatId) {
      const updatedChats = chatHistory.chats.map(chat => 
        chat.id === chatHistory.currentChatId ? { ...chat, messages: [] } : chat
      );
      const newHistory = { ...chatHistory, chats: updatedChats };
      setChatHistory(newHistory);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
    }
  };

  const switchChat = (chatId: string) => {
    const newHistory = { ...chatHistory, currentChatId: chatId };
    setChatHistory(newHistory);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const deleteChat = (chatId: string) => {
    const updatedChats = chatHistory.chats.filter(chat => chat.id !== chatId);
    const newHistory = {
      chats: updatedChats,
      currentChatId: chatId === chatHistory.currentChatId ? null : chatHistory.currentChatId
    };
    setChatHistory(newHistory);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
    
    // If we deleted the current chat, clear messages
    if (chatId === chatHistory.currentChatId) {
      setMessages([]);
    }

    toast({
      title: "Chat Deleted",
      description: "The chat has been removed from history",
    });
  };

  const deleteAllChats = () => {
    const newHistory = {
      chats: [],
      currentChatId: null
    };
    setChatHistory(newHistory);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
    setMessages([]);

    toast({
      title: "All Chats Deleted",
      description: "Chat history has been cleared",
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = localStorage.getItem('OPENROUTER_API_KEY');
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Create context from selected journals
      const journalContext = selectedJournals.map(journal => 
        `Context from journal "${journal.title}": ${journal.content}`
      ).join('\n\n');

      const systemMessage = {
        role: 'system',
        content: `${BASE_SYSTEM_INSTRUCTION}\n\nHere is some context from the user's journal entries:\n\n${journalContext}`
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            systemMessage,
            ...messages,
            userMessage
          ].map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now(),
        model: selectedModel
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const JournalContextContent = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Journal Context</h3>
      <JournalSelector />
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto overflow-hidden">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Chat History</span>
                  {chatHistory.chats.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteAllChats}
                      className="ml-2"
                    >
                      Delete All
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {chatHistory.chats.map((chat) => (
                  <div key={chat.id} className="flex items-center gap-2">
                    <Button
                      variant={chat.id === chatHistory.currentChatId ? "default" : "outline"}
                      className="flex-1 justify-start"
                      onClick={() => switchChat(chat.id)}
                    >
                      {chat.title || "Untitled Chat"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <h2 className="text-2xl font-semibold text-primary">
            Chat With AI Therapist
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={createNewChat}
            title="New Chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetChat}
            title="Reset Chat"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ModelSelector currentModel={selectedModel} onModelChange={setSelectedModel} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 px-4 flex-1 min-h-0">
        {isMobile ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Select Journal Context
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Select Journal Context</DialogTitle>
              </DialogHeader>
              <JournalContextContent />
            </DialogContent>
          </Dialog>
        ) : (
          <Card className="col-span-1 p-4 bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
            <JournalContextContent />
            <div className="mt-4">
              <VoiceChat />
            </div>
          </Card>
        )}

        <Card className="col-span-1 md:col-span-2 flex-1 overflow-auto p-6 bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-secondary/5 pointer-events-none" />
          <div className="relative z-10 space-y-4 max-h-full overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-slideIn`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-blue-50 text-gray-800 dark:bg-blue-900/20 dark:text-gray-200 backdrop-blur-sm border border-blue-100/20 prose dark:prose-invert prose-sm md:prose-base max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-4 [&>h1]:mt-6 [&>h2]:mt-5 [&>h3]:mt-4 [&>ul]:my-4 [&>ol]:my-4 [&>blockquote]:my-4 [&>pre]:my-4'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                  {message.model && (
                    <p className="text-xs mt-2 opacity-70">
                      {message.model}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 left-0 right-0 w-full px-4 pb-4 bg-background/5 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-xl -z-10" />
          <div className="relative backdrop-blur-sm bg-background/80 rounded-2xl border border-primary/20 p-4 shadow-lg">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/50 resize-none transition-all duration-200 rounded-xl ${
                  isExpanded ? 'h-32' : 'h-12'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/20 transition-colors"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/20 transition-colors"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !input.trim()}
                  className="bg-primary hover:bg-primary/90 transition-colors animate-pulse"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
