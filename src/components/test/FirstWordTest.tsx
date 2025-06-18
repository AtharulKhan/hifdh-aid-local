import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RefreshCw, Eye, EyeOff, Settings, SkipForward } from "lucide-react";
import { getVersesArray, getSurahName, QuranVerse, getJuzInfo } from "@/data/quranData";
import { WeakSpotFlag } from "@/components/weak-spots/WeakSpotFlag";

interface FirstWordTestProps {
  onBack: () => void;
  memorizedEntries: Array<{
    id: string;
    type: 'surah' | 'juz' | 'page';
    name: string;
    reference: string;
    dateMemorized: string;
    isMemorized: boolean;
    juz: number;
    startPage: number;
    endPage: number;
  }>;
}

type TestScope = "memorized" | "juz";

export const FirstWordTest: React.FC<FirstWordTestProps> = ({ onBack, memorizedEntries }) => {
  const [testScope, setTestScope] = useState<TestScope>("memorized");
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
  const [showFullVerse, setShowFullVerse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [hoveredWords, setHoveredWords] = useState<Set<number>>(new Set());

  const allVerses = getVersesArray();

  const getMemorizedJuzNumbers = () => {
    return [...new Set(memorizedEntries.map(entry => entry.juz))].sort((a, b) => a - b);
  };

  const generateRandomVerse = () => {
    let eligibleVerses: QuranVerse[] = [];

    switch (testScope) {
      case "memorized":
        const memorizedJuzNumbers = getMemorizedJuzNumbers();
        if (memorizedJuzNumbers.length === 0) {
          eligibleVerses = allVerses;
        } else {
          eligibleVerses = allVerses.filter(verse => {
            return memorizedJuzNumbers.some(juzNumber => {
              const juzInfo = getJuzInfo(juzNumber);
              if (juzInfo) {
                const surahInJuz = Object.keys(juzInfo.verse_mapping).includes(verse.surah.toString());
                if (surahInJuz) {
                  const range = juzInfo.verse_mapping[verse.surah.toString()];
                  if (range.includes('-')) {
                    const [start, end] = range.split('-').map(Number);
                    return verse.ayah >= start && verse.ayah <= end;
                  } else {
                    return verse.ayah === parseInt(range);
                  }
                }
              }
              return false;
            });
          });
        }
        break;
      case "juz":
        const juzInfo = getJuzInfo(selectedJuz);
        if (juzInfo) {
          eligibleVerses = allVerses.filter(verse => {
            const surahInJuz = Object.keys(juzInfo.verse_mapping).includes(verse.surah.toString());
            if (surahInJuz) {
              const range = juzInfo.verse_mapping[verse.surah.toString()];
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
    }

    if (eligibleVerses.length === 0) return;

    const randomVerse = eligibleVerses[Math.floor(Math.random() * eligibleVerses.length)];
    setCurrentVerse(randomVerse);
    setShowFullVerse(false);
    setHoveredWords(new Set());
  };

  useEffect(() => {
    generateRandomVerse();
  }, [testScope, selectedJuz, memorizedEntries]);

  const handleCorrect = () => {
    setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    generateRandomVerse();
  };

  const handleIncorrect = () => {
    setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    generateRandomVerse();
  };

  const getScopeDescription = () => {
    switch (testScope) {
      case "memorized":
        const memorizedJuzNumbers = getMemorizedJuzNumbers();
        if (memorizedJuzNumbers.length === 0) {
          return "from your memorized portion (no entries found - using entire Quran)";
        }
        return `from your memorized Juz: ${memorizedJuzNumbers.join(', ')}`;
      case "juz":
        return `from Juz ${selectedJuz}`;
    }
  };

  const getWordsArray = (text: string) => {
    return text.split(' ').filter(word => word.trim().length > 0);
  };

  const handleWordHover = (index: number) => {
    setHoveredWords(prev => new Set([...prev, index]));
  };

  const handleWordLeave = (index: number) => {
    setHoveredWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const revealNextWord = () => {
    if (!currentVerse) return;
    const words = getWordsArray(currentVerse.text);
    const nextWordIndex = hoveredWords.size;
    if (nextWordIndex < words.length) {
      setHoveredWords(prev => new Set([...prev, nextWordIndex]));
    }
  };

  if (!currentVerse) {
    return <div>Loading...</div>;
  }

  const words = getWordsArray(currentVerse.text);

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 self-start">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tests</span>
        </Button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Score: {score.correct}/{score.total}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs sm:text-sm"
          >
            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={generateRandomVerse} className="text-xs sm:text-sm">
            <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Verse</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-3 md:p-4 bg-gray-50 border-gray-200">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Test Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-700">Test Scope</label>
                <Select value={testScope} onValueChange={(value: TestScope) => setTestScope(value)}>
                  <SelectTrigger className="text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memorized">Your Memorized</SelectItem>
                    <SelectItem value="juz">Specific Juz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            </div>
          </div>
        </Card>
      )}

      {/* Test Card */}
      <Card className="p-4 md:p-6 border-l-4 border-l-blue-500">
        <div className="space-y-4 md:space-y-6">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">First Word Test</h2>
            <p className="text-sm md:text-base text-gray-600 px-2">
              Read the first word, then hover or click to reveal more words {getScopeDescription()}
            </p>
          </div>

          {/* Verse Reference */}
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs md:text-sm">
                  {getSurahName(currentVerse.surah)} - Verse {currentVerse.ayah}
                </Badge>
                <WeakSpotFlag 
                  surahNumber={currentVerse.surah}
                  ayahNumber={currentVerse.ayah}
                  size="sm"
                />
              </div>
              <div className="text-sm text-gray-600">
                {currentVerse.verse_key}
              </div>
            </div>
          </div>

          {/* Verse Text with Interactive Words */}
          <div className="bg-yellow-50 p-4 md:p-6 rounded-lg border border-yellow-200">
            <div className="font-arabic text-xl md:text-3xl text-right leading-loose text-gray-800 space-x-2 rtl">
              {showFullVerse ? (
                currentVerse.text
              ) : (
                words.map((word, index) => (
                  <span
                    key={index}
                    className={`inline-block cursor-pointer transition-all duration-200 ${
                      index === 0 || hoveredWords.has(index)
                        ? 'text-gray-800' 
                        : 'text-transparent bg-gray-300 rounded px-1 hover:bg-gray-400'
                    }`}
                    onMouseEnter={() => handleWordHover(index)}
                    onMouseLeave={() => handleWordLeave(index)}
                    onClick={() => handleWordHover(index)}
                  >
                    {word}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 justify-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={revealNextWord}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
                disabled={hoveredWords.size >= words.length || showFullVerse}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Reveal Next Word
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFullVerse(!showFullVerse)}
                className="border-gray-300 w-full sm:w-auto"
              >
                {showFullVerse ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showFullVerse ? "Hide" : "Show"} Full Verse
              </Button>
            </div>

            {(showFullVerse || hoveredWords.size >= words.length) && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="default" 
                  onClick={handleCorrect}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  I Got It Right
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleIncorrect}
                  className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                >
                  I Got It Wrong
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
