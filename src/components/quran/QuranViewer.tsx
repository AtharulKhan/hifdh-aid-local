
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse } from "@/data/quranData";

interface QuranViewerProps {
  startingVerseId?: number;
}

export const QuranViewer: React.FC<QuranViewerProps> = ({ startingVerseId = 1 }) => {
  const [currentVerseId, setCurrentVerseId] = useState(startingVerseId);
  const [versesPerPage, setVersesPerPage] = useState(1);
  const [showArabic, setShowArabic] = useState(true);
  
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

  const goToNextVerse = () => {
    if (currentVerseId + versesPerPage <= maxVerseId) {
      setCurrentVerseId(currentVerseId + versesPerPage);
    }
  };

  const goToPreviousVerse = () => {
    if (currentVerseId - versesPerPage >= 1) {
      setCurrentVerseId(currentVerseId - versesPerPage);
    }
  };

  const handleVersesPerPageChange = (count: number) => {
    setVersesPerPage(count);
  };

  return (
    <div className="space-y-6">
      {/* Header with Surah Info */}
      {currentVerse && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">
            {getSurahName(currentVerse.surah)}
          </h2>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary">
              Ayah {currentVerse.ayah}
            </Badge>
            <Badge variant="outline">
              Verse {currentVerseId} of {maxVerseId}
            </Badge>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Verses per page:</span>
            {[1, 2, 3, 5].map((count) => (
              <Button
                key={count}
                variant={versesPerPage === count ? "default" : "outline"}
                size="sm"
                onClick={() => handleVersesPerPageChange(count)}
              >
                {count}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArabic(!showArabic)}
            className="flex items-center space-x-2"
          >
            {showArabic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showArabic ? "Hide" : "Show"} Arabic</span>
          </Button>
        </div>
      </Card>

      {/* Verse Display */}
      <div className="space-y-4">
        {currentVerses.map((verse) => (
          <Card key={verse.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {verse.verse_key}
                </Badge>
                <Badge variant="secondary">
                  Verse {verse.id}
                </Badge>
              </div>
              
              {showArabic && (
                <div className="text-right">
                  <p className="text-2xl md:text-3xl leading-relaxed font-arabic text-primary">
                    {verse.text}
                  </p>
                </div>
              )}
              
              {!showArabic && (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Arabic text hidden for memorization practice</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousVerse}
            disabled={currentVerseId <= 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {currentVerseId} - {Math.min(currentVerseId + versesPerPage - 1, maxVerseId)} of {maxVerseId}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={goToNextVerse}
            disabled={currentVerseId + versesPerPage > maxVerseId}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
