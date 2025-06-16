
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, BookOpen, BookOpenText } from "lucide-react";
import mushafData from "@/data/mushaf-words.json";

interface MushafWord {
  id: number;
  surah: string;
  ayah: string;
  word: string;
  location: string;
  text: string;
}

export const MushafViewer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'single' | 'double'>('single');

  // Convert mushaf data to array and group by pages (15 lines per page for demo)
  const words = Object.values(mushafData as Record<string, MushafWord>);
  const wordsPerLine = 10; // Approximate words per line
  const linesPerPage = 15;
  const wordsPerPage = wordsPerLine * linesPerPage;

  const getPageWords = (pageNumber: number): MushafWord[] => {
    const startIndex = (pageNumber - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    return words.slice(startIndex, endIndex);
  };

  const groupWordsIntoLines = (pageWords: MushafWord[]): MushafWord[][] => {
    const lines: MushafWord[][] = [];
    for (let i = 0; i < pageWords.length; i += wordsPerLine) {
      lines.push(pageWords.slice(i, i + wordsPerLine));
    }
    return lines;
  };

  const totalPages = Math.ceil(words.length / wordsPerPage);

  const renderPage = (pageNumber: number) => {
    const pageWords = getPageWords(pageNumber);
    const lines = groupWordsIntoLines(pageWords);

    return (
      <Card className="w-full h-full p-6 bg-cream-50 border-2 border-amber-200 shadow-lg" key={pageNumber}>
        <div className="space-y-1">
          {/* Page header */}
          <div className="text-center mb-4">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              صفحة {pageNumber}
            </Badge>
          </div>

          {/* Lines */}
          <div className="space-y-2">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex} className="relative">
                {/* Line content */}
                <div className="text-right font-arabic text-xl leading-relaxed py-2 px-4 min-h-[3rem] flex items-center justify-end">
                  <div className="space-x-2 rtl">
                    {line.map((word, wordIndex) => (
                      <span key={word.id} className="text-gray-800">
                        {word.text}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Subtle line separator */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 opacity-50"></div>
              </div>
            ))}
          </div>

          {/* Page footer */}
          <div className="text-center mt-6 pt-4 border-t border-amber-200">
            <span className="text-sm text-amber-700 font-medium">{pageNumber}</span>
          </div>
        </div>
      </Card>
    );
  };

  const nextPage = () => {
    if (viewMode === 'single') {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    } else {
      setCurrentPage(prev => Math.min(prev + 2, totalPages));
    }
  };

  const prevPage = () => {
    if (viewMode === 'single') {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    } else {
      setCurrentPage(prev => Math.max(prev - 2, 1));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center space-x-2">
          <BookOpen className="h-8 w-8 text-amber-600" />
          <span>المصحف الشريف</span>
        </h1>
        <p className="text-gray-600">
          Experience the Quran in traditional book format with authentic line-by-line layout
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'single' ? 'default' : 'outline'}
            onClick={() => setViewMode('single')}
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Single Page
          </Button>
          <Button
            variant={viewMode === 'double' ? 'default' : 'outline'}
            onClick={() => setViewMode('double')}
            size="sm"
          >
            <BookOpenText className="h-4 w-4 mr-2" />
            Double Page
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage <= 1}
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Badge variant="secondary" className="px-4 py-2">
            {viewMode === 'single' 
              ? `Page ${currentPage} of ${totalPages}`
              : `Pages ${currentPage}-${Math.min(currentPage + 1, totalPages)} of ${totalPages}`
            }
          </Badge>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={
              viewMode === 'single' 
                ? currentPage >= totalPages 
                : currentPage >= totalPages - 1
            }
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Pages */}
      <div className="flex justify-center">
        {viewMode === 'single' ? (
          <div className="w-full max-w-2xl">
            {renderPage(currentPage)}
          </div>
        ) : (
          <div className="flex space-x-6 w-full max-w-6xl">
            <div className="flex-1">
              {renderPage(currentPage)}
            </div>
            {currentPage + 1 <= totalPages && (
              <div className="flex-1">
                {renderPage(currentPage + 1)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Page Info */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Navigate through the holy Quran in traditional mushaf format
        </p>
      </div>
    </div>
  );
};
