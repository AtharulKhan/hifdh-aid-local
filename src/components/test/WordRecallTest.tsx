import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, RefreshCw, Plus, Minus, Eye, EyeOff } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getVersesArray, getSurahName, QuranVerse, surahNamesData, getJuzInfo } from "@/data/quranData";

interface TestMemorizationEntry {
  id: string;
  type: 'surah' | 'juz' | 'page';
  name: string;
  reference: string;
  dateMemorized: string;
  isMemorized: boolean;
  juz: number;
  startPage: number;
  endPage: number;
}

interface WordRecallTestProps {
  onBack: () => void;
  memorizedEntries: TestMemorizationEntry[];
}

type TestScope = "memorized" | "surah" | "juz" | "entire";

interface HiddenWord {
  wordIndex: number;
  isRevealed: boolean;
}

export const WordRecallTest: React.FC<WordRecallTestProps> = ({ onBack, memorizedEntries }) => {
  const [testScope, setTestScope] = useState<TestScope>("memorized");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [currentVerses, setCurrentVerses] = useState<QuranVerse[]>([]);
  const [versesCount, setVersesCount] = useState<number>(5);
  const [hiddenWords, setHiddenWords] = useState<Map<string, HiddenWord[]>>(new Map());
  const [gapRate, setGapRate] = useState<number>(60);
  const [showSettings, setShowSettings] = useState(false);
  const [showAllWords, setShowAllWords] = useState(false);
  const [enableTajweed, setEnableTajweed] = useState(false);

  const allVerses = getVersesArray();
  const surahNumbers = Object.keys(surahNamesData).map(Number).sort((a, b) => a - b);

  const getMemorizedJuzNumbers = () => {
    return [...new Set(memorizedEntries.map(entry => entry.juz))].sort((a, b) => a - b);
  };

  const generateRandomVerses = () => {
    let eligibleVerses: QuranVerse[] = [];

    switch (testScope) {
      case "memorized":
        const memorizedJuzNumbers = getMemorizedJuzNumbers();
        if (memorizedJuzNumbers.length === 0) {
          eligibleVerses = allVerses;
        } else {
          for (const juzNumber of memorizedJuzNumbers) {
            const juzInfo = getJuzInfo(juzNumber);
            if (juzInfo) {
              const juzVerses = allVerses.filter(verse => {
                const verseMapping = juzInfo.verse_mapping;
                const surahKey = verse.surah.toString();
                
                if (verseMapping[surahKey]) {
                  const range = verseMapping[surahKey];
                  if (range.includes('-')) {
                    const [start, end] = range.split('-').map(Number);
                    return verse.ayah >= start && verse.ayah <= end;
                  } else {
                    return verse.ayah === parseInt(range);
                  }
                }
                return false;
              });
              eligibleVerses.push(...juzVerses);
            }
          }
        }
        break;
      case "surah":
        eligibleVerses = allVerses.filter(verse => verse.surah === selectedSurah);
        break;
      case "juz":
        const juzInfo = getJuzInfo(selectedJuz);
        if (juzInfo) {
          eligibleVerses = allVerses.filter(verse => {
            const verseMapping = juzInfo.verse_mapping;
            const surahKey = verse.surah.toString();
            
            if (verseMapping[surahKey]) {
              const range = verseMapping[surahKey];
              if (range.includes('-')) {
                const [start, end] = range.split('-').map(Number);
                return verse.ayah >= start && verse.ayah <= end;
              } else {
                return verse.ayah === parseInt(range);
              }
            }
            return false;
          });
        }
        break;
      case "entire":
        eligibleVerses = allVerses;
        break;
    }

    if (eligibleVerses.length === 0) return;

    // Get random consecutive verses
    const startIndex = Math.floor(Math.random() * Math.max(1, eligibleVerses.length - versesCount));
    const selectedVerses = eligibleVerses.slice(startIndex, startIndex + versesCount);
    
    setCurrentVerses(selectedVerses);
    generateHiddenWords(selectedVerses);
  };

  const generateHiddenWords = (verses: QuranVerse[]) => {
    const newHiddenWords = new Map<string, HiddenWord[]>();
    
    verses.forEach(verse => {
      const words = verse.text.split(' ');
      const wordsToHide = Math.max(1, Math.floor(words.length * (gapRate / 100)));
      const hiddenIndices = new Set<number>();
      
      // Randomly select words to hide, avoiding first and last word
      const availableIndices = words.length > 2 ? 
        Array.from({ length: words.length - 2 }, (_, i) => i + 1) : 
        [0]; // If only 1-2 words, hide the first one
      
      while (hiddenIndices.size < wordsToHide && hiddenIndices.size < availableIndices.length) {
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        hiddenIndices.add(randomIndex);
      }
      
      const verseHiddenWords: HiddenWord[] = Array.from(hiddenIndices).map(index => ({
        wordIndex: index,
        isRevealed: false
      }));
      
      newHiddenWords.set(verse.verse_key, verseHiddenWords);
    });
    
    setHiddenWords(newHiddenWords);
  };

  useEffect(() => {
    generateRandomVerses();
  }, [testScope, selectedSurah, selectedJuz, versesCount, gapRate, memorizedEntries]);

  const revealWord = (verseKey: string, wordIndex: number) => {
    setHiddenWords(prev => {
      const newMap = new Map(prev);
      const verseWords = newMap.get(verseKey) || [];
      const updatedWords = verseWords.map(word => 
        word.wordIndex === wordIndex ? { ...word, isRevealed: true } : word
      );
      newMap.set(verseKey, updatedWords);
      return newMap;
    });
  };

  const hideWord = (verseKey: string, wordIndex: number) => {
    setHiddenWords(prev => {
      const newMap = new Map(prev);
      const verseWords = newMap.get(verseKey) || [];
      const updatedWords = verseWords.map(word => 
        word.wordIndex === wordIndex ? { ...word, isRevealed: false } : word
      );
      newMap.set(verseKey, updatedWords);
      return newMap;
    });
  };

  const renderVerseWithHiddenWords = (verse: QuranVerse) => {
    const words = verse.text.split(' ');
    const verseHiddenWords = hiddenWords.get(verse.verse_key) || [];
    
    return words.map((word, index) => {
      const hiddenWord = verseHiddenWords.find(hw => hw.wordIndex === index);
      const isHidden = hiddenWord && !hiddenWord.isRevealed && !showAllWords;
      
      if (isHidden) {
        return (
          <span
            key={index}
            className="inline-block mx-1 px-2 py-1 bg-blue-100 text-blue-100 rounded cursor-pointer hover:bg-blue-200 hover:text-blue-800 transition-all duration-200 select-none"
            onMouseEnter={() => revealWord(verse.verse_key, index)}
            onMouseLeave={() => hideWord(verse.verse_key, index)}
            title="Hover to reveal"
          >
            {"_".repeat(Math.max(3, Math.min(8, word.length)))}
          </span>
        );
      }
      
      return (
        <span key={index} className="mx-1">
          {word}
        </span>
      );
    });
  };

  const getScopeDescription = () => {
    switch (testScope) {
      case "memorized":
        const memorizedJuzNumbers = getMemorizedJuzNumbers();
        if (memorizedJuzNumbers.length === 0) {
          return "from your memorized portion (no entries found - using entire Quran)";
        }
        return `from your memorized Juz: ${memorizedJuzNumbers.join(', ')}`;
      case "surah":
        return `from ${getSurahName(selectedSurah)}`;
      case "juz":
        return `from Juz ${selectedJuz}`;
      case "entire":
        return `from the entire Quran`;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 self-start">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tests</span>
        </Button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Gap Rate: {gapRate}%
          </Badge>
          {enableTajweed && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Tajweed: On
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs sm:text-sm"
          >
            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAllWords(!showAllWords)}
            className="text-xs sm:text-sm"
          >
            {showAllWords ? <EyeOff className="h-4 w-4 mr-1 sm:mr-2" /> : <Eye className="h-4 w-4 mr-1 sm:mr-2" />}
            {showAllWords ? "Hide" : "Show"} All
          </Button>
          <Button variant="outline" size="sm" onClick={generateRandomVerses} className="text-xs sm:text-sm">
            <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Passage</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Test Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-700">Test Scope</label>
                <Select value={testScope} onValueChange={(value: TestScope) => setTestScope(value)}>
                  <SelectTrigger className="text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memorized">Your Memorized</SelectItem>
                    <SelectItem value="surah">Specific Surah</SelectItem>
                    <SelectItem value="juz">Specific Juz</SelectItem>
                    <SelectItem value="entire">Entire Quran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {testScope === "surah" && (
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700">Select Surah</label>
                  <Select value={selectedSurah.toString()} onValueChange={(value) => setSelectedSurah(Number(value))}>
                    <SelectTrigger className="text-xs md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {surahNumbers.map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}. {getSurahName(num)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {testScope === "juz" && (
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-gray-700">Select Juz</label>
                  <Select value={selectedJuz.toString()} onValueChange={(value) => setSelectedJuz(Number(value))}>
                    <SelectTrigger className="text-xs md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          Juz {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-700">Gap Rate: {gapRate}%</label>
                <Slider
                  value={[gapRate]}
                  onValueChange={(value) => setGapRate(value[0])}
                  max={80}
                  min={20}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Additional Settings Row */}
            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
              <div className="flex items-center space-x-2">
                <Switch
                  id="tajweed-mode"
                  checked={enableTajweed}
                  onCheckedChange={setEnableTajweed}
                />
                <label 
                  htmlFor="tajweed-mode" 
                  className="text-xs md:text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Enable Tajweed Rules Display
                </label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Verses Count Controls */}
      <Card className="p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">Word Recall Gap Fill</h4>
            <p className="text-xs md:text-sm text-gray-600">
              Showing {currentVerses.length} verses {getScopeDescription()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVersesCount(Math.max(1, versesCount - 1))}
              disabled={versesCount <= 1}
              className="text-xs sm:text-sm"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {versesCount} verses
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVersesCount(Math.min(20, versesCount + 1))}
              disabled={versesCount >= 20}
              className="text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Verses Display */}
      <div className="space-y-4">
        {currentVerses.map((verse, index) => (
          <Card key={verse.verse_key} className="p-4 md:p-6 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs md:text-sm">
                  {verse.verse_key} - {getSurahName(verse.surah)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Verse {index + 1} of {currentVerses.length}
                </Badge>
              </div>
              <div className={`font-arabic text-lg md:text-2xl text-right leading-relaxed text-gray-800 break-words p-4 bg-white rounded-lg border border-slate-100 ${enableTajweed ? 'tajweed-text' : ''}`}>
                {renderVerseWithHiddenWords(verse)}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Hover over the gaps to reveal hidden words • {hiddenWords.get(verse.verse_key)?.length || 0} words hidden
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <div className="text-center space-y-2">
          <h4 className="font-semibold text-gray-800 text-sm md:text-base">💡 How to Use</h4>
          <p className="text-xs md:text-sm text-gray-600">
            Read the passage mentally, filling in the gaps from memory. Hover over any gap to check if you remembered correctly. Move your mouse away to hide the word again. Use settings to adjust difficulty and enable Tajweed rules display.
          </p>
        </div>
      </Card>
    </div>
  );
};
