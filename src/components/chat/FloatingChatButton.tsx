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
          side="right"
          className="fixed inset-0 m-4 w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] 
                    max-w-none rounded-xl p-0 right-auto transform-none shadow-2xl"
        >
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-2xl">Chat with AI Therapist</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-2rem-73px)]">
            <ChatInterface />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
