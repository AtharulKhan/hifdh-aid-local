import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: number;
  table: number;
  items: { name: string; quantity: number; price: number }[];
  status: "pending" | "preparing" | "ready" | "served";
  timestamp: string;
}

const orders: Order[] = [
  {
    id: 1,
    table: 4,
    items: [
      { name: "Salade César", quantity: 1, price: 12.99 },
      { name: "Pizza Margherita", quantity: 2, price: 15.99 }
    ],
    status: "preparing",
    timestamp: "2024-02-20T12:30:00"
  },
  {
    id: 2,
    table: 7,
    items: [
      { name: "Tiramisu", quantity: 3, price: 8.99 }
    ],
    status: "ready",
    timestamp: "2024-02-20T12:35:00"
  }
];

const Orders = () => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "preparing": return "bg-blue-500";
      case "ready": return "bg-green-500";
      case "served": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Commandes en cours</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Table {order.table}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {order.status}
              </Badge>
            </div>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">
                    {(item.price * item.quantity).toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>
                  {order.items
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}€
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;