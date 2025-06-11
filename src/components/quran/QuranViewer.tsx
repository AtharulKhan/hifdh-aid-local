import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowRight, ChevronsRight } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";

interface QuranViewerProps {
  startingVerseId?: number;
}

export const QuranViewer: React.FC<QuranViewerProps> = ({ startingVerseId = 1 }) => {
  const [currentVerseId, setCurrentVerseId] = useState(startingVerseId);
  const [versesPerPage, setVersesPerPage] = useState(5);
  const [viewMode, setViewMode] = useState<'hidden' | 'partial' | 'full'>('hidden');
  const [verseRevealStates, setVerseRevealStates] = useState<Record<number, 'hidden' | 'partial' | 'more' | 'full'>>({});
  const [hoverWordCounts, setHoverWordCounts] = useState<Record<number, number>>({});
  
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
    setVerseRevealStates({});
    setHoverWordCounts({});
  };

  const goToNextPage = () => {
    if (currentVerseId + versesPerPage <= maxVerseId) {
      setCurrentVerseId(currentVerseId + versesPerPage);
      setVerseRevealStates({});
      setHoverWordCounts({});
    }
  };

  const goToPreviousPage = () => {
    if (currentVerseId - versesPerPage >= 1) {
      setCurrentVerseId(currentVerseId - versesPerPage);
      setVerseRevealStates({});
      setHoverWordCounts({});
    }
  };

  const handleVersesPerPageChange = (count: number) => {
    setVersesPerPage(count);
    setVerseRevealStates({});
    setHoverWordCounts({});
  };

  const revealVerse = (verseId: number, revealType: 'partial' | 'more' | 'full') => {
    setVerseRevealStates(prev => ({
      ...prev,
      [verseId]: revealType
    }));
  };

  const handleMouseMove = (verseId: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'hidden' || verseRevealStates[verseId]) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    // For Arabic text (right-to-left), calculate from the right side
    const percentageFromRight = Math.max(0, Math.min(1, (width - x) / width));
    
    const verse = getVerseById(verseId);
    if (verse) {
      const words = verse.text.split(' ');
      const wordsToShow = Math.floor(words.length * percentageFromRight);
      
      setHoverWordCounts(prev => ({
        ...prev,
        [verseId]: wordsToShow
      }));
    }
  };

  const handleMouseLeave = (verseId: number) => {
    if (viewMode !== 'hidden' || verseRevealStates[verseId]) return;
    
    setHoverWordCounts(prev => ({
      ...prev,
      [verseId]: 0
    }));
  };

  const getVerseDisplay = (verse: QuranVerse) => {
    const words = verse.text.split(' ');
    const hoverWordCount = hoverWordCounts[verse.id] || 0;
    
    if (viewMode === 'hidden') {
      const revealState = verseRevealStates[verse.id] || 'hidden';
      
      if (revealState === 'hidden') {
        if (hoverWordCount > 0) {
          return words.slice(0, hoverWordCount).join(' ');
        }
        return '';
      } else if (revealState === 'partial') {
        return words.slice(0, Math.ceil(words.length / 3)).join(' ') + '...';
      } else if (revealState === 'more') {
        return words.slice(0, Math.ceil(words.length * 2 / 3)).join(' ') + '...';
      } else {
        return verse.text;
      }
    } else if (viewMode === 'partial') {
      return words.slice(0, Math.ceil(words.length / 3)).join(' ') + '...';
    } else {
      return verse.text;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Surah Info */}
      {currentVerse && (
        <div className="bg-white p-4 rounded-lg border border-green-100 text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-700">
            {getSurahName(currentVerse.surah)}
          </h2>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              Page {Math.ceil(currentVerseId / versesPerPage)}
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-600">
              Verse {currentVerse.ayah} - {Math.min(currentVerseId + versesPerPage - 1, maxVerseId)} of {maxVerseId}
            </Badge>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Verses per page:</span>
            {[1, 3, 5, 10, 30, 40, 'Surah'].map((count) => (
              <Button
                key={count}
                variant={versesPerPage === count ? "default" : "outline"}
                size="sm"
                onClick={() => handleVersesPerPageChange(count === 'Surah' ? 1000 : count as number)}
                className={versesPerPage === count ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}
              >
                {count}
              </Button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'hidden' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('hidden')}
              className={viewMode === 'hidden' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}
            >
              Hide
            </Button>
            <Button
              variant={viewMode === 'partial' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('partial')}
              className={viewMode === 'partial' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}
            >
              Show Partial
            </Button>
            <Button
              variant={viewMode === 'full' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('full')}
              className={viewMode === 'full' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}
            >
              Show Full
            </Button>
            <QuranNavigationModal
              onNavigate={handleNavigate}
              currentVerseId={currentVerseId}
              maxVerseId={maxVerseId}
            />
          </div>
        </div>
      </Card>

      {/* Verses Display */}
      <div className="space-y-4">
        {viewMode !== 'hidden' || Object.keys(verseRevealStates).length > 0 || Object.keys(hoverWordCounts).some(key => hoverWordCounts[Number(key)] > 0) ? (
          currentVerses.map((verse) => (
            <Card key={verse.id} className="p-6 bg-white border border-green-100 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-green-200 text-green-600">
                    {verse.verse_key}
                  </Badge>
                </div>
                
                <div className="relative">
                  <div 
                    className="font-arabic text-right text-2xl leading-loose text-gray-800 min-h-[3rem] transition-all duration-300 ease-out"
                    onMouseMove={(e) => handleMouseMove(verse.id, e)}
                    onMouseLeave={() => handleMouseLeave(verse.id)}
                    style={{
                      opacity: viewMode === 'hidden' && !verseRevealStates[verse.id] ? 
                        (hoverWordCounts[verse.id] ? 0.7 + (hoverWordCounts[verse.id] * 0.3) : 0.1) : 1
                    }}
                  >
                    {getVerseDisplay(verse)}
                  </div>
                  
                  {viewMode === 'hidden' && verseRevealStates[verse.id] !== 'full' && (
                    <div className="flex justify-end space-x-2 mt-4">
                      {!verseRevealStates[verse.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revealVerse(verse.id, 'partial')}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Reveal Part
                        </Button>
                      )}
                      {verseRevealStates[verse.id] === 'partial' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revealVerse(verse.id, 'more')}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Reveal More
                        </Button>
                      )}
                      {verseRevealStates[verse.id] === 'more' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revealVerse(verse.id, 'full')}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Reveal Rest
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revealVerse(verse.id, 'full')}
                        className="border-green-200 text-green-600 hover:bg-green-50 bg-green-25 transition-all duration-300 animate-fade-in"
                      >
                        <ChevronsRight className="h-4 w-4 mr-1" />
                        Reveal All
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="space-y-4">
            {currentVerses.map((verse) => (
              <Card key={verse.id} className="p-6 bg-white border border-green-100 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-green-200 text-green-600">
                      {verse.verse_key}
                    </Badge>
                  </div>
                  
                  <div className="relative">
                    <div 
                      className="font-arabic text-right text-2xl leading-loose text-gray-800 min-h-[3rem] transition-all duration-300 ease-out"
                      onMouseMove={(e) => handleMouseMove(verse.id, e)}
                      onMouseLeave={() => handleMouseLeave(verse.id)}
                      style={{
                        opacity: hoverWordCounts[verse.id] ? 0.7 + (hoverWordCounts[verse.id] * 0.3) : 0.1
                      }}
                    >
                      {getVerseDisplay(verse)}
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revealVerse(verse.id, 'partial')}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in"
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Reveal Part
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revealVerse(verse.id, 'full')}
                        className="border-green-200 text-green-600 hover:bg-green-50 bg-green-25 transition-all duration-300 animate-fade-in"
                      >
                        <ChevronsRight className="h-4 w-4 mr-1" />
                        Reveal All
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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
