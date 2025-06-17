
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { SkipForward, SkipBack, BookOpen, Search } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, tajweedData, getTafsirForVerse, getTafsirIbnKathirForVerse, getTafsirMaarifForVerse, getTranslationForVerse } from "@/data/quranData";
import { QuranNavigationModal } from "./QuranNavigationModal";
import { TafsirDialog } from "./TafsirDialog";
import { TafsirViewer } from "./TafsirViewer";
import { PersonalNotes } from "./PersonalNotes";
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
  const [showTranslation, setShowTranslation] = useState(false);
  const [hideVerses, setHideVerses] = useState(false);
  const [revelationRate, setRevelationRate] = useState([100]);
  const [verseRange, setVerseRange] = useState([1, 0]); // [start, end] - 0 means no limit for end
  const [surahSearch, setSurahSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const allVerses = getVersesArray();
  const currentSurahVerses = allVerses.filter(verse => verse.surah === currentSurah);
  const maxSurah = Math.max(...allVerses.map(v => v.surah));
  const totalSurahVerses = allVerses.filter(verse => verse.surah === currentSurah).length;

  // Filter surahs based on search
  const filteredSurahs = Array.from({ length: maxSurah }, (_, i) => i + 1).filter((surahNum) => {
    if (!surahSearch.trim()) return true;
    const surahName = getSurahName(surahNum).toLowerCase();
    const searchTerm = surahSearch.toLowerCase();
    return surahName.includes(searchTerm) || surahNum.toString().includes(searchTerm);
  });

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

  const handleSurahSelect = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    setRevelationRate([100]);
    setVerseRange([1, 0]);
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

  // Get verses to display based on range and revelation rate
  const getVersesToDisplay = () => {
    const rangeVerses = currentSurahVerses.slice(verseRange[0] - 1, verseRange[1] === 0 ? undefined : verseRange[1]);
    
    if (!hideVerses) {
      return rangeVerses;
    }
    
    // Calculate how many verses to show based on revelation rate
    const versesToShow = Math.ceil(rangeVerses.length * (revelationRate[0] / 100));
    return rangeVerses.slice(0, versesToShow);
  };

  const versesToDisplay = getVersesToDisplay();

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

        {/* Search Input */}
        <div className="mb-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
            <Input
              placeholder="Search surah by name or number..."
              value={surahSearch}
              onChange={(e) => setSurahSearch(e.target.value)}
              className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-200"
            />
          </div>
        </div>

        {/* Horizontal Surah Navigation Carousel */}
        <div className="mb-6">
          <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: "start", loop: false }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {filteredSurahs.map((surahNum) => (
                <CarouselItem key={surahNum} className="pl-2 md:pl-4 basis-1/6 md:basis-1/8">
                  <Button
                    variant={currentSurah === surahNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSurahSelect(surahNum)}
                    className={`w-full h-12 text-xs flex flex-col items-center justify-center ${
                      currentSurah === surahNum 
                        ? "bg-green-600 text-white border-green-600" 
                        : "bg-white border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <span className="font-bold">{surahNum}</span>
                    <span className="text-[10px] truncate w-full">{getSurahName(surahNum).split(' ')[0]}</span>
                  </Button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-green-200 text-green-600 hover:bg-green-50" />
            <CarouselNext className="border-green-200 text-green-600 hover:bg-green-50" />
          </Carousel>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reader">Reader</TabsTrigger>
          <TabsTrigger value="tafsir-study">Tafsir (Scrollable)</TabsTrigger>
          <TabsTrigger value="tafsir">Tafsir (Focused)</TabsTrigger>
          <TabsTrigger value="notes">Personal Notes</TabsTrigger>
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
                  <span className="text-sm font-medium text-gray-600">Translation:</span>
                  <Switch checked={showTranslation} onCheckedChange={setShowTranslation} className="data-[state=checked]:bg-green-500" />
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
              {versesToDisplay.length > 0 ? <div ref={containerRef} className="w-full relative space-y-4">
                  {versesToDisplay.map((verse, index) => (
                    <div key={verse.id} className="verse-container">
                      {/* Arabic Text */}
                      <div className="font-arabic text-3xl leading-relaxed text-gray-800 transition-opacity duration-300 text-right mb-2" style={{
                        opacity: 1,
                        lineHeight: '3'
                      }}>
                        {showTajweed ? <span dangerouslySetInnerHTML={{
                          __html: getDisplayText(verse)
                        }} /> : getDisplayText(verse)}
                      </div>
                      
                      {/* Translation Display - Right under each verse */}
                      {showTranslation && (
                        <div className="mb-4">
                          <p className="text-right text-gray-600 text-base leading-relaxed italic">
                            {getTranslationForVerse(verse.surah, verse.ayah)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div> : <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No verses to display</p>
                </div>}
              
              {/* Hide verses overlay */}
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
            <h3 className="text-lg font-semibold text-green-700 mb-4">Tafsir (Scrollable)</h3>
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

        <TabsContent value="notes" className="space-y-6">
          <PersonalNotes surahNumber={currentSurah} />
        </TabsContent>
      </Tabs>
    </div>;
};
