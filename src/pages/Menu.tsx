import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/store/useStore";
import { MenuItem } from "@/types/menu";

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Pizza Margherita",
    description: "Tomate, mozzarella, basilic frais",
    price: 12.99,
    category: "Plats",
    image: "🍕",
    available: true
  },
  {
    id: 2,
    name: "Salade César",
    description: "Laitue romaine, parmesan, croûtons, sauce césar",
    price: 8.99,
    category: "Entrées",
    image: "🥗",
    available: true
  },
  {
    id: 3,
    name: "Tiramisu",
    description: "Biscuits, café, mascarpone, cacao",
    price: 6.99,
    category: "Desserts",
    image: "🍰",
    available: true
  }
];

const Menu = () => {
  const { toast } = useToast();
  const addItem = useStore((state) => state.addItem);

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    toast({
      title: "Ajouté au panier",
      description: `${item.name} a été ajouté à votre commande.`
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="text-4xl mb-4 text-center">{item.image}</div>
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{item.price.toFixed(2)}€</span>
                <Button 
                  onClick={() => handleAddToCart(item)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Menu;