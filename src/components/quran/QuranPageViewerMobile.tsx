
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, SkipForward, SkipBack, Settings } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";

interface QuranPageViewerMobileProps {
  startingVerseId?: number;
}

export const QuranPageViewerMobile: React.FC<QuranPageViewerMobileProps> = ({ startingVerseId = 1 }) => {
  const [currentSurah, setCurrentSurah] = useState(() => {
    const startingVerse = getVerseById(startingVerseId);
    return startingVerse ? startingVerse.surah : 1;
  });
  const [showTajweed, setShowTajweed] = useState(false);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [hideVerses, setHideVerses] = useState(false);
  const [revelationRate, setRevelationRate] = useState([100]);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const allVerses = getVersesArray();
  
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
    setRevelationRate([100]);
  };

  const goToNextSurah = () => {
    if (currentSurah < maxSurah) {
      setCurrentSurah(currentSurah + 1);
      setRevelationRate([100]);
    }
  };

  const goToPreviousSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
      setRevelationRate([100]);
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

  const getVisibleText = (): string => {
    if (!hideVerses) {
      return getCombinedText();
    }
    
    const fullText = getCombinedText();
    const words = fullText.split(' ');
    
    const sliderProgress = revelationRate[0] / 100;
    
    if (sliderProgress === 0) return '';
    
    const wordsToShow = Math.ceil(words.length * sliderProgress);
    return words.slice(0, wordsToShow).join(' ');
  };

  return (
    <div className="space-y-4 px-2 pb-20">
      {/* Compact Header */}
      <Card className="p-3 bg-white border border-green-100">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-gray-700">
            {getSurahName(currentSurah)}
          </h2>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
              Surah {currentSurah}
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-600 text-xs">
              {currentSurahVerses.length} verses
            </Badge>
          </div>
        </div>
      </Card>

      {/* Compact Controls */}
      <Card className="p-3 bg-green-50 border-green-100">
        <Collapsible open={isControlsExpanded} onOpenChange={setIsControlsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-2 text-green-700 hover:bg-green-100">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium text-sm">Options</span>
              </div>
              {isControlsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Verse numbers:</span>
                  <Switch
                    checked={showVerseNumbers}
                    onCheckedChange={setShowVerseNumbers}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Hide verses:</span>
                  <Switch
                    checked={hideVerses}
                    onCheckedChange={(checked) => {
                      setHideVerses(checked);
                      if (!checked) {
                        setRevelationRate([100]);
                      } else {
                        setRevelationRate([0]);
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Tajweed:</span>
                  <Switch
                    checked={showTajweed}
                    onCheckedChange={setShowTajweed}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
              
              <div className="pt-2">
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

      {/* Sticky Revelation Rate Slider for Mobile */}
      {hideVerses && (
        <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm border border-green-200 rounded-lg p-3 shadow-sm mx-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-700">Progress:</span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">{revelationRate[0]}%</span>
            </div>
            <Slider
              value={revelationRate}
              onValueChange={setRevelationRate}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Mobile-Optimized Text Display */}
      <Card className="p-4 bg-white border border-green-100 shadow-sm min-h-[400px]">
        <div className="relative">
          {currentSurahVerses.length > 0 ? (
            <div 
              ref={containerRef}
              className="w-full relative"
            >
              <div 
                className="font-arabic text-xl leading-loose text-gray-800 transition-opacity duration-300 text-right break-words"
                style={{ opacity: 1, lineHeight: '2.5' }}
              >
                {showTajweed ? (
                  <span dangerouslySetInnerHTML={{ __html: getVisibleText() }} />
                ) : (
                  getVisibleText()
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 text-sm">No verses to display</p>
            </div>
          )}
          
          {hideVerses && revelationRate[0] === 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-center">
                <p className="text-xs font-medium">Use the slider above to reveal verses</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Navigation */}
      <div className="flex items-center justify-between space-x-2">
        <Button
          variant="outline"
          onClick={goToPreviousSurah}
          disabled={currentSurah <= 1}
          className="flex items-center space-x-1 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 bg-green-50 flex-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-xs">Previous</span>
        </Button>

        <div className="text-center px-2">
          <span className="text-xs text-green-600">
            {currentSurah} / {maxSurah}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={goToNextSurah}
          disabled={currentSurah >= maxSurah}
          className="flex items-center space-x-1 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 bg-green-50 flex-1"
        >
          <span className="text-xs">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
