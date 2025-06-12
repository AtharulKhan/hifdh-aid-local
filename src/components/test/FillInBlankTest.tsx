
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Settings } from "lucide-react";
import { getVersesArray, getSurahName, QuranVerse, surahNamesData, getJuzInfo } from "@/data/quranData";
import { MemorizationEntry } from "@/components/murajah/MemorizationTracker";

interface FillInBlankTestProps {
  onBack: () => void;
  memorizedEntries: MemorizationEntry[];
}

type TestScope = "memorized" | "surah" | "juz" | "entire";

export const FillInBlankTest: React.FC<FillInBlankTestProps> = ({ onBack, memorizedEntries }) => {
  const [testScope, setTestScope] = useState<TestScope>("memorized");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
  const [hiddenWordIndex, setHiddenWordIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
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

    if (eligibleVerses.length === 0) return;

    const randomVerse = eligibleVerses[Math.floor(Math.random() * eligibleVerses.length)];
    const words = randomVerse.text.split(' ');
    
    // Don't hide the first or last word, and ensure there are at least 3 words
    if (words.length >= 3) {
      const randomWordIndex = Math.floor(Math.random() * (words.length - 2)) + 1;
      setCurrentVerse(randomVerse);
      setHiddenWordIndex(randomWordIndex);
      setUserAnswer("");
      setShowAnswer(false);
    } else {
      // If verse is too short, try again
      generateRandomTest();
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
        return `from ${getSurahName(selectedSurah)}`;
      case "juz":
        return `from Juz ${selectedJuz}`;
      case "entire":
        return `from the entire Quran`;
    }
  };

  const getVerseWithBlank = () => {
    if (!currentVerse) return "";
    
    const words = currentVerse.text.split(' ');
    const modifiedWords = words.map((word, index) => 
      index === hiddenWordIndex ? "____" : word
    );
    return modifiedWords.join(' ');
  };

  const getHiddenWord = () => {
    if (!currentVerse) return "";
    const words = currentVerse.text.split(' ');
    return words[hiddenWordIndex] || "";
  };

  if (!currentVerse) {
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
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
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
                    <SelectItem value="surah">Within a Surah</SelectItem>
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
      <Card className="p-6 border-l-4 border-l-orange-500">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Fill in the Blank</h2>
            <p className="text-gray-600">
              Complete the missing word {getScopeDescription()}
            </p>
          </div>

          {/* Verse with Blank */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {currentVerse.verse_key} - {getSurahName(currentVerse.surah)}
              </Badge>
              <div className="font-arabic text-2xl text-right leading-loose text-gray-800">
                {getVerseWithBlank()}
              </div>
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            <div className="text-center">
              <label className="text-blue-800 font-medium">Fill in the missing word:</label>
            </div>
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the missing word here..."
              className="text-center font-arabic text-lg"
              dir="rtl"
            />
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
                    Missing Word
                  </Badge>
                  <div className="font-arabic text-2xl text-center text-gray-800">
                    {getHiddenWord()}
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Complete Verse
                  </Badge>
                  <div className="font-arabic text-xl text-right leading-loose text-gray-800">
                    {currentVerse.text}
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
