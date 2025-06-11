
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, EyeOff, ArrowRight, ChevronsRight } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse } from "@/data/quranData";

interface QuranViewerProps {
  startingVerseId?: number;
}

export const QuranViewer: React.FC<QuranViewerProps> = ({ startingVerseId = 1 }) => {
  const [currentVerseId, setCurrentVerseId] = useState(startingVerseId);
  const [versesPerPage, setVersesPerPage] = useState(5);
  const [showArabic, setShowArabic] = useState(true);
  const [verseRevealStates, setVerseRevealStates] = useState<Record<number, 'hidden' | 'partial' | 'full'>>({});
  
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

  const goToNextPage = () => {
    if (currentVerseId + versesPerPage <= maxVerseId) {
      setCurrentVerseId(currentVerseId + versesPerPage);
      setVerseRevealStates({});
    }
  };

  const goToPreviousPage = () => {
    if (currentVerseId - versesPerPage >= 1) {
      setCurrentVerseId(currentVerseId - versesPerPage);
      setVerseRevealStates({});
    }
  };

  const handleVersesPerPageChange = (count: number) => {
    setVersesPerPage(count);
    setVerseRevealStates({});
  };

  const revealVerse = (verseId: number, revealType: 'partial' | 'full') => {
    setVerseRevealStates(prev => ({
      ...prev,
      [verseId]: revealType
    }));
  };

  const getVerseDisplay = (verse: QuranVerse) => {
    const revealState = verseRevealStates[verse.id] || 'hidden';
    const words = verse.text.split(' ');
    
    if (revealState === 'hidden') {
      return '';
    } else if (revealState === 'partial') {
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
      <Card className="p-4 bg-green-50 border-green-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Verses per page:</span>
            {[1, 3, 5, 10].map((count) => (
              <Button
                key={count}
                variant={versesPerPage === count ? "default" : "outline"}
                size="sm"
                onClick={() => handleVersesPerPageChange(count)}
                className={versesPerPage === count ? "bg-green-600 text-white" : "border-green-200 text-green-700 hover:bg-green-100"}
              >
                {count}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArabic(!showArabic)}
            className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-100"
          >
            {showArabic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showArabic ? "Hide" : "Show"} Arabic Text</span>
          </Button>
        </div>
      </Card>

      {/* Verses Display */}
      <div className="space-y-4">
        {showArabic ? (
          currentVerses.map((verse) => (
            <Card key={verse.id} className="p-6 bg-white border border-green-100 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-green-200 text-green-600">
                    {verse.verse_key}
                  </Badge>
                </div>
                
                <div className="relative">
                  <div className="font-arabic text-right text-2xl leading-loose text-gray-800 min-h-[3rem]">
                    {getVerseDisplay(verse)}
                  </div>
                  
                  {verseRevealStates[verse.id] !== 'full' && (
                    <div className="flex justify-end space-x-2 mt-4">
                      {!verseRevealStates[verse.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revealVerse(verse.id, 'partial')}
                          className="border-green-200 text-green-700 hover:bg-green-100"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Reveal Part
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revealVerse(verse.id, 'full')}
                        className="border-green-200 text-green-700 hover:bg-green-100"
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
          <Card className="p-8 bg-white border border-green-100">
            <div className="flex items-center justify-center h-96 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
              <div className="text-center space-y-4">
                <div className="text-6xl text-green-300">📖</div>
                <p className="text-green-700 text-lg">Arabic text hidden for memorization practice</p>
                <p className="text-green-500 text-sm">
                  Page {Math.ceil(currentVerseId / versesPerPage)} • {currentVerses.length} verses
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Navigation Controls */}
      <Card className="p-4 bg-green-50 border-green-100">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousPage}
            disabled={currentVerseId <= 1}
            className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span>Previous Page</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-600">
              Page {Math.ceil(currentVerseId / versesPerPage)} of {Math.ceil(maxVerseId / versesPerPage)}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentVerseId + versesPerPage > maxVerseId}
            className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            <span>Next Page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
