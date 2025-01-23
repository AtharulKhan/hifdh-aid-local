import React from "react";
import { Calendar } from "@/components/Calendar";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Home
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Content will be added later */}
          </div>
          <div className="lg:col-span-1">
            <Calendar />
          </div>
        </div>
      </main>
      <FloatingChatButton />
    </div>
  );
};

export default Index;