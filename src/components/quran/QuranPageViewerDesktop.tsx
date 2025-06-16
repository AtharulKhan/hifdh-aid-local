import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkipForward, SkipBack, BookOpen } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData, getTafsirForVerse, getTafsirIbnKathirForVerse, getTafsirMaarifForVerse } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";
import { TafsirDialog } from "./TafsirDialog";
import { TafsirViewer } from "./TafsirViewer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuranPageViewerDesktopProps {
  startingVerseId?: number;
}
export const QuranPageViewerDesktop: React.FC<QuranPageViewerDesktopProps> = ({
  startingVerseId = 1
}) => {
  const [currentSurah, setCurrentSurah] = useState(() => {
    const startingVerse = getVerseById(startingVerseId);
    return startingVerse ? startingVerse.surah : 1;
  });
  const [showTajweed, setShowTajweed] = useState(false);
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [hideVerses, setHideVerses] = useState(false);
  const [revelationRate, setRevelationRate] = useState([100]);
  const [verseRange, setVerseRange] = useState([1, 0]); // [start, end] - 0 means no limit for end
  const containerRef = useRef<HTMLDivElement | null>(null);
  const allVerses = getVersesArray();
  const currentSurahVerses = allVerses.filter(verse => verse.surah === currentSurah);
  const maxSurah = Math.max(...allVerses.map(v => v.surah));
  const totalSurahVerses = allVerses.filter(verse => verse.surah === currentSurah).length;
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
      setVerseRange([1, 0]); // Reset verse range for new surah
    }
  };
  const goToPreviousSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
      setRevelationRate([100]);
      setVerseRange([1, 0]); // Reset verse range for new surah
    }
  };
  const handleSurahSliderChange = (value: number[]) => {
    setCurrentSurah(value[0]);
    setRevelationRate([100]);
    setVerseRange([1, 0]); // Reset verse range for new surah
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
    return currentSurahVerses.slice(verseRange[0] - 1, verseRange[1] === 0 ? undefined : verseRange[1]).map(verse => getDisplayText(verse)).join(' ');
  };
  const sliderProgress = revelationRate[0] / 100;
  const words = getCombinedText().split(' ');
  const wordsToShow = Math.ceil(words.length * sliderProgress);
  const visibleText = words.slice(0, wordsToShow).join(' ');
  const displayText = hideVerses ? visibleText : getCombinedText();
  return <div className="space-y-6">
      {/* Header with Surah Info */}
      <div className="bg-white p-6 rounded-lg border border-green-100 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          {getSurahName(currentSurah)}
        </h2>
        <div className="flex justify-center space-x-4 mb-4">
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Surah {currentSurah}
          </Badge>
          <Badge variant="outline" className="border-green-200 text-green-600">
            {currentSurahVerses.length} verses
          </Badge>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center space-x-4">
          <Button variant="outline" onClick={goToPreviousSurah} disabled={currentSurah <= 1} className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100">
            <SkipBack className="h-4 w-4 mr-2" />
            Previous Surah
          </Button>
          
          <Button variant="outline" onClick={goToNextSurah} disabled={currentSurah >= maxSurah} className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100">
            Next Surah
            <SkipForward className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reader" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reader">Reader</TabsTrigger>
          <TabsTrigger value="tafsir-study">Tafsir (Study Mode)</TabsTrigger>
          <TabsTrigger value="tafsir">Tafsir (Focused)</TabsTrigger>
        </TabsList>

        <TabsContent value="reader" className="space-y-6">
          {/* Controls */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Navigation Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Navigate Surah:</span>
                  <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
                    {currentSurah} of {maxSurah}
                  </span>
                </div>
                <Slider value={[currentSurah]} onValueChange={handleSurahSliderChange} max={maxSurah} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-green-400">
                  <span>1</span>
                  <span>{maxSurah}</span>
                </div>
              </div>

              {/* Verse Range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Verse Range:</span>
                  <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
                    {verseRange[1] === 0 ? `${verseRange[0]} - ${totalSurahVerses}` : `${verseRange[0]} - ${verseRange[1]}`}
                  </span>
                </div>
                <Slider value={verseRange} onValueChange={setVerseRange} max={totalSurahVerses} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-green-400">
                  <span>1</span>
                  <span>{totalSurahVerses}</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Verse numbers:</span>
                  <Switch checked={showVerseNumbers} onCheckedChange={setShowVerseNumbers} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Tajweed:</span>
                  <Switch checked={showTajweed} onCheckedChange={setShowTajweed} className="data-[state=checked]:bg-green-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Hide verses:</span>
                  <Switch checked={hideVerses} onCheckedChange={checked => {
                  setHideVerses(checked);
                  if (!checked) {
                    setRevelationRate([100]);
                  } else {
                    setRevelationRate([0]);
                  }
                }} />
                </div>
              </div>
            </div>

            {hideVerses && <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Revelation Progress:</span>
                  <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">{revelationRate[0]}%</span>
                </div>
                <Slider value={revelationRate} onValueChange={setRevelationRate} max={100} step={1} className="w-full" />
              </div>}
          </Card>

          {/* Text Display */}
          <Card className="p-8 bg-white border border-green-100 shadow-sm min-h-[600px]">
            <div className="relative">
              {currentSurahVerses.length > 0 ? <div ref={containerRef} className="w-full relative">
                  <div className="font-arabic text-3xl leading-relaxed text-gray-800 transition-opacity duration-300 text-right" style={{
                opacity: 1,
                lineHeight: '3'
              }}>
                    {showTajweed ? <span dangerouslySetInnerHTML={{
                  __html: displayText
                }} /> : displayText}
                  </div>
                </div> : <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No verses to display</p>
                </div>}
              
              {hideVerses && revelationRate[0] === 0 && <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-center">
                    <p className="font-medium">Use the slider above to reveal verses</p>
                  </div>
                </div>}
            </div>
          </Card>

          <QuranNavigationModal onNavigate={handleNavigate} currentVerseId={currentSurahVerses[0]?.id || 1} maxVerseId={allVerses.length} />
        </TabsContent>

        <TabsContent value="tafsir-study" className="space-y-6">
          {/* Tafsir Study Mode Content */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-green-700 mb-4">Tafsir (Study Mode)</h3>
            <div className="grid grid-cols-1 gap-6">
              {currentSurahVerses.map(verse => {
              const tafsirIbnKathir = getTafsirIbnKathirForVerse(verse.surah, verse.ayah);
              const tafsirMaarif = getTafsirMaarifForVerse(verse.surah, verse.ayah);
              return <div key={verse.id} className="border border-green-100 rounded-lg p-4 bg-green-25">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="border-green-300 text-green-600">
                        {verse.surah}:{verse.ayah}
                      </Badge>
                      <TafsirDialog surah={verse.surah} ayah={verse.ayah} verseKey={verse.verse_key} />
                    </div>
                    <p className="font-arabic text-xl leading-loose text-gray-800 text-right mb-3">
                      {showTajweed ? getTajweedText(verse) : verse.text}
                    </p>
                    
                    {/* Tafsir Section */}
                    {(tafsirIbnKathir || tafsirMaarif) && <Card className="mt-4 border-amber-200">
                        <div className="p-3 bg-amber-50 border-b border-amber-200">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-amber-600" />
                            <h4 className="font-medium text-amber-700 text-sm">
                              Commentary
                            </h4>
                          </div>
                        </div>
                        
                        <Tabs defaultValue="ibn-kathir" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-amber-25 rounded-none">
                            <TabsTrigger value="ibn-kathir" className="text-xs data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                              Ibn Kathir
                            </TabsTrigger>
                            <TabsTrigger value="maarif-ul-quran" className="text-xs data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                              Maarif-ul-Qur'an
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="ibn-kathir" className="mt-0">
                            <ScrollArea className="h-[200px] p-4">
                              {tafsirIbnKathir ? (
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{
                                  __html: tafsirIbnKathir.text
                                }} />
                              ) : (
                                <p className="text-gray-500 text-sm">No Ibn Kathir commentary available for this verse.</p>
                              )}
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="maarif-ul-quran" className="mt-0">
                            <ScrollArea className="h-[200px] p-4">
                              {tafsirMaarif ? (
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{
                                  __html: tafsirMaarif.text
                                }} />
                              ) : (
                                <p className="text-gray-500 text-sm">No Maarif-ul-Qur'an commentary available for this verse.</p>
                              )}
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                      </Card>}
                  </div>;
            })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tafsir" className="space-y-6">
          <TafsirViewer startingVerseId={currentSurahVerses[0]?.id || 1} />
        </TabsContent>
      </Tabs>
    </div>;
};
