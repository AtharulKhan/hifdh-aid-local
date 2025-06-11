import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
  const [revelationRate, setRevelationRate] = useState([0]); // Slider value from 0-100
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isSliderFixed, setIsSliderFixed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  
  const allVerses = getVersesArray();

  // Handle scroll to make slider sticky
  useEffect(() => {
    const handleScroll = () => {
      if (controlsRef.current) {
        const controlsRect = controlsRef.current.getBoundingClientRect();
        setIsSliderFixed(controlsRect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
    setHoverProgress(0);
    setIsHovering(false);
    setRevelationRate([0]); // Reset slider when navigating
  };

  const goToNextSurah = () => {
    if (currentSurah < maxSurah) {
      setCurrentSurah(currentSurah + 1);
      setHoverProgress(0);
      setIsHovering(false);
      setRevelationRate([0]); // Reset slider when navigating
    }
  };

  const goToPreviousSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
      setHoverProgress(0);
      setIsHovering(false);
      setRevelationRate([0]); // Reset slider when navigating
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
    // Remove Arabic-Indic numerals and their surrounding marks
    return text.replace(/\s*[٠-٩]+\s*$/, '').trim();
  };

  const getDisplayText = (verse: QuranVerse): string => {
    let text = showTajweed ? getTajweedText(verse) : verse.text;
    if (!showVerseNumbers) {
      text = removeVerseNumbers(text);
    }
    return text;
  };

  // Combine all verses into one continuous text
  const getCombinedText = (): string => {
    return currentSurahVerses.map(verse => getDisplayText(verse)).join(' ');
  };

  const getVisibleText = (): string => {
    if (!hideVerses) {
      // If not hiding verses, always show full text
      return getCombinedText();
    }
    
    const fullText = getCombinedText();
    const words = fullText.split(' ');
    
    // Use slider value primarily, hover as secondary
    const sliderProgress = revelationRate[0] / 100;
    const effectiveProgress = Math.max(sliderProgress, isHovering ? hoverProgress : 0);
    
    if (effectiveProgress === 0) return '';
    
    const wordsToShow = Math.ceil(words.length * effectiveProgress);
    return words.slice(0, wordsToShow).join(' ');
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !hideVerses) return;
    
    setIsHovering(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    // Calculate progress from right to left (for Arabic text) with slower reveal
    const rawProgress = Math.max(0, Math.min(1, (width - x) / width));
    // Apply easing to make it slower - using quadratic easing
    const progress = rawProgress * rawProgress;
    setHoverProgress(progress);
  };

  const handleMouseLeave = () => {
    if (hideVerses) {
      setIsHovering(false);
      setHoverProgress(0);
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
      <Card ref={controlsRef} className="p-4 bg-blue-50 border-blue-100">
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
                          setRevelationRate([100]); // Show all when not hiding
                        } else {
                          setRevelationRate([0]); // Reset when hiding
                        }
                      }}
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
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Fixed Slider when scrolling */}
      {isSliderFixed && hideVerses && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-blue-100 shadow-sm">
          <div className="max-w-6xl mx-auto p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Revelation Progress:</span>
                <span className="text-xs text-gray-500">{revelationRate[0]}%</span>
              </div>
              <Slider
                value={revelationRate}
                onValueChange={setRevelationRate}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Hidden</span>
                <span>Fully Revealed</span>
              </div>
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
              className="w-full cursor-pointer relative py-4"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="font-arabic text-2xl leading-loose text-gray-800 transition-opacity duration-300 text-right px-4"
                style={{ opacity: 1 }}
              >
                {showTajweed ? (
                  <span dangerouslySetInnerHTML={{ __html: getVisibleText() }} />
                ) : (
                  getVisibleText()
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No verses to display</p>
            </div>
          )}
          
          {/* Instructions - show when verses are hidden */}
          {hideVerses && revelationRate[0] === 0 && !isHovering && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-center">
                <p className="text-sm font-medium">Use the slider above or hover over the text to reveal verses</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Original Slider in Controls (hidden when fixed slider is active) */}
      {!isSliderFixed && hideVerses && (
        <Card className="p-4 bg-blue-50 border-blue-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Revelation Progress:</span>
              <span className="text-xs text-gray-500">{revelationRate[0]}%</span>
            </div>
            <Slider
              value={revelationRate}
              onValueChange={setRevelationRate}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Hidden</span>
              <span>Fully Revealed</span>
            </div>
          </div>
        </Card>
      )}

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
