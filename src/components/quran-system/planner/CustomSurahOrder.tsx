
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, RotateCcw } from 'lucide-react';
import { AlreadyMemorizedData } from '@/hooks/use-memorization-planner';

interface CustomSurahOrderProps {
  surahOrder: number[];
  onOrderChange: (newOrder: number[]) => void;
  alreadyMemorized: AlreadyMemorizedData;
}

export const CustomSurahOrder = ({ surahOrder, onOrderChange, alreadyMemorized }: CustomSurahOrderProps) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, surahNumber: number) => {
    setDraggedItem(surahNumber);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSurahNumber: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === targetSurahNumber) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...surahOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetSurahNumber);

    // Remove the dragged item and insert it at the target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    onOrderChange(newOrder);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const resetToSequential = () => {
    onOrderChange(Array.from({ length: 114 }, (_, i) => i + 1));
  };

  const resetToReverse = () => {
    onOrderChange(Array.from({ length: 114 }, (_, i) => 114 - i));
  };

  const isSurahMemorized = (surahNumber: number) => {
    return alreadyMemorized.surahs.includes(surahNumber);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetToSequential}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-3 w-3" />
          Reset to Sequential
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetToReverse}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-3 w-3" />
          Reset to Reverse
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 max-h-96 overflow-y-auto">
            {surahOrder.map((surahNumber, index) => {
              const isMemorized = isSurahMemorized(surahNumber);
              const isDragging = draggedItem === surahNumber;
              
              return (
                <div
                  key={surahNumber}
                  draggable={!isMemorized}
                  onDragStart={(e) => handleDragStart(e, surahNumber)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, surahNumber)}
                  onDragEnd={handleDragEnd}
                  className={`
                    relative flex items-center justify-center p-2 border rounded-lg cursor-move
                    transition-all duration-200
                    ${isDragging ? 'opacity-50 scale-95' : ''}
                    ${isMemorized 
                      ? 'bg-green-50 border-green-200 cursor-not-allowed opacity-60' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }
                  `}
                  title={isMemorized ? 'Already memorized - will be excluded from schedule' : 'Drag to reorder'}
                >
                  <div className="flex items-center gap-1">
                    {!isMemorized && (
                      <GripVertical className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${isMemorized ? 'text-green-700' : 'text-gray-700'}`}>
                      {surahNumber}
                    </span>
                  </div>
                  
                  {isMemorized && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-green-500 text-white">
                      ✓
                    </Badge>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <GripVertical className="h-3 w-3" />
              Drag Surah numbers to reorder them
            </p>
            <p className="text-xs text-green-600 mt-1">
              ✓ Green Surahs are already memorized and will be excluded from the schedule
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
