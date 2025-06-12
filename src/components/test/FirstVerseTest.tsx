
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Settings } from "lucide-react";
import { getVersesArray, getSurahName, QuranVerse, surahNamesData, getJuzInfo } from "@/data/quranData";
import { MemorizationEntry } from "@/components/murajah/MemorizationTracker";

interface FirstVerseTestProps {
  onBack: () => void;
  memorizedEntries: MemorizationEntry[];
}

type TestScope = "memorized" | "surah" | "juz" | "entire";

export const FirstVerseTest: React.FC<FirstVerseTestProps> = ({ onBack, memorizedEntries }) => {
  const [testScope, setTestScope] = useState<TestScope>("memorized");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [firstVerse, setFirstVerse] = useState<QuranVerse | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showSettings, setShowSettings] = useState(false);

  const allVerses = getVersesArray();
  const surahNumbers = Object.keys(surahNamesData).map(Number).sort((a, b) => a - b);

  const getMemorizedJuzNumbers = () => {
    return [...new Set(memorizedEntries.map(entry => entry.juz))].sort((a, b) => a - b);
  };

  const generateRandomTest = () => {
    let eligibleSurahs: number[] = [];

    switch (testScope) {
      case "memorized":
        const memorizedJuzNumbers = getMemorizedJuzNumbers();
        if (memorizedJuzNumbers.length === 0) {
          // Fallback to entire Quran if no memorized entries
          eligibleSurahs = surahNumbers;
        } else {
          const memorizedSurahs = new Set<number>();
          for (const juzNumber of memorizedJuzNumbers) {
            const juzInfo = getJuzInfo(juzNumber);
            if (juzInfo) {
              Object.keys(juzInfo.verse_mapping).forEach(surahKey => {
                memorizedSurahs.add(Number(surahKey));
              });
            }
          }
          eligibleSurahs = Array.from(memorizedSurahs).sort((a, b) => a - b);
        }
        break;
      case "surah":
        eligibleSurahs = [selectedSurah];
        break;
      case "juz":
        const juzInfo = getJuzInfo(selectedJuz);
        if (juzInfo) {
          eligibleSurahs = Object.keys(juzInfo.verse_mapping).map(Number);
        }
        break;
      case "entire":
        eligibleSurahs = surahNumbers;
        break;
    }

    if (eligibleSurahs.length === 0) return;

    const randomSurah = eligibleSurahs[Math.floor(Math.random() * eligibleSurahs.length)];
    const surahFirstVerse = allVerses.find(verse => verse.surah === randomSurah && verse.ayah === 1);
    
    if (surahFirstVerse) {
      setCurrentSurah(randomSurah);
      setFirstVerse(surahFirstVerse);
      setShowAnswer(false);
    }
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
        return `for ${getSurahName(selectedSurah)}`;
      case "juz":
        return `from Juz ${selectedJuz}`;
      case "entire":
        return `from the entire Quran`;
    }
  };

  if (!currentSurah || !firstVerse) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tests</span>
        </Button>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Score: {score.correct}/{score.total}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={generateRandomTest}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Question
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Test Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Test Scope</label>
                <Select value={testScope} onValueChange={(value: TestScope) => setTestScope(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memorized">Your Memorized</SelectItem>
                    <SelectItem value="surah">Specific Surah</SelectItem>
                    <SelectItem value="juz">Within a Juz</SelectItem>
                    <SelectItem value="entire">Entire Quran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {testScope === "surah" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Surah</label>
                  <Select value={selectedSurah.toString()} onValueChange={(value) => setSelectedSurah(Number(value))}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium text-gray-700">Select Juz</label>
                  <Select value={selectedJuz.toString()} onValueChange={(value) => setSelectedJuz(Number(value))}>
                    <SelectTrigger>
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
      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">First Verse Test</h2>
            <p className="text-gray-600">
              Recite the first verse {getScopeDescription()}
            </p>
          </div>

          {/* Surah Name */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Surah
              </Badge>
              <div className="text-3xl font-bold text-gray-800">
                {getSurahName(currentSurah)}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              Recite the first verse of this Surah
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAnswer(!showAnswer)}
              className="border-gray-300"
            >
              {showAnswer ? "Hide" : "Show"} Answer
            </Button>
            {showAnswer && (
              <>
                <Button 
                  variant="default" 
                  onClick={handleCorrect}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I Got It Right
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleIncorrect}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  I Got It Wrong
                </Button>
              </>
            )}
          </div>

          {/* Answer Section */}
          {showAnswer && (
            <div className="space-y-4 border-t pt-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    First Verse: {firstVerse.verse_key}
                  </Badge>
                  <div className="font-arabic text-2xl text-right leading-loose text-gray-800">
                    {firstVerse.text}
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
