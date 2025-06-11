
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { getVersesArray, getVerseById, getSurahName, QuranVerse } from "@/data/quranData";

interface BeforeAfterTestProps {
  onBack: () => void;
}

export const BeforeAfterTest: React.FC<BeforeAfterTestProps> = ({ onBack }) => {
  const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
  const [beforeVerse, setBeforeVerse] = useState<QuranVerse | null>(null);
  const [afterVerse, setAfterVerse] = useState<QuranVerse | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const allVerses = getVersesArray();

  const generateRandomTest = () => {
    // Get a random verse that has both before and after verses
    const validVerses = allVerses.filter((verse, index) => 
      index > 0 && index < allVerses.length - 1
    );
    
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
  }, []);

  const handleCorrect = () => {
    setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    generateRandomTest();
  };

  const handleIncorrect = () => {
    setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    generateRandomTest();
  };

  if (!currentVerse || !beforeVerse || !afterVerse) {
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
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Score: {score.correct}/{score.total}
          </Badge>
          <Button variant="outline" size="sm" onClick={generateRandomTest}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Question
          </Button>
        </div>
      </div>

      {/* Test Card */}
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Before & After Test</h2>
            <p className="text-gray-600">
              Recite the verse before and after the given verse
            </p>
          </div>

          {/* Current Verse */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Given Verse: {currentVerse.verse_key} - {getSurahName(currentVerse.surah)}
              </Badge>
              <div className="font-arabic text-2xl text-right leading-loose text-gray-800">
                {currentVerse.text}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              Now recite the verse BEFORE and the verse AFTER this one
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
              {/* Before Verse */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Before: {beforeVerse.verse_key}
                  </Badge>
                  <div className="font-arabic text-xl text-right leading-loose text-gray-800">
                    {beforeVerse.text}
                  </div>
                </div>
              </div>

              {/* After Verse */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    After: {afterVerse.verse_key}
                  </Badge>
                  <div className="font-arabic text-xl text-right leading-loose text-gray-800">
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
