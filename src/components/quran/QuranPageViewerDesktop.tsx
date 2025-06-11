
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, SkipForward, SkipBack } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";

interface QuranPageViewerDesktopProps {
  startingVerseId?: number;
}

export const QuranPageViewerDesktop: React.FC<QuranPageViewerDesktopProps> = ({ startingVerseId = 1 }) => {
  const [currentSurah, setCurrentSurah] = useState(() => {
    const startingVerse = getVerseById(startingVerseId);
    return startingVerse ? startingVerse.surah : 1;
  });
  const [showTajweed, setShowTajweed] = useState(false);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [hideVerses, setHideVerses] = useState(false);
  const [revelationRate, setRevelationRate] = useState([100]);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [maxLines, setMaxLines] = useState([0]); // 0 means no limit
  const [maxVerses, setMaxVerses] = useState([0]); // 0 means no limit
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const allVerses = getVersesArray();
  
  const getSurahVerses = (): QuranVerse[] => {
    const surahVerses = allVerses.filter(verse => verse.surah === currentSurah);
    if (maxVerses[0] === 0) {
      return surahVerses;
    }
    return surahVerses.slice(0, maxVerses[0]);
  };

  const currentSurahVerses = getSurahVerses();
  const maxSurah = Math.max(...allVerses.map(v => v.surah));

  const handleNavigate = (verseId: number) => {
    const verse = getVerseById(verseId);
    if (verse) {
      setCurrentSurah(verse.surah);
    }
    setRevelationRate([100]);
    setCurrentPage(1);
  };

  const goToNextSurah = () => {
    if (currentSurah < maxSurah) {
      setCurrentSurah(currentSurah + 1);
      setRevelationRate([100]);
      setCurrentPage(1);
    }
  };

  const goToPreviousSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
      setRevelationRate([100]);
      setCurrentPage(1);
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

  const getCombinedText = (): string => {
    return currentSurahVerses.map(verse => getDisplayText(verse)).join(' ');
  };

  const getPaginatedText = (): { text: string; totalPages: number; hasNextPage: boolean } => {
    const fullText = getCombinedText();
    
    if (maxLines[0] === 0) {
      // No pagination - apply revelation rate to full text
      if (!hideVerses) {
        return { text: fullText, totalPages: 1, hasNextPage: false };
      }
      
      const words = fullText.split(' ');
      const sliderProgress = revelationRate[0] / 100;
      
      if (sliderProgress === 0) return { text: '', totalPages: 1, hasNextPage: false };
      
      const wordsToShow = Math.ceil(words.length * sliderProgress);
      const visibleText = words.slice(0, wordsToShow).join(' ');
      return { text: visibleText, totalPages: 1, hasNextPage: false };
    }

    // With pagination enabled
    const avgCharsPerLine = 90;
    const maxCharsPerPage = maxLines[0] * avgCharsPerLine;
    
    if (fullText.length <= maxCharsPerPage) {
      // Single page - apply revelation rate to this page
      if (!hideVerses) {
        return { text: fullText, totalPages: 1, hasNextPage: false };
      }
      
      const words = fullText.split(' ');
      const sliderProgress = revelationRate[0] / 100;
      
      if (sliderProgress === 0) return { text: '', totalPages: 1, hasNextPage: false };
      
      const wordsToShow = Math.ceil(words.length * sliderProgress);
      const visibleText = words.slice(0, wordsToShow).join(' ');
      return { text: visibleText, totalPages: 1, hasNextPage: false };
    }

    // Multiple pages
    const totalPages = Math.ceil(fullText.length / maxCharsPerPage);
    const startIndex = (currentPage - 1) * maxCharsPerPage;
    const endIndex = Math.min(startIndex + maxCharsPerPage, fullText.length);
    
    // Find word boundaries to avoid cutting words
    let adjustedEndIndex = endIndex;
    if (endIndex < fullText.length) {
      while (adjustedEndIndex > startIndex && fullText[adjustedEndIndex] !== ' ') {
        adjustedEndIndex--;
      }
    }
    
    let pageText = fullText.substring(startIndex, adjustedEndIndex);
    
    // Apply revelation rate to current page content
    if (hideVerses) {
      const words = pageText.split(' ');
      const sliderProgress = revelationRate[0] / 100;
      
      if (sliderProgress === 0) {
        pageText = '';
      } else {
        const wordsToShow = Math.ceil(words.length * sliderProgress);
        pageText = words.slice(0, wordsToShow).join(' ');
      }
    }
    
    const hasNextPage = currentPage < totalPages;
    
    return { text: pageText, totalPages, hasNextPage };
  };

  const { text: displayText, totalPages, hasNextPage } = getPaginatedText();

  const goToNextPage = () => {
    setCurrentPage(prev => prev + 1);
    setRevelationRate([100]); // Reset revelation rate for new page
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
    setRevelationRate([100]); // Reset revelation rate for new page
  };

  const handlePageSliderChange = (value: number[]) => {
    setCurrentPage(value[0]);
    setRevelationRate([100]); // Reset revelation rate for new page
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
          {maxLines[0] > 0 && totalPages > 1 && (
            <Badge variant="outline" className="border-blue-200 text-blue-600">
              Page {currentPage} of {totalPages}
            </Badge>
          )}
        </div>
      </div>

      {/* Collapsible Control Panel */}
      <Card className="p-4 bg-green-50 border-green-100">
        <Collapsible open={isControlsExpanded} onOpenChange={setIsControlsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-2 text-green-700 hover:bg-green-100">
              <span className="font-medium">Display Options</span>
              {isControlsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4">
            <div className="space-y-4">
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
                      onCheckedChange={(checked) => {
                        setHideVerses(checked);
                        if (!checked) {
                          setRevelationRate([100]);
                        } else {
                          setRevelationRate([0]);
                        }
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Tajweed:</span>
                    <Switch
                      checked={showTajweed}
                      onCheckedChange={setShowTajweed}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
                
                <QuranNavigationModal
                  onNavigate={handleNavigate}
                  currentVerseId={currentSurahVerses[0]?.id || 1}
                  maxVerseId={allVerses.length}
                />
              </div>

              {/* Max Verses Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Max verses to show:</span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    {maxVerses[0] === 0 ? 'All verses' : `${maxVerses[0]} verses`}
                  </span>
                </div>
                <Slider
                  value={maxVerses}
                  onValueChange={(value) => {
                    setMaxVerses(value);
                    setCurrentPage(1);
                  }}
                  max={Math.max(...allVerses.filter(v => v.surah === currentSurah).map((_, index) => index + 1))}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-green-500">
                  <span>All verses</span>
                  <span>{Math.max(...allVerses.filter(v => v.surah === currentSurah).map((_, index) => index + 1))} verses</span>
                </div>
              </div>

              {/* Max Lines Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Max lines per page:</span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    {maxLines[0] === 0 ? 'No limit' : `${maxLines[0]} lines`}
                  </span>
                </div>
                <Slider
                  value={maxLines}
                  onValueChange={(value) => {
                    setMaxLines(value);
                    setCurrentPage(1);
                  }}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-green-500">
                  <span>No limit</span>
                  <span>50 lines</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Sticky Revelation Rate Slider */}
      {hideVerses && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border border-green-200 rounded-lg p-4 shadow-sm">
          <div className="max-w-6xl mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">
                {maxLines[0] > 0 && totalPages > 1 ? `Page ${currentPage} Revelation Progress:` : 'Revelation Progress:'}
              </span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">{revelationRate[0]}%</span>
            </div>
            <Slider
              value={revelationRate}
              onValueChange={setRevelationRate}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-green-500">
              <span>Hidden</span>
              <span>{maxLines[0] > 0 && totalPages > 1 ? 'Page Fully Revealed' : 'Fully Revealed'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Page Canvas */}
      <Card className="p-8 bg-white border border-green-100 shadow-sm min-h-[600px]">
        <div className="relative min-h-[500px]">
          {currentSurahVerses.length > 0 ? (
            <div 
              ref={containerRef}
              className="w-full relative py-4"
            >
              <div 
                className="font-arabic text-2xl leading-loose text-gray-800 transition-opacity duration-300 text-right px-4"
                style={{ opacity: 1 }}
              >
                {showTajweed ? (
                  <span dangerouslySetInnerHTML={{ __html: displayText }} />
                ) : (
                  displayText
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No verses to display</p>
            </div>
          )}
          
          {hideVerses && revelationRate[0] === 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-center">
                <p className="text-sm font-medium">Use the slider above to reveal verses</p>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {maxLines[0] > 0 && totalPages > 1 && (
            <div className="absolute bottom-4 right-4 flex flex-col items-end space-y-3">
              {/* Previous/Next Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Page Navigation Slider */}
              <div className="w-48 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-700">Quick Page Navigation:</span>
                  <span className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">Page {currentPage}</span>
                </div>
                <Slider
                  value={[currentPage]}
                  onValueChange={handlePageSliderChange}
                  max={totalPages}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-blue-500">
                  <span>1</span>
                  <span>{totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Controls */}
      <Card className="p-4 bg-green-50 border-green-100">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousSurah}
            disabled={currentSurah <= 1}
            className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 bg-green-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span>Previous Surah</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-600">
              Surah {currentSurah} of {maxSurah}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={goToNextSurah}
            disabled={currentSurah >= maxSurah}
            className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 bg-green-50"
          >
            <span>Next Surah</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
