
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
  const [currentVerseId, setCurrentVerseId] = useState(startingVerseId);
  const [versesPerPage, setVersesPerPage] = useState(10);
  const [showTajweed, setShowTajweed] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [hoverProgress, setHoverProgress] = useState<Record<number, number>>({});
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const allVerses = getVersesArray();
  const maxVerseId = allVerses.length;

  // Get current verses to display
  const getCurrentVerses = (): QuranVerse[] => {
    const verses: QuranVerse[] = [];
    for (let i = 0; i < versesPerPage && currentVerseId + i <= maxVerseId; i++) {
      const verse = getVerseById(currentVerseId + i);
      if (verse) verses.push(verse);
    }
    return verses;
  };

  const currentVerses = getCurrentVerses();
  const currentVerse = currentVerses[0];

  const handleNavigate = (verseId: number, newVersesPerPage?: number) => {
    setCurrentVerseId(verseId);
    if (newVersesPerPage) {
      setVersesPerPage(newVersesPerPage);
    }
    setActiveRowIndex(null);
    setHoverProgress({});
  };

  const goToNextPage = () => {
    if (currentVerseId + versesPerPage <= maxVerseId) {
      setCurrentVerseId(currentVerseId + versesPerPage);
      setActiveRowIndex(null);
      setHoverProgress({});
    }
  };

  const goToPreviousPage = () => {
    if (currentVerseId - versesPerPage >= 1) {
      setCurrentVerseId(currentVerseId - versesPerPage);
      setActiveRowIndex(null);
      setHoverProgress({});
    }
  };

  const goToNextSurah = () => {
    if (!currentVerse) return;
    const nextSurahNumber = currentVerse.surah + 1;
    const nextSurahFirstVerse = allVerses.find(v => v.surah === nextSurahNumber);
    if (nextSurahFirstVerse) {
      handleNavigate(nextSurahFirstVerse.id);
    }
  };

  const goToPreviousSurah = () => {
    if (!currentVerse) return;
    const prevSurahNumber = currentVerse.surah - 1;
    if (prevSurahNumber >= 1) {
      const prevSurahFirstVerse = allVerses.find(v => v.surah === prevSurahNumber);
      if (prevSurahFirstVerse) {
        handleNavigate(prevSurahFirstVerse.id);
      }
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

  const handleVersesPerPageChange = (count: number) => {
    setVersesPerPage(count);
    setActiveRowIndex(null);
    setHoverProgress({});
  };

  const handleRowMouseMove = (event: React.MouseEvent<HTMLDivElement>, rowIndex: number) => {
    if (activeRowIndex !== null && activeRowIndex !== rowIndex) return;
    
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
    if (activeRowIndex === rowIndex) {
      setActiveRowIndex(null);
    }
    
    setHoverProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[rowIndex];
      return newProgress;
    });
  };

  const getVisibleText = (verse: QuranVerse, rowIndex: number): string => {
    if (activeRowIndex !== rowIndex || !hoverProgress[rowIndex]) {
      return '';
    }
    
    const verseText = showTajweed ? getTajweedText(verse) : verse.text;
    const words = verseText.split(' ');
    const wordsToShow = Math.ceil(words.length * hoverProgress[rowIndex]);
    
    if (wordsToShow === 0) return '';
    return words.slice(0, wordsToShow).join(' ');
  };

  // Organize verses into rows (one verse per row)
  const rows = currentVerses.map((verse, index) => ({
    verse,
    index
  }));

  // Ensure we have enough refs for all rows
  if (rowRefs.current.length !== rows.length) {
    rowRefs.current = Array(rows.length).fill(null);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Surah Info */}
      {currentVerse && (
        <div className="bg-white p-4 rounded-lg border border-green-100 text-center space-y-2">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousSurah}
              disabled={currentVerse.surah <= 1}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              <SkipBack className="h-4 w-4 mr-1" />
              Previous Surah
            </Button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">
                {getSurahName(currentVerse.surah)}
              </h2>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextSurah}
              disabled={!allVerses.find(v => v.surah === currentVerse.surah + 1)}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              Next Surah
              <SkipForward className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              Page {Math.ceil(currentVerseId / versesPerPage)}
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-600">
              Verses {currentVerse.ayah} - {Math.min(currentVerseId + versesPerPage - 1, maxVerseId)} of {maxVerseId}
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
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Verses per page:</span>
                {[5, 10, 15, 20, 30, 'Surah'].map((count) => (
                  <Button
                    key={count}
                    variant={versesPerPage === (count === 'Surah' ? 1000 : count as number) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVersesPerPageChange(count === 'Surah' ? 1000 : count as number)}
                    className={versesPerPage === (count === 'Surah' ? 1000 : count as number) ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}
                  >
                    {count}
                  </Button>
                ))}
              </div>
              
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
                  currentVerseId={currentVerseId}
                  maxVerseId={maxVerseId}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Page Canvas */}
      <Card className="p-8 bg-white border border-green-100 shadow-sm min-h-[600px]">
        <div className="relative min-h-[500px]">
          {rows.length > 0 ? (
            <div className="space-y-8">
              {rows.map((row, rowIndex) => (
                <div 
                  key={row.verse.id} 
                  ref={el => rowRefs.current[rowIndex] = el}
                  className="w-full cursor-pointer relative py-4 border-b border-green-50 last:border-0"
                  onMouseMove={(e) => handleRowMouseMove(e, rowIndex)}
                  onMouseLeave={() => handleRowMouseLeave(rowIndex)}
                >
                  <Badge variant="outline" className="absolute top-1 right-0 border-green-200 text-green-600 text-xs">
                    {row.verse.verse_key}
                  </Badge>
                  <div 
                    className="font-arabic text-2xl leading-loose text-gray-800 transition-opacity duration-300 text-right px-4"
                    style={{ opacity: activeRowIndex === rowIndex && hoverProgress[rowIndex] > 0 ? 1 : 0.1 }}
                  >
                    {showTajweed ? (
                      <span dangerouslySetInnerHTML={{ __html: getVisibleText(row.verse, rowIndex) }} />
                    ) : (
                      getVisibleText(row.verse, rowIndex)
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
          {activeRowIndex === null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-center">
                <p className="text-sm font-medium">Hover over a verse row to reveal it right-to-left</p>
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
            onClick={goToPreviousPage}
            disabled={currentVerseId <= 1}
            className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span>Previous Page</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600">
              Page {Math.ceil(currentVerseId / versesPerPage)} of {Math.ceil(maxVerseId / versesPerPage)}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentVerseId + versesPerPage > maxVerseId}
            className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50"
          >
            <span>Next Page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
