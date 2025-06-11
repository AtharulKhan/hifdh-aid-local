
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { getVersesArray, getSurahName, QuranVerse, surahNamesData } from "@/data/quranData";

interface FirstVerseTestProps {
  onBack: () => void;
}

export const FirstVerseTest: React.FC<FirstVerseTestProps> = ({ onBack }) => {
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [firstVerse, setFirstVerse] = useState<QuranVerse | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const allVerses = getVersesArray();
  const surahNumbers = Object.keys(surahNamesData).map(Number).sort((a, b) => a - b);

  const generateRandomTest = () => {
    // Get a random surah
    const randomSurah = surahNumbers[Math.floor(Math.random() * surahNumbers.length)];
    const firstVerseOfSurah = allVerses.find(verse => verse.surah === randomSurah && verse.ayah === 1);
    
    if (firstVerseOfSurah) {
      setCurrentSurah(randomSurah);
      setFirstVerse(firstVerseOfSurah);
      setShowAnswer(false);
    }
  };

  useEffect(() => {
    generateRandomTest();
  }, []);

  const handleCorrect = () => {
    setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    generateRandomTest();
  };

  const handleIncorrect = () => {
    setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    generateRandomTest();
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
          <Button variant="outline" size="sm" onClick={generateRandomTest}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Question
          </Button>
        </div>
      </div>

      {/* Test Card */}
      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">First Verse Test</h2>
            <p className="text-gray-600">
              Recite the first verse of the given Surah
            </p>
          </div>

          {/* Surah Name */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-lg px-4 py-2">
                Surah #{currentSurah}
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
