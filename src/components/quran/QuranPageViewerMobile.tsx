import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, SkipForward, SkipBack, Settings, BookOpen } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData, getJuzForVerse, getFirstVerseOfJuz, getJuzInfo, getTafsirIbnKathirForVerse, getTafsirMaarifForVerse } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";
import { TafsirDialog } from "./TafsirDialog";
import { TafsirViewer } from "./TafsirViewer";
import { PersonalNotes } from "./PersonalNotes";

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
  const [isSurahNavExpanded, setIsSurahNavExpanded] = useState(false);
  const [maxLines, setMaxLines] = useState([0]); // 0 means no limit
  const [verseRange, setVerseRange] = useState([1, 0]); // [start, end] - 0 means no limit for end
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [navigationMode, setNavigationMode] = useState<'surah' | 'juz'>('surah');
  const [currentJuz, setCurrentJuz] = useState(() => {
    const startingVerse = getVerseById(startingVerseId);
    if (startingVerse) {
      return getJuzForVerse(startingVerse.surah, startingVerse.ayah) || 1;
    }
    return 1;
  });
  
  const allVerses = getVersesArray();
  
  const getSurahVerses = (): QuranVerse[] => {
    if (navigationMode === 'juz') {
      // Get all verses for the current juz
      const juzInfo = getJuzInfo(currentJuz);
      if (!juzInfo) return [];
      
      const juzVerses: QuranVerse[] = [];
      
      // Iterate through the verse mapping for this juz
      Object.entries(juzInfo.verse_mapping).forEach(([surahNum, range]) => {
        const surahNumber = parseInt(surahNum);
        
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(Number);
          for (let ayah = start; ayah <= end; ayah++) {
            const verse = allVerses.find(v => v.surah === surahNumber && v.ayah === ayah);
            if (verse) juzVerses.push(verse);
          }
        } else {
          const ayah = parseInt(range);
          const verse = allVerses.find(v => v.surah === surahNumber && v.ayah === ayah);
          if (verse) juzVerses.push(verse);
        }
      });
      
      return juzVerses.sort((a, b) => a.id - b.id);
    } else {
      // Original surah-based logic
      const surahVerses = allVerses.filter(verse => verse.surah === currentSurah);
      
      // Apply verse range filtering
      if (verseRange[1] === 0) {
        // No end limit, show from start verse to end of surah
        return surahVerses.slice(verseRange[0] - 1);
      } else {
        // Show verses in the specified range
        return surahVerses.slice(verseRange[0] - 1, verseRange[1]);
      }
    }
  };

  const currentSurahVerses = getSurahVerses();
  const maxSurah = Math.max(...allVerses.map(v => v.surah));
  const totalSurahVerses = allVerses.filter(verse => verse.surah === currentSurah).length;
  const maxJuz = 30;

  const handleNavigate = (verseId: number) => {
    const verse = getVerseById(verseId);
    if (verse) {
      setCurrentSurah(verse.surah);
      const juzNumber = getJuzForVerse(verse.surah, verse.ayah);
      if (juzNumber) {
        setCurrentJuz(juzNumber);
      }
    }
    setRevelationRate([100]);
    setCurrentPage(1);
  };

  const goToNextSurah = () => {
    if (currentSurah < maxSurah) {
      setCurrentSurah(currentSurah + 1);
      setRevelationRate([100]);
      setCurrentPage(1);
      setVerseRange([1, 0]); // Reset verse range for new surah
    }
  };

  const goToPreviousSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
      setRevelationRate([100]);
      setCurrentPage(1);
      setVerseRange([1, 0]); // Reset verse range for new surah
    }
  };

  const handleSurahSliderChange = (value: number[]) => {
    setCurrentSurah(value[0]);
    setRevelationRate([100]);
    setCurrentPage(1);
    setVerseRange([1, 0]); // Reset verse range for new surah
  };

  const handleJuzSliderChange = (value: number[]) => {
    const juzNumber = value[0];
    setCurrentJuz(juzNumber);
    const firstVerseOfJuz = getFirstVerseOfJuz(juzNumber);
    if (firstVerseOfJuz) {
      setCurrentSurah(firstVerseOfJuz.surah);
      setRevelationRate([100]);
      setCurrentPage(1);
      setVerseRange([1, 0]);
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
    const avgCharsPerLine = 70; // Smaller for mobile
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

  return (
    <div className="space-y-4 px-2 pb-20">
      {/* Header with Surah Info - Updated */}
      <div className="bg-white p-3 rounded-lg border border-green-100 text-center space-y-3 w-full overflow-x-hidden">
        <div className="w-full space-y-3">
          {/* Surah Title */}
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-700 break-words px-2">
              {navigationMode === 'juz' ? `Juz ${currentJuz}` : getSurahName(currentSurah)}
            </h2>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPreviousSurah} 
              disabled={currentSurah <= 1} 
              className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 w-full text-xs"
            >
              <SkipBack className="h-3 w-3 mr-1" />
              Previous Surah
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToNextSurah} 
              disabled={currentSurah >= maxSurah} 
              className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 w-full text-xs"
            >
              Next Surah
              <SkipForward className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2 w-full">
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
            Surah {currentSurah}
          </Badge>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            Juz {currentJuz}
          </Badge>
          <Badge variant="outline" className="border-green-200 text-green-600 text-xs">
            {navigationMode === 'juz' 
              ? `${currentSurahVerses.length} verses in Juz ${currentJuz}`
              : `Verses ${verseRange[0]}-${verseRange[1] === 0 ? totalSurahVerses : verseRange[1]} (${currentSurahVerses.length} showing)`
            }
          </Badge>
          {maxLines[0] > 0 && totalPages > 1 && (
            <Badge variant="outline" className="border-blue-200 text-blue-600 text-xs">
              Page {currentPage} of {totalPages}
            </Badge>
          )}
        </div>

        {/* Navigation Mode Toggle */}
        <div className="flex justify-center space-x-2">
          <Button
            variant={navigationMode === 'surah' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setNavigationMode('surah')}
            className={`text-xs ${navigationMode === 'surah' ? 'bg-green-500 text-white' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
          >
            Surah
          </Button>
          <Button
            variant={navigationMode === 'juz' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setNavigationMode('juz')}
            className={`text-xs ${navigationMode === 'juz' ? 'bg-blue-500 text-white' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
          >
            Juz
          </Button>
        </div>

        {/* Navigation Slider */}
        <div className="space-y-1 bg-green-25 p-2 rounded border border-green-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-green-600">Navigate:</span>
            <span className="text-xs text-green-500 bg-green-50 px-1.5 py-0.5 rounded text-[10px]">
              {navigationMode === 'surah' ? `${currentSurah} of ${maxSurah}` : `${currentJuz} of ${maxJuz}`}
            </span>
          </div>
          <div className="px-1">
            <Slider
              value={navigationMode === 'surah' ? [currentSurah] : [currentJuz]}
              onValueChange={navigationMode === 'surah' ? handleSurahSliderChange : handleJuzSliderChange}
              max={navigationMode === 'surah' ? maxSurah : maxJuz}
              min={1}
              step={1}
              className="w-full h-1"
            />
          </div>
          <div className="flex justify-between text-[10px] text-green-400 px-1">
            <span>1</span>
            <span>{navigationMode === 'surah' ? maxSurah : maxJuz}</span>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="reader" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
          <TabsTrigger value="reader" className="text-xs px-2 py-2">Reader</TabsTrigger>
          <TabsTrigger value="tafsir-study" className="text-xs px-2 py-2">Tafsir (Scroll)</TabsTrigger>
          <TabsTrigger value="tafsir" className="text-xs px-2 py-2">Tafsir</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs px-2 py-2">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="reader" className="space-y-4">
          {/* Compact Controls */}
          <Card className="p-3 bg-green-50 border-green-100">
            <Collapsible open={isControlsExpanded} onOpenChange={setIsControlsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-2 text-green-700 hover:bg-green-100">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium text-sm">Display Options</span>
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
                          setCurrentPage(1);
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

                  {/* Verse Range Slider - Only show for Surah mode */}
                  {navigationMode === 'surah' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-700">Verse range to show:</span>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          {verseRange[1] === 0 ? `${verseRange[0]} - ${totalSurahVerses}` : `${verseRange[0]} - ${verseRange[1]}`}
                        </span>
                      </div>
                      <Slider
                        value={verseRange}
                        onValueChange={(value) => {
                          setVerseRange(value);
                          setCurrentPage(1);
                        }}
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
                  )}

                  {/* Max Lines Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-700">Max lines per page:</span>
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
                      max={30}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-green-500">
                      <span>No limit</span>
                      <span>30 lines</span>
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
                  <span className="text-xs font-medium text-green-700">
                    {maxLines[0] > 0 && totalPages > 1 ? `Page ${currentPage} Progress:` : 'Progress:'}
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
                      <span dangerouslySetInnerHTML={{ __html: displayText }} />
                    ) : (
                      displayText
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

              {/* Mobile Pagination Controls */}
              {maxLines[0] > 0 && totalPages > 1 && (
                <div className="absolute bottom-4 right-4 flex flex-col items-end space-y-2">
                  {/* Previous/Next Buttons */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage <= 1}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-2 py-1"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Prev
                    </Button>
                    <span className="text-xs text-gray-600 px-1">
                      {currentPage}/{totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={!hasNextPage}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-2 py-1"
                    >
                      Next
                      <ChevronRight className="h-3 w-3" />
                    </Button>
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
        </TabsContent>

        <TabsContent value="tafsir-study" className="space-y-4">
          {/* Tafsir Study Mode Content */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-green-700 mb-4">Tafsir (Scrollable)</h3>
            <div className="grid grid-cols-1 gap-4">
              {currentSurahVerses.map(verse => {
                const tafsirIbnKathir = getTafsirIbnKathirForVerse(verse.surah, verse.ayah);
                const tafsirMaarif = getTafsirMaarifForVerse(verse.surah, verse.ayah);
                return (
                  <div key={verse.id} className="border border-green-100 rounded-lg p-3 bg-green-25">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="border-green-300 text-green-600 text-xs">
                        {verse.surah}:{verse.ayah}
                      </Badge>
                      <TafsirDialog surah={verse.surah} ayah={verse.ayah} verseKey={verse.verse_key} />
                    </div>
                    <p className="font-arabic text-lg leading-loose text-gray-800 text-right mb-3">
                      {showTajweed ? getTajweedText(verse) : verse.text}
                    </p>
                    
                    {/* Tafsir Section */}
                    {(tafsirIbnKathir || tafsirMaarif) && (
                      <Card className="mt-3 border-amber-200">
                        <div className="p-2 bg-amber-50 border-b border-amber-200">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-3 w-3 text-amber-600" />
                            <h4 className="font-medium text-amber-700 text-xs">
                              Commentary
                            </h4>
                          </div>
                        </div>
                        
                        <Tabs defaultValue="ibn-kathir" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-amber-25 rounded-none h-8">
                            <TabsTrigger value="ibn-kathir" className="text-[10px] data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                              Ibn Kathir
                            </TabsTrigger>
                            <TabsTrigger value="maarif-ul-quran" className="text-[10px] data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                              Maarif-ul-Qur'an
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="ibn-kathir" className="mt-0">
                            <ScrollArea className="h-[150px] p-3">
                              {tafsirIbnKathir ? (
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-xs" dangerouslySetInnerHTML={{
                                  __html: tafsirIbnKathir.text
                                }} />
                              ) : (
                                <p className="text-gray-500 text-xs">No Ibn Kathir commentary available for this verse.</p>
                              )}
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="maarif-ul-quran" className="mt-0">
                            <ScrollArea className="h-[150px] p-3">
                              {tafsirMaarif ? (
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-xs" dangerouslySetInnerHTML={{
                                  __html: tafsirMaarif.text
                                }} />
                              ) : (
                                <p className="text-gray-500 text-xs">No Maarif-ul-Qur'an commentary available for this verse.</p>
                              )}
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tafsir" className="space-y-4">
          <TafsirViewer startingVerseId={currentSurahVerses[0]?.id || 1} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <PersonalNotes surahNumber={currentSurah} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
