import React from "react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Cart } from "@/components/Cart";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant POS</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CategoryGrid />
            {/* Espace pour la liste des produits qui sera ajoutée plus tard */}
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