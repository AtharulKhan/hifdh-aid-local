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
  const [verseRange, setVerseRange] = useState<[number, number]>([1, 10]);
  const verseTextRefs = useRef<Record<number, HTMLDivElement | null>>({});
  
  const allVerses = getVersesArray();
  const maxVerseId = allVerses.length;
  const maxSurah = Math.max(...allVerses.map(verse => verse.surah));

  // Get current verses to display - now shows verses in the selected range within the current surah
  const getCurrentVerses = (): QuranVerse[] => {
    const currentVerse = getVerseById(currentVerseId);
    if (!currentVerse) return [];
    
    // Get all verses for the current surah
    const surahVerses = allVerses.filter(verse => verse.surah === currentVerse.surah);
    
    // Filter by verse range (ayah numbers within the surah)
    return surahVerses.filter(verse => 
      verse.ayah >= verseRange[0] && verse.ayah <= verseRange[1]
    );
  };

  const currentVerses = getCurrentVerses();
  const currentVerse = currentVerses[0] || getVerseById(currentVerseId);

  // Get the max verse number for the current surah
  const getCurrentSurahMaxVerse = (): number => {
    if (!currentVerse) return 10;
    const surahVerses = allVerses.filter(verse => verse.surah === currentVerse.surah);
    return Math.max(...surahVerses.map(verse => verse.ayah));
  };

  const handleNavigate = (verseId: number) => {
    setCurrentVerseId(verseId);
    setVerseRevealStates({});
    setHoverWordCounts({});
    setVerseSliderValues({});
    
    // Reset verse range when navigating to a new surah
    const newVerse = getVerseById(verseId);
    if (newVerse && currentVerse && newVerse.surah !== currentVerse.surah) {
      const maxVerse = getCurrentSurahMaxVerse();
      setVerseRange([1, Math.min(10, maxVerse)]);
    }
  };

  const handleVerseRangeChange = (value: number[]) => {
    setVerseRange([value[0], value[1]]);
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

  const handleSurahSliderChange = (value: number[]) => {
    const targetSurah = value[0];
    const firstVerseOfSurah = allVerses.find(v => v.surah === targetSurah);
    if (firstVerseOfSurah) {
      handleNavigate(firstVerseOfSurah.id);
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
              Verses {verseRange[0]}-{verseRange[1]} ({currentVerses.length} showing)
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
          
          <CollapsibleContent>
            <div className="pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
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
              <div className="space-y-2 bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Verse range to show:</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    {verseRange[0]} - {verseRange[1]}
                  </span>
                </div>
                <Slider
                  value={verseRange}
                  onValueChange={handleVerseRangeChange}
                  max={getCurrentSurahMaxVerse()}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-green-500">
                  <span>Verse 1</span>
                  <span>Verse {getCurrentSurahMaxVerse()}</span>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousSurah}
              disabled={!currentVerse || currentVerse.surah <= 1}
              className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Surah</span>
            </Button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-600">
                Surah {currentVerse?.surah || 1} of {maxSurah}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={goToNextSurah}
              disabled={!currentVerse || !allVerses.find(v => v.surah === currentVerse.surah + 1)}
              className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50"
            >
              <span>Next Surah</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Surah Navigation Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Navigate to Surah:</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Surah {currentVerse?.surah || 1}
              </span>
            </div>
            <Slider
              value={[currentVerse?.surah || 1]}
              onValueChange={handleSurahSliderChange}
              max={maxSurah}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-blue-500">
              <span>1</span>
              <span>{maxSurah}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
