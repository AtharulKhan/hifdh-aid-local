import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shuffle, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { getVersesArray, getSurahName } from "@/data/quranData";

interface TestMemorizationEntry {
  id: string;
  type: 'surah' | 'juz' | 'page';
  name: string;
  reference: string;
  dateMemorized: string;
  isMemorized: boolean;
  juz: number;
  startPage: number;
  endPage: number;
}

interface OutOfOrderTestProps {
  onBack: () => void;
  memorizedEntries: TestMemorizationEntry[];
}

interface VerseItem {
  id: number;
  text: string;
  originalOrder: number;
  currentOrder: number;
}

export const OutOfOrderTest = ({ onBack, memorizedEntries }: OutOfOrderTestProps) => {
  const [numVerses, setNumVerses] = useState(4);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [isTestActive, setIsTestActive] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<'correct' | 'incorrect' | null>(null);
  const [currentPassage, setCurrentPassage] = useState<string>("");

  const generateTest = () => {
    if (memorizedEntries.length === 0) return;

    const allVerses = getVersesArray();
    
    // Get all verses that are within memorized Juz ranges
    const availableVerses = allVerses.filter(verse => {
      return memorizedEntries.some(entry => {
        if (entry.type === 'juz') {
          // Calculate approximate verse range for each Juz (each Juz has roughly 600+ verses)
          const juzStartVerse = ((entry.juz - 1) * 600) + 1;
          const juzEndVerse = entry.juz * 600;
          return verse.id >= juzStartVerse && verse.id <= juzEndVerse;
        }
        return false;
      });
    });

    if (availableVerses.length < numVerses) {
      alert(`Not enough verses available. Maximum: ${availableVerses.length}`);
      return;
    }

    // Find consecutive verses from the same surah
    let selectedVerses: any[] = [];
    let attempts = 0;
    const maxAttempts = 50;

    while (selectedVerses.length === 0 && attempts < maxAttempts) {
      attempts++;
      
      // Pick a random starting point
      const startIndex = Math.floor(Math.random() * (availableVerses.length - numVerses + 1));
      const potentialVerses = availableVerses.slice(startIndex, startIndex + numVerses);
      
      // Check if they're from the same surah and consecutive
      const firstVerse = potentialVerses[0];
      const lastVerse = potentialVerses[numVerses - 1];
      
      if (firstVerse.surah === lastVerse.surah) {
        // Check if verses are consecutive
        let consecutive = true;
        for (let i = 1; i < potentialVerses.length; i++) {
          if (potentialVerses[i].ayah !== potentialVerses[i-1].ayah + 1 ||
              potentialVerses[i].surah !== potentialVerses[i-1].surah) {
            consecutive = false;
            break;
          }
        }
        
        if (consecutive) {
          selectedVerses = potentialVerses;
        }
      }
    }

    // Fallback: if no consecutive verses found, pick any consecutive sequence
    if (selectedVerses.length === 0) {
      // Group verses by surah and find consecutive sequences
      const surahGroups: Record<number, any[]> = {};
      availableVerses.forEach(verse => {
        if (!surahGroups[verse.surah]) {
          surahGroups[verse.surah] = [];
        }
        surahGroups[verse.surah].push(verse);
      });

      // Sort each surah group by ayah number
      Object.keys(surahGroups).forEach(surah => {
        surahGroups[parseInt(surah)].sort((a, b) => a.ayah - b.ayah);
      });

      // Find a surah with enough consecutive verses
      for (const surah of Object.keys(surahGroups)) {
        const verses = surahGroups[parseInt(surah)];
        for (let i = 0; i <= verses.length - numVerses; i++) {
          const sequence = verses.slice(i, i + numVerses);
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
        if (selectedVerses.length > 0) break;
      }
    }

    // Final fallback: just take any numVerses from available verses
    if (selectedVerses.length === 0) {
      const startIndex = Math.floor(Math.random() * (availableVerses.length - numVerses + 1));
      selectedVerses = availableVerses.slice(startIndex, startIndex + numVerses);
    }

    // Create verse items with original and shuffled order
    const verseItems: VerseItem[] = selectedVerses.map((verse, index) => ({
      id: verse.id,
      text: verse.text,
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

    // Set passage info
    const firstVerse = selectedVerses[0];
    const lastVerse = selectedVerses[selectedVerses.length - 1];
    setCurrentPassage(`${getSurahName(firstVerse.surah)} ${firstVerse.ayah}-${lastVerse.ayah}`);

    setVerses(shuffledVerses);
    setIsTestActive(true);
    setTestResult(null);
  };

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

  if (memorizedEntries.length === 0) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto px-4">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
        
        <Card className="text-center py-12">
          <CardContent>
            <Shuffle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Memorization Data</h3>
            <p className="text-gray-500">
              Mark your memorized Juz in the Muraja'ah section to enable this test.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
        
        <div className="text-center">
          <div className="flex items-center space-x-2">
            <Shuffle className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">Out-of-Order Line Shuffle</h1>
          </div>
          <p className="text-gray-600 mt-1">Drag and rearrange verses in the correct order</p>
        </div>
        
        <div className="w-24"></div>
      </div>

      {!isTestActive ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shuffle className="h-5 w-5 text-purple-600" />
              <span>Test Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="numVerses">Number of verses to shuffle (3-8)</Label>
              <Input
                id="numVerses"
                type="number"
                min="3"
                max="8"
                value={numVerses}
                onChange={(e) => setNumVerses(Math.max(3, Math.min(8, parseInt(e.target.value) || 3)))}
                className="w-32"
              />
              <p className="text-sm text-gray-500">
                The test will present {numVerses} consecutive verses in random order for you to rearrange.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Available Content:</h4>
              <div className="flex flex-wrap gap-2">
                {memorizedEntries.slice(0, 5).map((entry) => (
                  <Badge key={entry.id} variant="secondary">
                    {entry.name}
                  </Badge>
                ))}
                {memorizedEntries.length > 5 && (
                  <Badge variant="outline">+{memorizedEntries.length - 5} more</Badge>
                )}
              </div>
            </div>

            <Button onClick={generateTest} size="lg" className="w-full">
              <Shuffle className="h-4 w-4 mr-2" />
              Start Shuffle Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Test Info */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-800">Current Passage</h3>
                  <p className="text-purple-700">{currentPassage}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={checkAnswer} disabled={testResult !== null}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Order
                  </Button>
                  <Button onClick={resetTest} variant="outline">
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
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  {testResult === 'correct' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${testResult === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult === 'correct' ? 'Correct! Well done!' : 'Incorrect order. Try again!'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draggable Verses */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
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
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-700">{index + 1}</span>
                    </div>
                    <p className="text-gray-800 flex-1" dir="rtl">
                      {verse.text}
                    </p>
                    <div className="text-xs text-gray-500">
                      Drag to reorder
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Drag the verses to arrange them in the correct sequential order
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
