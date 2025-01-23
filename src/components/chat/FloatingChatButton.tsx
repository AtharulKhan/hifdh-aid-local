import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './ChatInterface';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-all"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-none w-[96vw] h-[96vh] max-h-[96vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-0 border-0 shadow-2xl overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-2xl">Chat with AI Therapist</DialogTitle>
          </DialogHeader>
          <div className="h-[calc(96vh-65px)] overflow-y-auto">
            <ChatInterface />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
