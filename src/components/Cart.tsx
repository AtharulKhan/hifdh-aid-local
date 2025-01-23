import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Minus, ShoppingCart } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const Cart = () => {
  const { toast } = useToast();
  const [items, setItems] = React.useState<CartItem[]>([
    { id: 1, name: "Salade César", price: 12.99, quantity: 1 },
    { id: 2, name: "Pizza Margherita", price: 15.99, quantity: 2 },
  ]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    toast({
      title: "Commande validée !",
      description: "Votre commande a été envoyée en cuisine.",
    });
  };

  return (
    <Card className="p-6 h-[calc(100vh-2rem)] flex flex-col bg-white/80 backdrop-blur-xl shadow-xl animate-slideIn">
      <div className="flex items-center space-x-2 mb-6">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Panier
        </h2>
      </div>
      
      <ScrollArea className="flex-grow pr-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x {item.price.toFixed(2)}€
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {(item.price * item.quantity).toFixed(2)}€
                </p>
              </div>
              <div className="flex items-center justify-end mt-2 space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    setItems(items.map(i => 
                      i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
                    ).filter(i => i.quantity > 0));
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    setItems(items.map(i => 
                      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                    ));
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between mb-6">
          <p className="font-bold text-lg">Total</p>
          <p className="font-bold text-lg text-primary">{total.toFixed(2)}€</p>
        </div>
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl
                     shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-105"
          onClick={handleCheckout}
        >
          Valider la commande
        </Button>
      </div>
    </Card>
  );
};