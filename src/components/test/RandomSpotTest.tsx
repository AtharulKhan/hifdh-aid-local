import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Settings, ArrowRight } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, surahNamesData, getJuzInfo } from "@/data/quranData";
import { MemorizationEntry } from "@/components/murajah/MemorizationTracker";

interface RandomSpotTestProps {
  onBack: () => void;
  memorizedEntries: MemorizationEntry[];
}

type TestScope = "memorized" | "surah" | "juz" | "entire";

export const RandomSpotTest: React.FC<RandomSpotTestProps> = ({ onBack, memorizedEntries }) => {
  const [testScope, setTestScope] = useState<TestScope>("memorized");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [numberOfVerses, setNumberOfVerses] = useState<number>(1);
  const [currentVerses, setCurrentVerses] = useState<QuranVerse[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [sliderValue, setSliderValue] = useState<number[]>([1]);
  const [nextWordCount, setNextWordCount] = useState<number>(0);

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

    if (eligibleVerses.length > 0) {
      // Find a random starting verse that has enough consecutive verses
      const maxStartIndex = Math.max(0, eligibleVerses.length - numberOfVerses);
      let attempts = 0;
      let consecutiveVerses: QuranVerse[] = [];
      
      while (attempts < 50 && consecutiveVerses.length < numberOfVerses) {
        const randomStartIndex = Math.floor(Math.random() * (maxStartIndex + 1));
        const startVerse = eligibleVerses[randomStartIndex];
        
        // Try to get consecutive verses
        consecutiveVerses = [];
        for (let i = 0; i < numberOfVerses; i++) {
          const nextVerse = allVerses.find(v => 
            v.surah === startVerse.surah && 
            v.ayah === startVerse.ayah + i
          );
          if (nextVerse && eligibleVerses.includes(nextVerse)) {
            consecutiveVerses.push(nextVerse);
          } else {
            break;
          }
        }
        attempts++;
      }
      
      // If we couldn't find consecutive verses, just take individual verses
      if (consecutiveVerses.length < numberOfVerses) {
        const shuffled = [...eligibleVerses].sort(() => 0.5 - Math.random());
        consecutiveVerses = shuffled.slice(0, numberOfVerses);
      }
      
      setCurrentVerses(consecutiveVerses);
      setShowAnswer(false);
      setNextWordCount(0);
    }
  };

  // Get all words from all verses combined
  const getAllWords = () => {
    return currentVerses.flatMap(verse => verse.text.split(' '));
  };

  const getTotalWordCount = () => {
    return getAllWords().length;
  };

  const getVisibleText = (wordCount: number) => {
    const allWords = getAllWords();
    return allWords.slice(0, wordCount).join(' ');
  };

  const getVisibleTextWithNextWords = () => {
    const allWords = getAllWords();
    const sliderWords = Math.min(sliderValue[0], allWords.length);
    const totalVisible = Math.min(sliderWords + nextWordCount, allWords.length);
    return allWords.slice(0, totalVisible).join(' ');
  };

  const showNextWord = () => {
    const allWords = getAllWords();
    const currentVisible = Math.min(sliderValue[0], allWords.length);
    const maxAdditional = allWords.length - currentVisible;
    
    if (nextWordCount < maxAdditional) {
      setNextWordCount(prev => prev + 1);
    }
  };

  const resetNextWords = () => {
    setNextWordCount(0);
  };

  useEffect(() => {
    generateRandomTest();
  }, [testScope, selectedSurah, selectedJuz, numberOfVerses, memorizedEntries]);

  useEffect(() => {
    setSliderValue([1]);
    setNextWordCount(0);
  }, [currentVerses]);

  useEffect(() => {
    setSliderValue([1]);
    setNextWordCount(0);
  }, [numberOfVerses]);

  const handleCorrect = () => {
    setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    generateRandomTest();
  };

  const handleIncorrect = () => {
    setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    generateRandomTest();
  };

  const getScopeDescription = () => {
    const verseText = numberOfVerses === 1 ? "verse" : "verses";
    switch (testScope) {
      case "memorized":
        const memorizedJuzNumbers = getMemorizedJuzNumbers();
        if (memorizedJuzNumbers.length === 0) {
          return `${numberOfVerses} random ${verseText} from your memorized portion (no entries found - using entire Quran)`;
        }
        return `${numberOfVerses} random ${verseText} from your memorized Juz: ${memorizedJuzNumbers.join(', ')}`;
      case "surah":
        return `${numberOfVerses} random ${verseText} from ${getSurahName(selectedSurah)}`;
      case "juz":
        return `${numberOfVerses} random ${verseText} from Juz ${selectedJuz}`;
      case "entire":
        return `${numberOfVerses} random ${verseText} from the entire Quran`;
    }
  };

  const getPartialText = (text: string) => {
    const words = text.split(' ');
    const halfLength = Math.ceil(words.length / 2);
    return words.slice(0, halfLength).join(' ') + '...';
  };

  const handleNumberOfVersesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      setNumberOfVerses(value);
    }
  };

  if (currentVerses.length === 0) {
    return <div>Loading...</div>;
  }

  const totalWords = getTotalWordCount();
  const visibleWordCount = Math.min(sliderValue[0], totalWords);
  const totalVisibleWithNext = Math.min(visibleWordCount + nextWordCount, totalWords);

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 self-start">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm md:text-base">Back to Tests</span>
        </Button>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs md:text-sm">
            Score: {score.correct}/{score.total}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs md:text-sm"
          >
            <Settings className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={generateRandomTest} className="text-xs md:text-sm">
            <RefreshCw className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
            New Question
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-3 md:p-4 bg-gray-50 border-gray-200">
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
                    <SelectItem value="surah">Within a Surah</SelectItem>
                    <SelectItem value="juz">Within a Juz</SelectItem>
                    <SelectItem value="entire">Entire Quran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="number-of-verses" className="text-xs md:text-sm font-medium text-gray-700">
                  Number of Verses
                </Label>
                <Input
                  id="number-of-verses"
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfVerses}
                  onChange={handleNumberOfVersesChange}
                  className="w-full text-xs md:text-sm"
                />
              </div>

              {testScope === "surah" && (
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
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
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
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
      <Card className="p-4 md:p-6 border-l-4 border-l-purple-500">
        <div className="space-y-4 md:space-y-6">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 break-words">Random Spot Test</h2>
            <p className="text-gray-600 text-xs md:text-sm break-words">{getScopeDescription()}</p>
          </div>

          {/* Question */}
          <div className="bg-purple-50 p-3 md:p-4 rounded-lg border border-purple-200">
            <div className="space-y-3 md:space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs md:text-sm break-words">
                  Starting from: {currentVerses[0].verse_key} - {getSurahName(currentVerses[0].surah)}
                </Badge>
              </div>
              
              {/* Word Progress Slider */}
              {totalWords > 1 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-xs md:text-sm text-gray-600 break-words">
                      Showing {totalVisibleWithNext} of {totalWords} words
                      {nextWordCount > 0 && (
                        <span className="text-blue-600 ml-1">
                          (+{nextWordCount} next {nextWordCount === 1 ? 'word' : 'words'})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="px-2 md:px-4">
                    <Slider
                      value={sliderValue}
                      onValueChange={(value) => {
                        setSliderValue(value);
                        setNextWordCount(0); // Reset next word count when slider changes
                      }}
                      max={totalWords}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              {/* Continue instruction */}
              <div className="space-y-2">
                <div className="text-blue-800 font-medium text-center text-xs md:text-sm break-words">
                  Continue from this point... (recite {numberOfVerses} {numberOfVerses === 1 ? 'verse' : 'verses'})
                </div>
                
                {/* Show progressive text based on slider */}
                <div className="space-y-3">
                  {numberOfVerses === 1 ? (
                    <div className="font-arabic text-lg md:text-xl text-right leading-loose text-gray-800 bg-white p-2 md:p-3 rounded border break-words">
                      {totalWords === 1 ? getPartialText(currentVerses[0].text) : getVisibleTextWithNextWords()}
                    </div>
                  ) : (
                    <div className="font-arabic text-lg md:text-xl text-right leading-loose text-gray-800 bg-white p-2 md:p-3 rounded border break-words">
                      {getVisibleTextWithNextWords()}
                    </div>
                  )}
                </div>

                {/* Next Word Button */}
                {totalWords > 1 && totalVisibleWithNext < totalWords && (
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={showNextWord}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs md:text-sm"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Show Next Word
                    </Button>
                    {nextWordCount > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetNextWords}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs md:text-sm"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAnswer(!showAnswer)}
              className="border-gray-300 text-xs md:text-sm"
            >
              {showAnswer ? "Hide" : "Show"} Answer
            </Button>
            {showAnswer && (
              <>
                <Button 
                  variant="default" 
                  onClick={handleCorrect}
                  className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                >
                  <CheckCircle className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                  I Got It Right
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleIncorrect}
                  className="border-red-300 text-red-700 hover:bg-red-50 text-xs md:text-sm"
                >
                  <XCircle className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                  I Got It Wrong
                </Button>
              </>
            )}
          </div>

          {/* Answer Section */}
          {showAnswer && (
            <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4">
              {currentVerses.map((verse, index) => (
                <div key={verse.id} className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-200">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs md:text-sm break-words">
                      Verse {index + 1}: {verse.verse_key}
                    </Badge>
                    <div className="font-arabic text-lg md:text-2xl text-right leading-loose text-gray-800 break-words">
                      {verse.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
