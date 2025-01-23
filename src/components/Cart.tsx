import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

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
    <Card className="p-4 h-[calc(100vh-2rem)] flex flex-col">
      <h2 className="font-bold text-xl mb-4">Panier</h2>
      <ScrollArea className="flex-grow">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {item.price.toFixed(2)}€
                </p>
              </div>
              <p className="font-semibold">
                {(item.price * item.quantity).toFixed(2)}€
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between mb-4">
          <p className="font-bold">Total</p>
          <p className="font-bold">{total.toFixed(2)}€</p>
        </div>
        <Button
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleCheckout}
        >
          Valider la commande
        </Button>
      </div>
    </Card>
  );
};