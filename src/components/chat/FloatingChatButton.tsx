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
        <SheetContent side="right" className="w-[90vw] sm:w-[600px] p-0">
          <SheetHeader className="px-4 py-2">
            <SheetTitle>Chat with AI Therapist</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)]">
            <ChatInterface />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};