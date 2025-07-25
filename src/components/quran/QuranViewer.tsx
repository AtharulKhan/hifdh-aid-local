import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowRight, ChevronsRight, SkipForward, SkipBack } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData, getJuzForVerse } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";
import { TafsirDialog } from "./TafsirDialog";
import { FlaggedVerseIdentifier } from "@/types/features";

interface QuranViewerProps {
  startingVerseId?: number;
}

export const QuranViewer: React.FC<QuranViewerProps> = ({
  startingVerseId = 1
}) => {
  const { user } = useAuth();
  const [flaggedVerses, setFlaggedVerses] = useState<FlaggedVerseIdentifier[]>([]);
  const [currentVerseId, setCurrentVerseId] = useState(startingVerseId);
  const [viewMode, setViewMode] = useState<'hidden' | 'partial' | 'full'>('hidden');
  const [showTajweed, setShowTajweed] = useState(false);
  const [verseRevealStates, setVerseRevealStates] = useState<Record<number, 'hidden' | 'partial' | 'more' | 'full'>>({});
  const [hoverWordCounts, setHoverWordCounts] = useState<Record<number, number>>({});
  const [verseSliderValues, setVerseSliderValues] = useState<Record<number, number>>({});
  const [nextWordCounts, setNextWordCounts] = useState<Record<number, number>>({});
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [verseRange, setVerseRange] = useState<[number, number]>([1, 10]);
  const verseTextRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const allVerses = getVersesArray();
  const maxVerseId = allVerses.length;
  const maxSurah = Math.max(...allVerses.map(verse => verse.surah));
  const [currentJuz, setCurrentJuz] = useState(() => {
    const startingVerse = getVerseById(startingVerseId);
    if (startingVerse) {
      return getJuzForVerse(startingVerse.surah, startingVerse.ayah) || 1;
    }
    return 1;
  });

  useEffect(() => {
    const fetchFlaggedVerses = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('weak_spots')
          .select('surah_number, ayah_number')
          .eq('user_id', user.id)
          .eq('status', 'weak');
        if (error) {
          console.error('Error fetching flagged verses:', error);
        } else {
          setFlaggedVerses(data || []);
        }
      }
    };
    fetchFlaggedVerses();
  }, [user]);

  const isVerseFlagged = (surah: number, ayah: number): boolean => {
    return flaggedVerses.some(spot => spot.surah_number === surah && spot.ayah_number === ayah);
  };

  const toggleFlagVerse = async (surah: number, ayah: number): Promise<void> => {
    if (!user) return;

    if (isVerseFlagged(surah, ayah)) {
      // Delete the verse
      const { error } = await supabase
        .from('weak_spots')
        .delete()
        .match({ user_id: user.id, surah_number: surah, ayah_number: ayah });
      if (error) {
        console.error('Error unflagging verse:', error);
      } else {
        setFlaggedVerses(prev => prev.filter(spot => !(spot.surah_number === surah && spot.ayah_number === ayah)));
      }
    } else {
      // Insert a new record
      const { error } = await supabase
        .from('weak_spots')
        .insert([{ user_id: user.id, surah_number: surah, ayah_number: ayah, status: 'weak' }]);
      if (error) {
        console.error('Error flagging verse:', error);
      } else {
        setFlaggedVerses(prev => [...prev, { surah_number: surah, ayah_number: ayah }]);
      }
    }
  };

  // Get current verses to display - now shows verses in the selected range within the current surah
  const getCurrentVerses = (): QuranVerse[] => {
    const currentVerse = getVerseById(currentVerseId);
    if (!currentVerse) return [];

    // Get all verses for the current surah
    const surahVerses = allVerses.filter(verse => verse.surah === currentVerse.surah);

    // Filter by verse range (ayah numbers within the surah)
    return surahVerses.filter(verse => verse.ayah >= verseRange[0] && verse.ayah <= verseRange[1]);
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
    setNextWordCounts({});

    // Update current juz
    const verse = getVerseById(verseId);
    if (verse) {
      const juzNumber = getJuzForVerse(verse.surah, verse.ayah);
      if (juzNumber) {
        setCurrentJuz(juzNumber);
      }
    }

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

  const showNextWord = (verseId: number) => {
    const verse = getVerseById(verseId);
    if (!verse) return;
    
    const verseText = showTajweed ? getTajweedText(verse) : verse.text;
    const words = verseText.split(' ');
    const sliderValue = verseSliderValues[verseId] || 0;
    const currentVisible = Math.ceil(words.length * (sliderValue / 100));
    const nextWordCount = nextWordCounts[verseId] || 0;
    const maxAdditional = words.length - currentVisible;
    
    if (nextWordCount < maxAdditional) {
      setNextWordCounts(prev => ({
        ...prev,
        [verseId]: (prev[verseId] || 0) + 1
      }));
    }
  };

  const resetNextWords = (verseId: number) => {
    setNextWordCounts(prev => ({
      ...prev,
      [verseId]: 0
    }));
  };

  const handleMouseMove = (verseId: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'hidden' || verseRevealStates[verseId]) return;
    const verseTextElement = verseTextRefs.current[verseId];
    if (!verseTextElement) return;
    const rect = verseTextElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const textWidth = rect.width;
    const height = rect.height;

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
      const percentageFromRight = Math.max(0, Math.min(1, (textWidth - x) / textWidth));
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
    const nextWordCount = nextWordCounts[verse.id] || 0;

    if (sliderValue > 0) {
      const wordsToShow = Math.ceil(words.length * (sliderValue / 100));
      const totalVisible = Math.min(wordsToShow + nextWordCount, words.length);
      return words.slice(0, totalVisible).join(' ');
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
    // Reset next word count when slider changes
    setNextWordCounts(prev => ({
      ...prev,
      [verseId]: 0
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Header with Surah Info */}
      {currentVerse && (
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 text-center space-y-3 w-full overflow-x-hidden">
          <div className="w-full space-y-3">
            {/* Surah Title */}
            <div className="w-full">
              <h2 className="text-lg sm:text-xl font-bold text-gray-700 break-words px-2">
                {getSurahName(currentVerse.surah)}
              </h2>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full">
              <Button variant="outline" size="sm" onClick={goToPreviousSurah} disabled={currentVerse.surah <= 1} className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 w-full sm:w-auto text-xs sm:text-sm">
                <SkipBack className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Previous Surah
              </Button>
              
              <Button variant="outline" size="sm" onClick={goToNextSurah} disabled={!allVerses.find(v => v.surah === currentVerse.surah + 1)} className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 w-full sm:w-auto text-xs sm:text-sm">
                Next Surah
                <SkipForward className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 w-full">
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
              Surah {currentVerse.surah}
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              Juz {currentJuz}
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-600 text-xs">
              Verses {verseRange[0]}-{verseRange[1]} ({currentVerses.length} showing)
            </Badge>
          </div>

          {/* Surah Navigation Slider - More subtle design */}
          <div className="space-y-1 bg-green-25 p-2 rounded border border-green-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-600">Navigate:</span>
              <span className="text-xs text-green-500 bg-green-50 px-1.5 py-0.5 rounded text-[10px]">
                {currentVerse.surah} of {maxSurah}
              </span>
            </div>
            <div className="px-1">
              <Slider value={[currentVerse.surah]} onValueChange={handleSurahSliderChange} max={maxSurah} min={1} step={1} className="w-full h-1" />
            </div>
            <div className="flex justify-between text-[10px] text-green-400 px-1">
              <span>1</span>
              <span>{maxSurah}</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Control Panel */}
      <Card className="p-3 sm:p-4 bg-blue-50 border-blue-100 w-full overflow-x-hidden">
        <Collapsible open={isControlsExpanded} onOpenChange={setIsControlsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-2 text-blue-700 hover:bg-blue-100">
              <span className="font-medium text-sm sm:text-base">Display Options</span>
              {isControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="pt-3 sm:pt-4 space-y-4">
              {/* Tajweed Toggle and View Mode Buttons */}
              <div className="space-y-3 sm:space-y-4">
                {/* Tajweed Toggle */}
                <div className="flex items-center justify-center sm:justify-start space-x-2 p-2 bg-white rounded-lg border border-blue-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Tajweed:</span>
                  <Switch checked={showTajweed} onCheckedChange={setShowTajweed} />
                </div>
                
                {/* View Mode Buttons */}
                <div className="space-y-2">
                  <span className="text-xs sm:text-sm font-medium text-blue-700 block">View Mode:</span>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    <Button variant={viewMode === 'hidden' ? "default" : "outline"} size="sm" onClick={() => setViewMode('hidden')} className={`text-xs sm:text-sm ${viewMode === 'hidden' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}`}>
                      Hide
                    </Button>
                    <Button variant={viewMode === 'partial' ? "default" : "outline"} size="sm" onClick={() => setViewMode('partial')} className={`text-xs sm:text-sm ${viewMode === 'partial' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}`}>
                      Show Partial
                    </Button>
                    <Button variant={viewMode === 'full' ? "default" : "outline"} size="sm" onClick={() => setViewMode('full')} className={`text-xs sm:text-sm ${viewMode === 'full' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"}`}>
                      Show Full
                    </Button>
                    <div className="col-span-2 sm:col-span-1 sm:ml-auto">
                      <QuranNavigationModal onNavigate={handleNavigate} currentVerseId={currentVerseId} maxVerseId={maxVerseId} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verse Range Slider */}
              <div className="space-y-2 bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-green-700">Verse range to show:</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    {verseRange[0]} - {verseRange[1]}
                  </span>
                </div>
                <Slider value={verseRange} onValueChange={handleVerseRangeChange} max={getCurrentSurahMaxVerse()} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-green-500">
                  <span>Verse 1</span>
                  <span>Verse {getCurrentSurahMaxVerse()}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* More spacing before verses section - increased spacing for clear separation */}
      <div className="pt-8">
        {/* Verses Display */}
        <div className="space-y-6 w-full overflow-x-hidden">
          {viewMode !== 'hidden' || Object.keys(verseRevealStates).length > 0 || Object.keys(hoverWordCounts).some(key => hoverWordCounts[Number(key)] > 0) || Object.keys(verseSliderValues).some(key => verseSliderValues[Number(key)] > 0) ? (
            currentVerses.map(verse => {
              const verseText = showTajweed ? getTajweedText(verse) : verse.text;
              const words = verseText.split(' ');
              const sliderValue = verseSliderValues[verse.id] || 0;
              const nextWordCount = nextWordCounts[verse.id] || 0;
              const currentVisible = Math.ceil(words.length * (sliderValue / 100));
              const totalVisible = Math.min(currentVisible + nextWordCount, words.length);

              return (
                <Card key={verse.id} className="bg-white border border-green-100 shadow-sm w-full overflow-x-hidden">
                  <div className="p-4 sm:p-6 space-y-4 w-full overflow-x-hidden">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge variant="outline" className="border-green-200 text-green-600">
                        {verse.verse_key}
                      </Badge>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFlagVerse(verse.surah, verse.ayah)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Flag
                            className="h-5 w-5"
                            fill={isVerseFlagged(verse.surah, verse.ayah) ? 'red' : 'none'}
                          />
                        </Button>
                      )}
                    </div>
                    
                    {/* Individual Verse Revelation Slider */}
                    <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200 w-full overflow-x-hidden">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm font-medium text-blue-700">Verse Revelation:</span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {verseSliderValues[verse.id] || 0}%
                          {nextWordCount > 0 && (
                            <span className="text-green-600 ml-1">
                              (+{nextWordCount} {nextWordCount === 1 ? 'word' : 'words'})
                            </span>
                          )}
                        </span>
                      </div>
                      <Slider 
                        value={[verseSliderValues[verse.id] || 0]} 
                        onValueChange={value => handleVerseSliderChange(verse.id, value)} 
                        max={100} 
                        step={1} 
                        className="w-full" 
                      />
                      <div className="flex justify-between text-xs text-blue-500">
                        <span>Hidden</span>
                        <span>Fully Revealed</span>
                      </div>
                      
                      {/* Show Next Word Button */}
                      {sliderValue > 0 && totalVisible < words.length && (
                        <div className="flex justify-center gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => showNextWord(verse.id)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Show Next Word
                          </Button>
                          {nextWordCount > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resetNextWords(verse.id)}
                              className="border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative w-full overflow-x-hidden">
                      <div 
                        onMouseMove={e => handleMouseMove(verse.id, e)} 
                        onMouseLeave={() => handleMouseLeave(verse.id)} 
                        style={{
                          opacity: viewMode === 'hidden' && !verseRevealStates[verse.id] && !verseSliderValues[verse.id] ? 
                            hoverWordCounts[verse.id] ? 0.7 + hoverWordCounts[verse.id] * 0.3 : 0.1 : 1
                        }} 
                        ref={el => verseTextRefs.current[verse.id] = el} 
                        className="font-arabic text-right text-xl sm:text-2xl leading-loose text-gray-800 min-h-[3rem] transition-all duration-300 ease-out cursor-pointer w-full break-words overflow-wrap-anywhere mx-0 py-0 my-0"
                      >
                        <span className="inline-block text-right w-full break-words overflow-wrap-anywhere my-0 py-[26px]">
                          {showTajweed ? (
                            <span dangerouslySetInnerHTML={{ __html: getVerseDisplay(verse) }} />
                          ) : (
                            getVerseDisplay(verse)
                          )}
                        </span>
                      </div>
                      
                      {viewMode === 'hidden' && verseRevealStates[verse.id] !== 'full' && !verseSliderValues[verse.id] && (
                        <div className="flex flex-wrap justify-end gap-2 mt-4">
                          {!verseRevealStates[verse.id] && (
                            <Button variant="outline" size="sm" onClick={() => revealVerse(verse.id, 'partial')} className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in text-xs">
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Reveal Part
                            </Button>
                          )}
                          {verseRevealStates[verse.id] === 'partial' && (
                            <Button variant="outline" size="sm" onClick={() => revealVerse(verse.id, 'more')} className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in text-xs">
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Reveal More
                            </Button>
                          )}
                          {verseRevealStates[verse.id] === 'more' && (
                            <Button variant="outline" size="sm" onClick={() => revealVerse(verse.id, 'full')} className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in text-xs">
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Reveal Rest
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => revealVerse(verse.id, 'full')} className="border-green-200 text-green-600 hover:bg-green-50 bg-green-25 transition-all duration-300 animate-fade-in text-xs">
                            <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Reveal All
                          </Button>
                          <TafsirDialog surah={verse.surah} ayah={verse.ayah} verseKey={verse.verse_key} />
                        </div>
                      )}

                      {/* Always show tafsir button when verse is fully revealed or in other view modes */}
                      {(viewMode !== 'hidden' || verseRevealStates[verse.id] === 'full' || verseSliderValues[verse.id] > 0) && (
                        <div className="flex justify-end mt-4">
                          <TafsirDialog surah={verse.surah} ayah={verse.ayah} verseKey={verse.verse_key} />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="space-y-6 w-full overflow-x-hidden">
              {currentVerses.map(verse => {
                const verseText = showTajweed ? getTajweedText(verse) : verse.text;
                const words = verseText.split(' ');
                const sliderValue = verseSliderValues[verse.id] || 0;
                const nextWordCount = nextWordCounts[verse.id] || 0;
                const currentVisible = Math.ceil(words.length * (sliderValue / 100));
                const totalVisible = Math.min(currentVisible + nextWordCount, words.length);

                return (
                  <Card key={verse.id} className="bg-white border border-green-100 shadow-sm w-full overflow-x-hidden">
                    <div className="p-4 sm:p-6 space-y-4 w-full overflow-x-hidden">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Badge variant="outline" className="border-green-200 text-green-600">
                          {verse.verse_key}
                        </Badge>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFlagVerse(verse.surah, verse.ayah)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Flag
                              className="h-5 w-5"
                              fill={isVerseFlagged(verse.surah, verse.ayah) ? 'red' : 'none'}
                            />
                          </Button>
                        )}
                      </div>
                      
                      {/* Individual Verse Revelation Slider */}
                      <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200 w-full overflow-x-hidden">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-sm font-medium text-blue-700">Verse Revelation:</span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {verseSliderValues[verse.id] || 0}%
                            {nextWordCount > 0 && (
                              <span className="text-green-600 ml-1">
                                (+{nextWordCount} {nextWordCount === 1 ? 'word' : 'words'})
                              </span>
                            )}
                          </span>
                        </div>
                        <Slider 
                          value={[verseSliderValues[verse.id] || 0]} 
                          onValueChange={value => handleVerseSliderChange(verse.id, value)} 
                          max={100} 
                          step={1} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-blue-500">
                          <span>Hidden</span>
                          <span>Fully Revealed</span>
                        </div>
                        
                        {/* Show Next Word Button */}
                        {sliderValue > 0 && totalVisible < words.length && (
                          <div className="flex justify-center gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => showNextWord(verse.id)}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Show Next Word
                            </Button>
                            {nextWordCount > 0 && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => resetNextWords(verse.id)}
                                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="relative w-full overflow-x-hidden">
                        <div 
                          className="font-arabic text-right text-xl sm:text-2xl leading-loose text-gray-800 min-h-[3rem] transition-all duration-300 ease-out cursor-pointer w-full break-words overflow-wrap-anywhere" 
                          onMouseMove={e => handleMouseMove(verse.id, e)} 
                          onMouseLeave={() => handleMouseLeave(verse.id)} 
                          style={{
                            opacity: hoverWordCounts[verse.id] || verseSliderValues[verse.id] ? 
                              verseSliderValues[verse.id] ? 1 : 0.7 + hoverWordCounts[verse.id] * 0.3 : 0.1
                          }} 
                          ref={el => verseTextRefs.current[verse.id] = el}
                        >
                          <span className="inline-block text-right w-full break-words overflow-wrap-anywhere">
                            {showTajweed ? (
                              <span dangerouslySetInnerHTML={{ __html: getVerseDisplay(verse) }} />
                            ) : (
                              getVerseDisplay(verse)
                            )}
                          </span>
                        </div>
                        
                        {!verseSliderValues[verse.id] && (
                          <div className="flex flex-wrap justify-end gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => revealVerse(verse.id, 'partial')} className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-blue-25 transition-all duration-300 animate-fade-in text-xs">
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Reveal Part
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => revealVerse(verse.id, 'full')} className="border-green-200 text-green-600 hover:bg-green-50 bg-green-25 transition-all duration-300 animate-fade-in text-xs">
                              <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Reveal All
                            </Button>
                            <TafsirDialog surah={verse.surah} ayah={verse.ayah} verseKey={verse.verse_key} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls - Simplified without duplicate surah slider */}
      <Card className="p-4 bg-blue-50 border-blue-100 w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goToPreviousSurah} disabled={!currentVerse || currentVerse.surah <= 1} className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50">
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Surah</span>
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600">
              Surah {currentVerse?.surah || 1} of {maxSurah}
            </span>
          </div>

          <Button variant="outline" onClick={goToNextSurah} disabled={!currentVerse || !allVerses.find(v => v.surah === currentVerse.surah + 1)} className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 bg-blue-50">
            <span>Next Surah</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
