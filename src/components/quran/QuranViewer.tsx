
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
  const [versesPerPage, setVersesPerPage] = useState(15);
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

  const goToNextPage = () => {
    if (currentVerseId + versesPerPage <= maxVerseId) {
      setCurrentVerseId(currentVerseId + versesPerPage);
    }
  };

  const goToPreviousPage = () => {
    if (currentVerseId - versesPerPage >= 1) {
      setCurrentVerseId(currentVerseId - versesPerPage);
    }
  };

  const handleVersesPerPageChange = (count: number) => {
    setVersesPerPage(count);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Surah Info */}
      {currentVerse && (
        <div className="page-header p-4 rounded-lg text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-700">
            {getSurahName(currentVerse.surah)}
          </h2>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              صفحة {Math.ceil(currentVerseId / versesPerPage)}
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              آية {currentVerse.ayah} - {Math.min(currentVerseId + versesPerPage - 1, maxVerseId)} من {maxVerseId}
            </Badge>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">آيات في الصفحة:</span>
            {[5, 10, 15, 20].map((count) => (
              <Button
                key={count}
                variant={versesPerPage === count ? "default" : "outline"}
                size="sm"
                onClick={() => handleVersesPerPageChange(count)}
                className={versesPerPage === count ? "bg-gray-600 text-white" : "border-gray-300 text-gray-600"}
              >
                {count}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArabic(!showArabic)}
            className="flex items-center space-x-2 border-gray-300 text-gray-600"
          >
            {showArabic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showArabic ? "إخفاء" : "إظهار"} النص العربي</span>
          </Button>
        </div>
      </Card>

      {/* Quran Page Display */}
      <Card className="quran-page p-8">
        {showArabic ? (
          <div className="quran-text space-y-6">
            {currentVerses.map((verse, index) => (
              <React.Fragment key={verse.id}>
                <p className="leading-relaxed">
                  {verse.text}
                </p>
                {(index + 1) % 5 === 0 && index < currentVerses.length - 1 && (
                  <div className="page-margin"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center space-y-4">
              <div className="text-6xl text-gray-300">📖</div>
              <p className="text-gray-500 text-lg">النص العربي مخفي لممارسة الحفظ</p>
              <p className="text-gray-400 text-sm">
                صفحة {Math.ceil(currentVerseId / versesPerPage)} • {currentVerses.length} آية
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Controls */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousPage}
            disabled={currentVerseId <= 1}
            className="flex items-center space-x-2 border-gray-300 text-gray-600 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span>الصفحة السابقة</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              صفحة {Math.ceil(currentVerseId / versesPerPage)} من {Math.ceil(maxVerseId / versesPerPage)}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentVerseId + versesPerPage > maxVerseId}
            className="flex items-center space-x-2 border-gray-300 text-gray-600 disabled:opacity-50"
          >
            <span>الصفحة التالية</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
