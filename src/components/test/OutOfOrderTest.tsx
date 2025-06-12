
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shuffle, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { getVersesArray, getSurahName } from "@/data/quranData";

interface OutOfOrderTestProps {
  onBack: () => void;
}

interface VerseItem {
  id: number;
  text: string;
  originalOrder: number;
  currentOrder: number;
}

export const OutOfOrderTest = ({ onBack }: OutOfOrderTestProps) => {
  const [numVerses, setNumVerses] = useState(4);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [isTestActive, setIsTestActive] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<'correct' | 'incorrect' | null>(null);
  const [currentPassage, setCurrentPassage] = useState<string>("");

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newVerses = [...verses];
    const draggedVerse = newVerses[draggedItem];
    
    // Remove the dragged item
    newVerses.splice(draggedItem, 1);
    
    // Insert it at the new position
    const actualDropIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newVerses.splice(actualDropIndex, 0, draggedVerse);
    
    // Update current orders
    newVerses.forEach((verse, index) => {
      verse.currentOrder = index;
    });

    setVerses(newVerses);
    setDraggedItem(null);
  };

  const checkAnswer = () => {
    const isCorrect = verses.every((verse, index) => verse.originalOrder === index);
    setTestResult(isCorrect ? 'correct' : 'incorrect');
  };

  const resetTest = () => {
    setIsTestActive(false);
    setTestResult(null);
    setVerses([]);
    setCurrentPassage("");
  };

  const generateTest = () => {
    const allVerses = getVersesArray();
    
    // Filter verses for selected Surah only
    const availableVerses = allVerses.filter(verse => verse.surah === selectedSurah);

    if (availableVerses.length < numVerses) {
      alert(`Not enough verses available in the selected Surah. Available: ${availableVerses.length}, Requested: ${numVerses}`);
      return;
    }

    // Find consecutive verses from the same surah
    let selectedVerses: any[] = [];
    let attempts = 0;
    const maxAttempts = 100;

    while (selectedVerses.length === 0 && attempts < maxAttempts) {
      attempts++;
      
      // Pick a random starting point from available verses
      const maxStartIndex = Math.max(0, availableVerses.length - numVerses);
      const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));
      
      // Try to find consecutive verses starting from this point
      let consecutiveVerses: any[] = [];
      let currentVerse = availableVerses[startIndex];
      
      if (!currentVerse) continue;
      
      consecutiveVerses.push(currentVerse);
      
      // Look for consecutive verses after this one
      for (let i = 1; i < numVerses; i++) {
        const nextVerseInSequence = availableVerses.find(v => 
          v.surah === currentVerse.surah && 
          v.ayah === currentVerse.ayah + i
        );
        
        if (nextVerseInSequence) {
          consecutiveVerses.push(nextVerseInSequence);
        } else {
          break;
        }
      }
      
      // If we found enough consecutive verses, use them
      if (consecutiveVerses.length === numVerses) {
        selectedVerses = consecutiveVerses;
      }
    }

    // Fallback: if no consecutive verses found, try a different approach
    if (selectedVerses.length === 0) {
      // Sort available verses by ayah number
      const sortedVerses = availableVerses.sort((a, b) => a.ayah - b.ayah);
      
      // Find consecutive verses
      for (let i = 0; i <= sortedVerses.length - numVerses; i++) {
        const sequence = sortedVerses.slice(i, i + numVerses);
        let isConsecutive = true;
        
        for (let j = 1; j < sequence.length; j++) {
          if (sequence[j].ayah !== sequence[j-1].ayah + 1) {
            isConsecutive = false;
            break;
          }
        }
        
        if (isConsecutive) {
          selectedVerses = sequence;
          break;
        }
      }
    }

    // Final fallback: if still no consecutive verses, take any numVerses from the surah
    if (selectedVerses.length === 0) {
      if (availableVerses.length >= numVerses) {
        const startIndex = Math.floor(Math.random() * (availableVerses.length - numVerses + 1));
        selectedVerses = availableVerses.slice(startIndex, startIndex + numVerses);
      } else {
        alert(`Unable to find ${numVerses} verses in the selected Surah.`);
        return;
      }
    }

    // Create verse items with original and shuffled order
    const verseItems: VerseItem[] = selectedVerses.map((verse, index) => ({
      id: verse.id,
      text: verse.text
        .replace(/\s*\(\d+\)\s*$/, '') // Remove parenthetical numbers
        .replace(/\s*\d+\s*$/, '') // Remove standalone numbers at the end
        .replace(/\s*[٠-٩]+\s*$/, '') // Remove Arabic-Indic digits at the end
        .replace(/\s*[۰-۹]+\s*$/, '') // Remove Extended Arabic-Indic digits at the end
        .trim(), // Remove any trailing whitespace
      originalOrder: index,
      currentOrder: index
    }));

    // Shuffle the verses
    const shuffledVerses = [...verseItems];
    for (let i = shuffledVerses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledVerses[i], shuffledVerses[j]] = [shuffledVerses[j], shuffledVerses[i]];
      shuffledVerses[i].currentOrder = i;
      shuffledVerses[j].currentOrder = j;
    }

    // Set passage info (without verse numbers to avoid giving away the answer)
    setCurrentPassage(`${getSurahName(selectedSurah)}`);

    setVerses(shuffledVerses);
    setIsTestActive(true);
    setTestResult(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button onClick={onBack} variant="outline" size="sm" className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
        
        <div className="text-center flex-1">
          <div className="flex items-center justify-center space-x-2">
            <Shuffle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Out-of-Order Line Shuffle</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Drag and rearrange verses in the correct order</p>
        </div>
        
        <div className="w-full sm:w-24 hidden sm:block"></div>
      </div>

      {!isTestActive ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Shuffle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <span>Test Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="numVerses" className="text-sm">Number of verses to shuffle (3-8)</Label>
                <Input
                  id="numVerses"
                  type="number"
                  min="3"
                  max="8"
                  value={numVerses}
                  onChange={(e) => setNumVerses(Math.max(3, Math.min(8, parseInt(e.target.value) || 3)))}
                  className="w-full sm:w-32"
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  The test will present {numVerses} consecutive verses in random order for you to rearrange.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surahSelect" className="text-sm">Select Surah (1-114)</Label>
                <Input
                  id="surahSelect"
                  type="number"
                  min="1"
                  max="114"
                  value={selectedSurah}
                  onChange={(e) => setSelectedSurah(Math.max(1, Math.min(114, parseInt(e.target.value) || 1)))}
                  className="w-full sm:w-32"
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  Choose which Surah to test from: {getSurahName(selectedSurah)}
                </p>
              </div>
            </div>

            <Button onClick={generateTest} size="lg" className="w-full">
              <Shuffle className="h-4 w-4 mr-2" />
              Start Shuffle Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Test Info */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-800 text-sm sm:text-base">Current Passage</h3>
                  <p className="text-purple-700 text-sm sm:text-base break-words">{currentPassage}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button onClick={checkAnswer} disabled={testResult !== null} size="sm" className="w-full sm:w-auto">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Order
                  </Button>
                  <Button onClick={resetTest} variant="outline" size="sm" className="w-full sm:w-auto">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {testResult && (
            <Card className={testResult === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  {testResult === 'correct' ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  )}
                  <span className={`font-medium text-sm sm:text-base ${testResult === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult === 'correct' ? 'Correct! Well done!' : 'Incorrect order. Try again!'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draggable Verses */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Drag to rearrange in correct order:
            </h3>
            {verses.map((verse, index) => (
              <Card
                key={verse.id}
                className={`cursor-move transition-all duration-200 ${
                  draggedItem === index ? 'opacity-50 scale-95' : ''
                } ${
                  testResult === 'correct' && verse.originalOrder === index
                    ? 'bg-green-50 border-green-200'
                    : testResult === 'incorrect' && verse.originalOrder !== index
                    ? 'bg-red-50 border-red-200'
                    : 'hover:shadow-md'
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-medium text-purple-700">{index + 1}</span>
                    </div>
                    <p className="text-gray-800 flex-1 text-sm sm:text-base leading-relaxed break-words" dir="rtl">
                      {verse.text}
                    </p>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      Drag to reorder
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs sm:text-sm text-gray-500">
              Drag the verses to arrange them in the correct sequential order
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
