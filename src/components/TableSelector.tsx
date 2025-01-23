import React from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';

export const TableSelector = () => {
  const { setTableNumber, tableNumber } = useStore();
  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sélectionner une table</h2>
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-4 gap-2">
          {tables.map((number) => (
            <Button
              key={number}
              variant={tableNumber === number ? "default" : "outline"}
              onClick={() => setTableNumber(number)}
              className="w-full h-12 text-lg font-bold"
            >
              {number}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};