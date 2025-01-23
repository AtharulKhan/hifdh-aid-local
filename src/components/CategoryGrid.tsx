import React from "react";
import { Card } from "@/components/ui/card";

interface Category {
  id: number;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: 1, name: "Entrées", icon: "🥗" },
  { id: 2, name: "Plats", icon: "🍖" },
  { id: 3, name: "Desserts", icon: "🍰" },
  { id: 4, name: "Boissons", icon: "🥤" },
];

export const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="p-6 hover:bg-primary/5 transition-all duration-300 cursor-pointer 
                   hover:scale-105 hover:shadow-lg border border-gray-100
                   flex flex-col items-center justify-center space-y-3
                   bg-white/80 backdrop-blur-sm animate-scaleIn"
        >
          <span className="text-5xl transform transition-transform hover:scale-110">{category.icon}</span>
          <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {category.name}
          </h3>
        </Card>
      ))}
    </div>
  );
};