
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Settings } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, surahNamesData, getJuzInfo } from "@/data/quranData";
import { MemorizationEntry } from "@/components/murajah/MemorizationTracker";

interface BeforeAfterTestProps {
  onBack: () => void;
  memorizedEntries: MemorizationEntry[];
}

type TestScope = "memorized" | "surah" | "juz" | "entire";

export const BeforeAfterTest: React.FC<BeforeAfterTestProps> = ({ onBack, memorizedEntries }) => {
  const [testScope, setTestScope] = useState<TestScope>("memorized");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
  const [beforeVerse, setBeforeVerse] = useState<QuranVerse | null>(null);
  const [afterVerse, setAfterVerse] = useState<QuranVerse | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showSettings, setShowSettings] = useState(false);

  const allVerses = getVersesArray();
  const surahNumbers = Object.keys(surahNamesData).map(Number).sort((a, b) => a - b);

  const getMemorizedJuzNumbers = () => {
    return [...new Set(memorizedEntries.map(entry => entry.juz))].sort((a, b) => a - b);
  };

  const generateRandomTest = () => {
    let eligibleVerses: QuranVerse[] = [];

    switch (testScope) {
      case "memorized":
        const memorizedJuzNumbers = getMemorizedJuzNumbers();
        if (memorizedJuzNumbers.length === 0) {
          // Fallback to entire Quran if no memorized entries
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

    // Get a random verse that has both before and after verses
    const validVerses = eligibleVerses.filter((verse, index) => {
      const verseIndex = allVerses.findIndex(v => v.id === verse.id);
      return verseIndex > 0 && verseIndex < allVerses.length - 1;
    });
    
    if (validVerses.length === 0) return;
    
    const randomVerse = validVerses[Math.floor(Math.random() * validVerses.length)];
    const verseIndex = allVerses.findIndex(v => v.id === randomVerse.id);
    
    setCurrentVerse(randomVerse);
    setBeforeVerse(allVerses[verseIndex - 1]);
    setAfterVerse(allVerses[verseIndex + 1]);
    setShowAnswer(false);
  };

  useEffect(() => {
    generateRandomTest();
  }, [testScope, selectedSurah, selectedJuz, memorizedEntries]);

  const handleCorrect = () => {
    setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    generateRandomTest();
  };

  const handleIncorrect = () => {
    setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    generateRandomTest();
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

  if (!currentVerse || !beforeVerse || !afterVerse) {
    return <div>Loading...</div>;
  }

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
          <Button variant="outline" size="sm" onClick={generateRandomTest} className="text-xs sm:text-sm">
            <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Question</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-3 md:p-4 bg-gray-50 border-gray-200">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Test Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-700">Test Scope</label>
                <Select value={testScope} onValueChange={(value: TestScope) => setTestScope(value)}>
                  <SelectTrigger className="text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memorized">Your Memorized</SelectItem>
                    <SelectItem value="surah">Within a Surah</SelectItem>
                    <SelectItem value="juz">Within a Juz</SelectItem>
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
            </div>
          </div>
        </Card>
      )}

      {/* Test Card */}
      <Card className="p-4 md:p-6 border-l-4 border-l-blue-500">
        <div className="space-y-4 md:space-y-6">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Before & After Test</h2>
            <p className="text-sm md:text-base text-gray-600 px-2">
              Recite the verse before and after the given verse {getScopeDescription()}
            </p>
          </div>

          {/* Current Verse */}
          <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs md:text-sm">
                Given Verse: {currentVerse.verse_key} - {getSurahName(currentVerse.surah)}
              </Badge>
              <div className="font-arabic text-lg md:text-2xl text-right leading-loose text-gray-800 break-words">
                {currentVerse.text}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center bg-blue-50 p-3 md:p-4 rounded-lg">
            <p className="text-blue-800 font-medium text-sm md:text-base">
              Now recite the verse BEFORE and the verse AFTER this one
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAnswer(!showAnswer)}
              className="border-gray-300 w-full sm:w-auto sm:mx-auto"
            >
              {showAnswer ? "Hide" : "Show"} Answer
            </Button>
            {showAnswer && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="default" 
                  onClick={handleCorrect}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I Got It Right
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleIncorrect}
                  className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  I Got It Wrong
                </Button>
              </div>
            )}
          </div>

          {/* Answer Section */}
          {showAnswer && (
            <div className="space-y-4 border-t pt-4">
              {/* Before Verse */}
              <div className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-200">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs md:text-sm">
                    Before: {beforeVerse.verse_key}
                  </Badge>
                  <div className="font-arabic text-base md:text-xl text-right leading-loose text-gray-800 break-words">
                    {beforeVerse.text}
                  </div>
                </div>
              </div>

              {/* After Verse */}
              <div className="bg-purple-50 p-3 md:p-4 rounded-lg border border-purple-200">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs md:text-sm">
                    After: {afterVerse.verse_key}
                  </Badge>
                  <div className="font-arabic text-base md:text-xl text-right leading-loose text-gray-800 break-words">
                    {afterVerse.text}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
