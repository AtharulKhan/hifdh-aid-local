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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <span className="text-4xl">{category.icon}</span>
          <h3 className="font-semibold text-lg">{category.name}</h3>
        </Card>
      ))}
    </div>
  );
};