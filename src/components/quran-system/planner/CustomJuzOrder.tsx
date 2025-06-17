
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, RotateCcw, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { AlreadyMemorizedData } from '@/hooks/use-memorization-planner';

interface CustomJuzOrderProps {
  juzOrder: number[];
  onOrderChange: (newOrder: number[]) => void;
  alreadyMemorized: AlreadyMemorizedData;
}

export const CustomJuzOrder = ({ juzOrder, onOrderChange, alreadyMemorized }: CustomJuzOrderProps) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const handleDragStart = (e: React.DragEvent, juzNumber: number) => {
    setDraggedItem(juzNumber);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetJuzNumber: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === targetJuzNumber) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...juzOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetJuzNumber);

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
    onOrderChange(Array.from({ length: 30 }, (_, i) => i + 1));
    setSelectedItems(new Set());
  };

  const resetToReverse = () => {
    onOrderChange(Array.from({ length: 30 }, (_, i) => 30 - i));
    setSelectedItems(new Set());
  };

  const isJuzMemorized = (juzNumber: number) => {
    return alreadyMemorized.juz.includes(juzNumber);
  };

  const handleItemSelect = (juzNumber: number, isSelected: boolean) => {
    const newSelection = new Set(selectedItems);
    if (isSelected) {
      newSelection.add(juzNumber);
    } else {
      newSelection.delete(juzNumber);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === juzOrder.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(juzOrder));
    }
  };

  const handleDeleteSelected = () => {
    const newOrder = juzOrder.filter(juz => !selectedItems.has(juz));
    onOrderChange(newOrder);
    setSelectedItems(new Set());
  };

  const handleMoveSelectedUp = () => {
    if (selectedItems.size === 0) return;
    
    const newOrder = [...juzOrder];
    const selectedArray = Array.from(selectedItems);
    
    // Find the first selected item's index
    const firstSelectedIndex = Math.min(...selectedArray.map(item => newOrder.indexOf(item)));
    
    if (firstSelectedIndex > 0) {
      // Move all selected items up by one position
      selectedArray.forEach(item => {
        const currentIndex = newOrder.indexOf(item);
        if (currentIndex > 0) {
          [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
        }
      });
      onOrderChange(newOrder);
    }
  };

  const handleMoveSelectedDown = () => {
    if (selectedItems.size === 0) return;
    
    const newOrder = [...juzOrder];
    const selectedArray = Array.from(selectedItems);
    
    // Find the last selected item's index
    const lastSelectedIndex = Math.max(...selectedArray.map(item => newOrder.indexOf(item)));
    
    if (lastSelectedIndex < newOrder.length - 1) {
      // Move all selected items down by one position (reverse order to avoid conflicts)
      selectedArray.reverse().forEach(item => {
        const currentIndex = newOrder.indexOf(item);
        if (currentIndex < newOrder.length - 1) {
          [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
        }
      });
      onOrderChange(newOrder);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="flex items-center gap-2"
        >
          {selectedItems.size === juzOrder.length ? 'Deselect All' : 'Select All'}
        </Button>
        {selectedItems.size > 0 && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMoveSelectedUp}
              className="flex items-center gap-2"
            >
              <MoveUp className="h-3 w-3" />
              Move Up
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMoveSelectedDown}
              className="flex items-center gap-2"
            >
              <MoveDown className="h-3 w-3" />
              Move Down
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-3 w-3" />
              Remove Selected ({selectedItems.size})
            </Button>
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
            {juzOrder.map((juzNumber, index) => {
              const isMemorized = isJuzMemorized(juzNumber);
              const isDragging = draggedItem === juzNumber;
              const isSelected = selectedItems.has(juzNumber);
              
              return (
                <div
                  key={juzNumber}
                  draggable={!isMemorized}
                  onDragStart={(e) => handleDragStart(e, juzNumber)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, juzNumber)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isMemorized && handleItemSelect(juzNumber, !isSelected)}
                  className={`
                    relative flex items-center justify-center p-2 border rounded-lg cursor-pointer
                    transition-all duration-200
                    ${isDragging ? 'opacity-50 scale-95' : ''}
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${isMemorized 
                      ? 'bg-green-50 border-green-200 cursor-not-allowed opacity-60' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }
                  `}
                  title={isMemorized ? 'Already memorized - will be excluded from schedule' : 'Click to select, drag to reorder'}
                >
                  <div className="flex items-center gap-1">
                    {!isMemorized && (
                      <GripVertical className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${isMemorized ? 'text-green-700' : 'text-gray-700'}`}>
                      {juzNumber}
                    </span>
                  </div>
                  
                  {isMemorized && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-green-500 text-white">
                      ✓
                    </Badge>
                  )}
                  
                  {isSelected && !isMemorized && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-blue-500 text-white">
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
              Click to select, drag to reorder Juz numbers
            </p>
            <p className="text-xs text-green-600 mt-1">
              ✓ Green Juz are already memorized and will be excluded from the schedule
            </p>
            {selectedItems.size > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                {selectedItems.size} Juz selected
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
