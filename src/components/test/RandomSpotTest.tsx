import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Settings } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse, surahNamesData, getJuzInfo } from "@/data/quranData";

interface RandomSpotTestProps {
  onBack: () => void;
}

type TestScope = "surah" | "juz" | "entire";

export const RandomSpotTest: React.FC<RandomSpotTestProps> = ({ onBack }) => {
  const [testScope, setTestScope] = useState<TestScope>("surah");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [numberOfVerses, setNumberOfVerses] = useState<number>(1);
  const [currentVerses, setCurrentVerses] = useState<QuranVerse[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [sliderValue, setSliderValue] = useState<number[]>([1]);

  const allVerses = getVersesArray();
  const surahNumbers = Object.keys(surahNamesData).map(Number).sort((a, b) => a - b);

  const generateRandomTest = () => {
    let eligibleVerses: QuranVerse[] = [];

    switch (testScope) {
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
    }
  };

  useEffect(() => {
    generateRandomTest();
  }, [testScope, selectedSurah, selectedJuz, numberOfVerses]);

  useEffect(() => {
    setSliderValue([1]);
  }, [currentVerses]);

  useEffect(() => {
    setSliderValue([1]);
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

  const visibleVerses = Math.min(sliderValue[0], currentVerses.length);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tests</span>
        </Button>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Test Scope</label>
                <Select value={testScope} onValueChange={(value: TestScope) => setTestScope(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surah">Within a Surah</SelectItem>
                    <SelectItem value="juz">Within a Juz</SelectItem>
                    <SelectItem value="entire">Entire Quran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="number-of-verses" className="text-sm font-medium text-gray-700">
                  Number of Verses
                </Label>
                <Input
                  id="number-of-verses"
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfVerses}
                  onChange={handleNumberOfVersesChange}
                  className="w-full"
                />
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
      <Card className="p-6 border-l-4 border-l-purple-500">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Random Spot Test</h2>
            <p className="text-gray-600">{getScopeDescription()}</p>
          </div>

          {/* Question */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Starting from: {currentVerses[0].verse_key} - {getSurahName(currentVerses[0].surah)}
                </Badge>
              </div>
              
              {/* Verse Progress Slider */}
              {numberOfVerses > 1 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Showing {visibleVerses} of {numberOfVerses} verses
                    </span>
                  </div>
                  <div className="px-4">
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={numberOfVerses}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              {/* Continue instruction */}
              <div className="space-y-2">
                <div className="text-blue-800 font-medium text-center">
                  Continue from this point... (recite {numberOfVerses} {numberOfVerses === 1 ? 'verse' : 'verses'})
                </div>
                
                {/* Show verses based on slider or single verse */}
                <div className="space-y-3">
                  {numberOfVerses === 1 ? (
                    <div className="font-arabic text-xl text-right leading-loose text-gray-800 bg-white p-3 rounded border">
                      {getPartialText(currentVerses[0].text)}
                    </div>
                  ) : (
                    <>
                      {/* First verse partial */}
                      <div className="font-arabic text-xl text-right leading-loose text-gray-800 bg-white p-3 rounded border">
                        {getPartialText(currentVerses[0].text)}
                      </div>
                      
                      {/* Additional verses revealed by slider */}
                      {currentVerses.slice(1, visibleVerses).map((verse, index) => (
                        <div key={verse.id} className="space-y-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            Verse {index + 2}: {verse.verse_key}
                          </Badge>
                          <div className="font-arabic text-xl text-right leading-loose text-gray-800 bg-white p-3 rounded border">
                            {verse.text}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
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
              {currentVerses.map((verse, index) => (
                <div key={verse.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Verse {index + 1}: {verse.verse_key}
                    </Badge>
                    <div className="font-arabic text-2xl text-right leading-loose text-gray-800">
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
