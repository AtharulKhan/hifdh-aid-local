import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './ChatInterface';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Bot className="h-6 w-6" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" // Animation still comes from right but position is overridden
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[85vh] max-w-none rounded-lg p-0 right-auto"
        >
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Chat with AI Therapist</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(85vh-57px)] overflow-auto">
            <ChatInterface />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
