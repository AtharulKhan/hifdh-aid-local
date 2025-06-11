import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowRight, ChevronsRight, SkipForward, SkipBack } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";

interface QuranViewerProps {
  startingVerseId?: number;
}

export const QuranViewer: React.FC<QuranViewerProps> = ({ startingVerseId = 1 }) => {
  const [currentVerseId, setCurrentVerseId] = useState(startingVerseId);
  const [viewMode, setViewMode] = useState<'hidden' | 'partial' | 'full'>('hidden');
  const [showTajweed, setShowTajweed] = useState(false);
  const [verseRevealStates, setVerseRevealStates] = useState<Record<number, 'hidden' | 'partial' | 'more' | 'full'>>({});
  const [hoverWordCounts, setHoverWordCounts] = useState<Record<number, number>>({});
  const [verseSliderValues, setVerseSliderValues] = useState<Record<number, number>>({});
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [verseRange, setVerseRange] = useState([1, 0]); // [start, end] - 0 means no limit for end
  const verseTextRefs = useRef<Record<number, HTMLDivElement | null>>({});
  
  const allVerses = getVersesArray();
  const maxVerseId = allVerses.length;

  // Get current verses to display - now shows verses in the selected range within the current surah
  const getCurrentVerses = (): QuranVerse[] => {
    const currentVerse = getVerseById(currentVerseId);
    if (!currentVerse) return [];
    
    // Get all verses for the current surah
    const surahVerses = allVerses.filter(verse => verse.surah === currentVerse.surah);
    
    // Apply verse range filtering
    if (verseRange[1] === 0) {
      // No end limit, show from start verse to end of surah
      return surahVerses.slice(verseRange[0] - 1);
    } else {
      // Show verses in the specified range
      return surahVerses.slice(verseRange[0] - 1, verseRange[1]);
    }
  };

  const currentVerses = getCurrentVerses();
  const currentVerse = currentVerses[0];
  const totalSurahVerses = allVerses.filter(verse => verse.surah === getVerseById(currentVerseId)?.surah).length;

  const handleNavigate = (verseId: number) => {
    setCurrentVerseId(verseId);
    setVerseRevealStates({});
    setHoverWordCounts({});
    setVerseSliderValues({});
    setVerseRange([1, 0]); // Reset verse range for new surah
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

  const revealVerse = (verseId: number, revealType: 'partial' | 'more' | 'full') => {
    setVerseRevealStates(prev => ({
      ...prev,
      [verseId]: revealType
    }));
  };

  const handleMouseMove = (verseId: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'hidden' || verseRevealStates[verseId]) return;
    
    const verseTextElement = verseTextRefs.current[verseId];
    if (!verseTextElement) return;
    
    const rect = verseTextElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const textWidth = rect.width; // Actual width of the text content
    const height = rect.height;
    
    // Allow hover area to extend slightly above the text (20px above)
    const extendedHoverArea = y >= -20 && y <= height;
    
    if (!extendedHoverArea) {
      setHoverWordCounts(prev => ({
        ...prev,
        [verseId]: 0
      }));
      return;
    }
    
    const verse = getVerseById(verseId);
    if (verse) {
      const verseText = showTajweed ? getTajweedText(verse) : verse.text;
      const words = verseText.split(' ');
      
      // For Arabic text (right-to-left), calculate from the right side
      // Use the actual text width, not the container width
      const percentageFromRight = Math.max(0, Math.min(1, (textWidth - x) / textWidth));
      
      // Calculate word position based on percentage
      const wordsToShow = Math.ceil(words.length * percentageFromRight);
      
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
    const verseText = showTajweed ? getTajweedText(verse) : verse.text;
    const words = verseText.split(' ');
    const hoverWordCount = hoverWordCounts[verse.id] || 0;
    const sliderValue = verseSliderValues[verse.id] || 0;
    
    // If slider is being used, use slider value instead of other reveal methods
    if (sliderValue > 0) {
      const wordsToShow = Math.ceil(words.length * (sliderValue / 100));
      return words.slice(0, wordsToShow).join(' ');
    }
    
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
        return verseText;
      }
    } else if (viewMode === 'partial') {
      return words.slice(0, Math.ceil(words.length / 3)).join(' ') + '...';
    } else {
      return verseText;
    }
  };

  const handleVerseSliderChange = (verseId: number, value: number[]) => {
    setVerseSliderValues(prev => ({
      ...prev,
      [verseId]: value[0]
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
              Surah {currentVerse.surah}
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-600">
              Showing verses {verseRange[0]}-{verseRange[1] === 0 ? totalSurahVerses : verseRange[1]} of {totalSurahVerses}
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
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Tajweed:</span>
                    <Switch
                      checked={showTajweed}
                      onCheckedChange={setShowTajweed}
                    />
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
              </div>

              {/* Verse Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Verse range to show:</span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    {verseRange[1] === 0 ? `${verseRange[0]} - ${totalSurahVerses}` : `${verseRange[0]} - ${verseRange[1]}`}
                  </span>
                </div>
                <Slider
                  value={verseRange}
                  onValueChange={setVerseRange}
                  max={totalSurahVerses}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-green-500">
                  <span>1</span>
                  <span>{totalSurahVerses}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Verses Display */}
      <div className="space-y-4">
        {viewMode !== 'hidden' || Object.keys(verseRevealStates).length > 0 || Object.keys(hoverWordCounts).some(key => hoverWordCounts[Number(key)] > 0) || Object.keys(verseSliderValues).some(key => verseSliderValues[Number(key)] > 0) ? (
          currentVerses.map((verse) => (
            <Card key={verse.id} className="bg-white border border-green-100 shadow-sm">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-green-200 text-green-600">
                    {verse.verse_key}
                  </Badge>
                </div>
                
                {/* Individual Verse Revelation Slider */}
                <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Verse Revelation:</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">{verseSliderValues[verse.id] || 0}%</span>
                  </div>
                  <Slider
                    value={[verseSliderValues[verse.id] || 0]}
                    onValueChange={(value) => handleVerseSliderChange(verse.id, value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-500">
                    <span>Hidden</span>
                    <span>Fully Revealed</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    className="font-arabic text-right text-2xl leading-loose text-gray-800 min-h-[3rem] transition-all duration-300 ease-out cursor-pointer"
                    onMouseMove={(e) => handleMouseMove(verse.id, e)}
                    onMouseLeave={() => handleMouseLeave(verse.id)}
                    style={{
                      opacity: viewMode === 'hidden' && !verseRevealStates[verse.id] && !verseSliderValues[verse.id] ? 
                        (hoverWordCounts[verse.id] ? 0.7 + (hoverWordCounts[verse.id] * 0.3) : 0.1) : 1
                    }}
                    ref={el => verseTextRefs.current[verse.id] = el}
                  >
                    <span className="inline-block text-right">
                      {showTajweed ? (
                        <span dangerouslySetInnerHTML={{ __html: getVerseDisplay(verse) }} />
                      ) : (
                        getVerseDisplay(verse)
                      )}
                    </span>
                  </div>
                  
                  {viewMode === 'hidden' && verseRevealStates[verse.id] !== 'full' && !verseSliderValues[verse.id] && (
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
              <Card key={verse.id} className="bg-white border border-green-100 shadow-sm">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-green-200 text-green-600">
                      {verse.verse_key}
                    </Badge>
                  </div>
                  
                  {/* Individual Verse Revelation Slider */}
                  <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Verse Revelation:</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">{verseSliderValues[verse.id] || 0}%</span>
                    </div>
                    <Slider
                      value={[verseSliderValues[verse.id] || 0]}
                      onValueChange={(value) => handleVerseSliderChange(verse.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-blue-500">
                      <span>Hidden</span>
                      <span>Fully Revealed</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div 
                      className="font-arabic text-right text-2xl leading-loose text-gray-800 min-h-[3rem] transition-all duration-300 ease-out cursor-pointer"
                      onMouseMove={(e) => handleMouseMove(verse.id, e)}
                      onMouseLeave={() => handleMouseLeave(verse.id)}
                      style={{
                        opacity: hoverWordCounts[verse.id] || verseSliderValues[verse.id] ? 
                          (verseSliderValues[verse.id] ? 1 : 0.7 + (hoverWordCounts[verse.id] * 0.3)) : 0.1
                      }}
                      ref={el => verseTextRefs.current[verse.id] = el}
                    >
                      <span className="inline-block text-right">
                        {showTajweed ? (
                          <span dangerouslySetInnerHTML={{ __html: getVerseDisplay(verse) }} />
                        ) : (
                          getVerseDisplay(verse)
                        )}
                      </span>
                    </div>
                    
                    {!verseSliderValues[verse.id] && (
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
                    )}
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
            onClick={goToPreviousSurah}
            disabled={!currentVerse || currentVerse.surah <= 1}
            className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span>Previous Surah</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600">
              Surah {currentVerse?.surah || 1}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={goToNextSurah}
            disabled={!currentVerse || !allVerses.find(v => v.surah === currentVerse.surah + 1)}
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
