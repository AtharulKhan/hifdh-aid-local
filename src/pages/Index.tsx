import React from "react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Cart } from "@/components/Cart";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Restaurant POS
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CategoryGrid />
          </div>
          <div className="lg:col-span-1">
            <Cart />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;