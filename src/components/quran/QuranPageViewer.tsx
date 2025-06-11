
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, SkipForward, SkipBack } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";

interface QuranPageViewerProps {
  startingVerseId?: number;
}

export const QuranPageViewer: React.FC<QuranPageViewerProps> = ({ startingVerseId = 1 }) => {
  const [currentSurah, setCurrentSurah] = useState(() => {
    const startingVerse = getVerseById(startingVerseId);
    return startingVerse ? startingVerse.surah : 1;
  });
  const [showTajweed, setShowTajweed] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [hoverProgress, setHoverProgress] = useState<Record<number, number>>({});
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const allVerses = getVersesArray();
  
  // Get all verses for the current surah
  const getCurrentSurahVerses = (): QuranVerse[] => {
    return allVerses.filter(verse => verse.surah === currentSurah);
  };

  const currentSurahVerses = getCurrentSurahVerses();
  const firstVerse = currentSurahVerses[0];

  const handleNavigate = (verseId: number) => {
    const verse = getVerseById(verseId);
    if (verse) {
      setCurrentSurah(verse.surah);
      setActiveRowIndex(null);
      setHoverProgress({});
    }
  };

  const goToNextSurah = () => {
    const nextSurahNumber = currentSurah + 1;
    const nextSurahFirstVerse = allVerses.find(v => v.surah === nextSurahNumber);
    if (nextSurahFirstVerse) {
      setCurrentSurah(nextSurahNumber);
      setActiveRowIndex(null);
      setHoverProgress({});
    }
  };

  const goToPreviousSurah = () => {
    const prevSurahNumber = currentSurah - 1;
    if (prevSurahNumber >= 1) {
      setCurrentSurah(prevSurahNumber);
      setActiveRowIndex(null);
      setHoverProgress({});
    }
  };

  const getTajweedText = (verse: QuranVerse): string => {
    const words: string[] = [];
    let wordIndex = 1;
    
    while (true) {
      const tajweedKey = `${verse.surah}:${verse.ayah}:${wordIndex}`;
      const tajweedWord = tajweedData[tajweedKey];
      if (!tajweedWord) break;
      words.push(tajweedWord.text);
      wordIndex++;
    }
    
    return words.length > 0 ? words.join(' ') : verse.text;
  };

  const handleRowMouseMove = (event: React.MouseEvent<HTMLDivElement>, rowIndex: number) => {
    const rowElement = rowRefs.current[rowIndex];
    if (!rowElement) return;
    
    setActiveRowIndex(rowIndex);
    
    const rect = rowElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    // Calculate progress from right to left (for Arabic text)
    const progress = Math.max(0, Math.min(1, (width - x) / width));
    
    setHoverProgress(prev => ({
      ...prev,
      [rowIndex]: progress
    }));
  };

  const handleRowMouseLeave = (rowIndex: number) => {
    setActiveRowIndex(null);
    setHoverProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[rowIndex];
      return newProgress;
    });
  };

  const getVisibleText = (verse: QuranVerse, rowIndex: number): string => {
    // Show full text by default, or partial text based on hover progress
    const verseText = showTajweed ? getTajweedText(verse) : verse.text;
    
    if (activeRowIndex !== rowIndex || !hoverProgress[rowIndex]) {
      return verseText; // Show full text by default
    }
    
    const words = verseText.split(' ');
    const wordsToShow = Math.ceil(words.length * hoverProgress[rowIndex]);
    
    if (wordsToShow === 0) return '';
    return words.slice(0, wordsToShow).join(' ');
  };

  // Ensure we have enough refs for all rows
  if (rowRefs.current.length !== currentSurahVerses.length) {
    rowRefs.current = Array(currentSurahVerses.length).fill(null);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Surah Info */}
      {firstVerse && (
        <div className="bg-white p-4 rounded-lg border border-green-100 text-center space-y-2">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousSurah}
              disabled={currentSurah <= 1}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              <SkipBack className="h-4 w-4 mr-1" />
              Previous Surah
            </Button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">
                {getSurahName(currentSurah)}
              </h2>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextSurah}
              disabled={!allVerses.find(v => v.surah === currentSurah + 1)}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              Next Surah
              <SkipForward className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              Surah {currentSurah}
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-600">
              {currentSurahVerses.length} verses
            </Badge>
          </div>
        </div>
      )}

      {/* Collapsible Control Panel */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <Collapsible open={isControlsExpanded} onOpenChange={setIsControlsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-2 text-blue-700 hover:bg-blue-100">
              <span className="font-medium">Display Options</span>
              {isControlsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Tajweed:</span>
                  <Switch
                    checked={showTajweed}
                    onCheckedChange={setShowTajweed}
                  />
                </div>
                
                <QuranNavigationModal
                  onNavigate={handleNavigate}
                  currentVerseId={firstVerse?.id || 1}
                  maxVerseId={allVerses.length}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Page Canvas */}
      <Card className="p-8 bg-white border border-green-100 shadow-sm min-h-[600px]">
        <div className="relative min-h-[500px]">
          {currentSurahVerses.length > 0 ? (
            <div className="space-y-8">
              {currentSurahVerses.map((verse, rowIndex) => (
                <div 
                  key={verse.id} 
                  ref={el => rowRefs.current[rowIndex] = el}
                  className="w-full cursor-pointer relative py-4 border-b border-green-50 last:border-0"
                  onMouseMove={(e) => handleRowMouseMove(e, rowIndex)}
                  onMouseLeave={() => handleRowMouseLeave(rowIndex)}
                >
                  <Badge variant="outline" className="absolute top-1 right-0 border-green-200 text-green-600 text-xs">
                    {verse.verse_key}
                  </Badge>
                  <div 
                    className="font-arabic text-2xl leading-loose text-gray-800 text-right px-4"
                  >
                    {showTajweed ? (
                      <span dangerouslySetInnerHTML={{ __html: getVisibleText(verse, rowIndex) }} />
                    ) : (
                      getVisibleText(verse, rowIndex)
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No verses to display</p>
            </div>
          )}
          
          {/* Hover instruction */}
          <div className="absolute top-4 left-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-sm">
              <p className="font-medium">Hover over verses to reveal them right-to-left</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
