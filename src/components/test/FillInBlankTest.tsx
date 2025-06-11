
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { getVersesArray, getSurahName, QuranVerse } from "@/data/quranData";

interface FillInBlankTestProps {
  onBack: () => void;
}

interface BlankWord {
  index: number;
  word: string;
}

export const FillInBlankTest: React.FC<FillInBlankTestProps> = ({ onBack }) => {
  const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
  const [blankedWords, setBlankedWords] = useState<BlankWord[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const allVerses = getVersesArray();

  const generateRandomTest = () => {
    // Get a random verse
    const randomVerse = allVerses[Math.floor(Math.random() * allVerses.length)];
    const words = randomVerse.text.split(' ');
    
    // Select 1-2 random words to blank out (avoid very short words)
    const eligibleWords = words
      .map((word, index) => ({ word, index }))
      .filter(item => item.word.length > 2); // Only blank words longer than 2 characters
    
    const numBlanks = Math.min(Math.floor(Math.random() * 2) + 1, eligibleWords.length); // 1 or 2 blanks
    const selectedBlanks: BlankWord[] = [];
    
    for (let i = 0; i < numBlanks; i++) {
      const remainingWords = eligibleWords.filter(
        word => !selectedBlanks.some(blank => blank.index === word.index)
      );
      if (remainingWords.length > 0) {
        const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        selectedBlanks.push(randomWord);
      }
    }

    setCurrentVerse(randomVerse);
    setBlankedWords(selectedBlanks.sort((a, b) => a.index - b.index));
    setUserAnswers({});
    setShowAnswer(false);
  };

  useEffect(() => {
    generateRandomTest();
  }, []);

  const handleAnswerChange = (blankIndex: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [blankIndex]: value
    }));
  };

  const checkAnswers = () => {
    const allCorrect = blankedWords.every(blank => {
      const userAnswer = userAnswers[blank.index]?.trim().toLowerCase();
      const correctAnswer = blank.word.trim().toLowerCase();
      return userAnswer === correctAnswer;
    });

    if (allCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    }
    
    generateRandomTest();
  };

  const renderVerseWithBlanks = () => {
    if (!currentVerse) return null;

    const words = currentVerse.text.split(' ');
    
    return (
      <div className="font-arabic text-2xl text-right leading-loose text-gray-800 space-y-2">
        {words.map((word, index) => {
          const blankWord = blankedWords.find(blank => blank.index === index);
          
          if (blankWord) {
            return (
              <span key={index} className="inline-block mx-1">
                <Input
                  value={userAnswers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="w-24 h-8 text-center text-sm border-2 border-orange-300 focus:border-orange-500"
                  placeholder="___"
                  disabled={showAnswer}
                />
              </span>
            );
          }
          
          return <span key={index} className="mx-1">{word}</span>;
        })}
      </div>
    );
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
          <Button variant="outline" size="sm" onClick={generateRandomTest}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Question
          </Button>
        </div>
      </div>

      {/* Test Card */}
      <Card className="p-6 border-l-4 border-l-orange-500">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Fill in the Blank</h2>
            <p className="text-gray-600">
              Complete the verse by filling in the missing words
            </p>
          </div>

          {/* Verse Info */}
          <div className="text-center">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {currentVerse.verse_key} - {getSurahName(currentVerse.surah)}
            </Badge>
          </div>

          {/* Verse with Blanks */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            {renderVerseWithBlanks()}
          </div>

          {/* Instructions */}
          <div className="text-center bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 text-sm">
              Fill in the blanks with the correct Arabic words, then check your answer
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
            {!showAnswer && (
              <Button 
                variant="default" 
                onClick={checkAnswers}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!Object.keys(userAnswers).length}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Answer
              </Button>
            )}
            {showAnswer && (
              <Button 
                variant="outline" 
                onClick={generateRandomTest}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Next Question
              </Button>
            )}
          </div>

          {/* Answer Section */}
          {showAnswer && (
            <div className="space-y-4 border-t pt-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="space-y-3">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Complete Verse
                  </Badge>
                  <div className="font-arabic text-2xl text-right leading-loose text-gray-800">
                    {currentVerse.text}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Missing words:</strong>{' '}
                    {blankedWords.map(blank => blank.word).join(', ')}
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
