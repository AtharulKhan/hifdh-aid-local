
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
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [hideVerses, setHideVerses] = useState(true);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<{ row: number; progress: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const allVerses = getVersesArray();
  
  // Get all verses for the current surah
  const getSurahVerses = (): QuranVerse[] => {
    return allVerses.filter(verse => verse.surah === currentSurah);
  };

  const currentSurahVerses = getSurahVerses();
  const maxSurah = Math.max(...allVerses.map(v => v.surah));

  const handleNavigate = (verseId: number) => {
    const verse = getVerseById(verseId);
    if (verse) {
      setCurrentSurah(verse.surah);
    }
    setHoverPosition(null);
  };

  const goToNextSurah = () => {
    if (currentSurah < maxSurah) {
      setCurrentSurah(currentSurah + 1);
      setHoverPosition(null);
    }
  };

  const goToPreviousSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
      setHoverPosition(null);
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

  const removeVerseNumbers = (text: string): string => {
    return text.replace(/\s*[٠-٩]+\s*$/, '').trim();
  };

  const getDisplayText = (verse: QuranVerse): string => {
    let text = showTajweed ? getTajweedText(verse) : verse.text;
    if (!showVerseNumbers) {
      text = removeVerseNumbers(text);
    }
    return text;
  };

  // Split text into rows for display
  const getTextRows = (): string[] => {
    const fullText = currentSurahVerses.map(verse => getDisplayText(verse)).join(' ');
    const words = fullText.split(' ');
    const rows: string[] = [];
    
    // Estimate words per row (this is a rough calculation)
    const wordsPerRow = Math.ceil(words.length / Math.max(1, Math.ceil(words.length / 15)));
    
    for (let i = 0; i < words.length; i += wordsPerRow) {
      rows.push(words.slice(i, i + wordsPerRow).join(' '));
    }
    
    return rows;
  };

  const getVisibleRows = (): string[] => {
    if (!hideVerses) {
      return getTextRows();
    }
    
    if (!hoverPosition) {
      return getTextRows().map(() => '');
    }
    
    const rows = getTextRows();
    return rows.map((row, index) => {
      if (index < hoverPosition.row) {
        return '';
      } else if (index === hoverPosition.row) {
        const words = row.split(' ');
        const wordsToShow = Math.ceil(words.length * hoverPosition.progress);
        return wordsToShow === 0 ? '' : words.slice(0, wordsToShow).join(' ');
      } else {
        return '';
      }
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !hideVerses) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    
    // Calculate which row we're hovering over
    const rows = getTextRows();
    const rowHeight = height / rows.length;
    const currentRow = Math.floor(y / rowHeight);
    
    if (currentRow >= 0 && currentRow < rows.length) {
      // Calculate progress from right to left (for Arabic text) with slower reveal
      const rawProgress = Math.max(0, Math.min(1, (width - x) / width));
      // Apply cubic easing to make it much slower
      const progress = Math.pow(rawProgress, 3);
      
      setHoverPosition({ row: currentRow, progress });
    }
  };

  const handleMouseLeave = () => {
    if (hideVerses) {
      setHoverPosition(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Surah Info */}
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
            disabled={currentSurah >= maxSurah}
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
                  <span className="text-sm font-medium text-gray-600">Show verse numbers:</span>
                  <Switch
                    checked={showVerseNumbers}
                    onCheckedChange={setShowVerseNumbers}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Hide verses:</span>
                  <Switch
                    checked={hideVerses}
                    onCheckedChange={setHideVerses}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Tajweed:</span>
                  <Switch
                    checked={showTajweed}
                    onCheckedChange={setShowTajweed}
                    className="data-[state=checked]:bg-green-300 data-[state=unchecked]:bg-green-100"
                  />
                </div>
              </div>
              
              <QuranNavigationModal
                onNavigate={handleNavigate}
                currentVerseId={currentSurahVerses[0]?.id || 1}
                maxVerseId={allVerses.length}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Page Canvas */}
      <Card className="p-8 bg-white border border-green-100 shadow-sm min-h-[600px]">
        <div className="relative min-h-[500px]">
          {currentSurahVerses.length > 0 ? (
            <div 
              ref={containerRef}
              className="w-full cursor-pointer relative py-4"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="font-arabic text-2xl leading-loose text-gray-800 text-right px-4">
                {getVisibleRows().map((row, index) => (
                  <div key={index} className="mb-2">
                    {showTajweed ? (
                      <span dangerouslySetInnerHTML={{ __html: row }} />
                    ) : (
                      row
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No verses to display</p>
            </div>
          )}
          
          {/* Hover instruction - only show when verses are hidden and not hovering */}
          {hideVerses && !hoverPosition && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-center">
                <p className="text-sm font-medium">Hover over the text to reveal verses row by row</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Controls */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousSurah}
            disabled={currentSurah <= 1}
            className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span>Previous Surah</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600">
              Surah {currentSurah} of {maxSurah}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={goToNextSurah}
            disabled={currentSurah >= maxSurah}
            className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50"
          >
            <span>Next Surah</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
