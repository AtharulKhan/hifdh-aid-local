
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, Play, Settings } from "lucide-react";

// Mock data based on the testing JSON structure provided
const tajweedTestData = {
  tajweed_examples: [
    {
      category_name_en: "Noon & Meem Mushaddad",
      category_name_ar: "النون والميم المشددتين",
      rules: [
        {
          rule_name_en: "Ghunnah on Noon Mushaddad",
          rule_name_ar: "غنة النون المشددة",
          rule_type: "ghunnah",
          description: "A 2-count nasalization (Ghunnah) on a Noon with a shaddah (نّ).",
          examples: [
            {
              arabic_text: "مِنَ الْجِنَّةِ وَالنَّاسِ",
              highlighted_word: "النَّاسِ",
              transliteration: "an-naas",
              rule_trigger: "نّ",
              surah_reference: "An-Nas (114:6)"
            },
            {
              arabic_text: "إِنَّ الَّذِينَ كَفَرُوا",
              highlighted_word: "إِنَّ",
              transliteration: "inna",
              rule_trigger: "نّ",
              surah_reference: "Al-Baqarah (2:6)"
            }
          ]
        },
        {
          rule_name_en: "Ghunnah on Meem Mushaddad",
          rule_name_ar: "غنة الميم المشددة",
          rule_type: "ghunnah",
          description: "A 2-count nasalization (Ghunnah) on a Meem with a shaddah (مّ).",
          examples: [
            {
              arabic_text: "عَمَّ يَتَسَاءَلُونَ",
              highlighted_word: "عَمَّ",
              transliteration: "amma",
              rule_trigger: "مّ",
              surah_reference: "An-Naba (78:1)"
            }
          ]
        }
      ]
    },
    {
      category_name_en: "Rules of Noon Saakinah & Tanween",
      category_name_ar: "أحكام النون الساكنة والتنوين",
      rules: [
        {
          rule_name_en: "Al-Idh'har (The Clarification)",
          rule_name_ar: "الإِظْهَار",
          rule_type: "noon_saakinah_tanween",
          description: "Pronouncing the 'n' sound clearly, without Ghunnah. Occurs before throat letters.",
          examples: [
            {
              arabic_text: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ",
              highlighted_word: "غَاسِقٍ إِذَا",
              transliteration: "ghaasiqin idhaa",
              rule_trigger: "ـٍ followed by ء",
              surah_reference: "Al-Falaq (113:3)"
            }
          ]
        }
      ]
    }
  ]
};

export const TajweedTest = () => {
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isTestActive, setIsTestActive] = useState(false);

  // Generate random questions
  const generateQuestions = (count: number = 10) => {
    const allExamples: any[] = [];
    
    tajweedTestData.tajweed_examples.forEach(category => {
      category.rules.forEach(rule => {
        rule.examples.forEach(example => {
          allExamples.push({
            ...example,
            rule_name_en: rule.rule_name_en,
            rule_name_ar: rule.rule_name_ar,
            rule_description: rule.description,
            category: category.category_name_en
          });
        });
      });
    });

    // Shuffle and take requested count
    const shuffled = allExamples.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  const startTest = () => {
    const questions = generateQuestions(10);
    setCurrentQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setIsTestActive(true);
    setScore({ correct: 0, total: 0 });
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    setShowAnswer(true);
    const isCorrect = selectedAnswer === currentQuestions[currentQuestionIndex].rule_name_en;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setIsTestActive(false);
    }
  };

  const resetTest = () => {
    setIsTestActive(false);
    setCurrentQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore({ correct: 0, total: 0 });
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Generate answer options for current question
  const generateAnswerOptions = (correctAnswer: string) => {
    const allRules = tajweedTestData.tajweed_examples.flatMap(cat => 
      cat.rules.map(rule => rule.rule_name_en)
    );
    const uniqueRules = [...new Set(allRules)];
    const incorrectOptions = uniqueRules.filter(rule => rule !== correctAnswer);
    const shuffledIncorrect = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correctAnswer, ...shuffledIncorrect].sort(() => 0.5 - Math.random());
  };

  if (!isTestActive) {
    return (
      <div className="space-y-6">
        {/* Test Introduction */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-400">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Tajweed Knowledge Test</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Test your understanding of Tajweed rules with interactive examples from the Quran. 
              Identify the correct Tajweed rule being applied in each verse.
            </p>
            
            {score.total > 0 && (
              <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-2">Previous Test Results</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 text-lg px-4 py-2">
                  Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
                </Badge>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={startTest} className="bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Start New Test (10 Questions)
              </Button>
              {score.total > 0 && (
                <Button variant="outline" onClick={resetTest}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Results
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Test Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">📚 Comprehensive Coverage</h4>
            <p className="text-sm text-blue-600">Questions cover all major Tajweed rules and applications</p>
          </Card>
          <Card className="p-4 text-center bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🎯 Interactive Learning</h4>
            <p className="text-sm text-green-600">Real Quranic examples with highlighted rule applications</p>
          </Card>
          <Card className="p-4 text-center bg-orange-50 border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">📊 Instant Feedback</h4>
            <p className="text-sm text-orange-600">Immediate explanations and progress tracking</p>
          </Card>
        </div>
      </div>
    );
  }

  const answerOptions = generateAnswerOptions(currentQuestion.rule_name_en);

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-800">Tajweed Test</h2>
          <p className="text-gray-600">Question {currentQuestionIndex + 1} of {currentQuestions.length}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Score: {score.correct}/{score.total}
          </Badge>
          <Button variant="outline" size="sm" onClick={resetTest}>
            End Test
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 border-l-4 border-l-purple-500">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              What Tajweed rule is being applied in the highlighted word?
            </h3>
            
            {/* Arabic Text with Highlighting */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="space-y-3">
                <p className="text-3xl font-arabic text-gray-800 leading-loose">
                  {currentQuestion.arabic_text.replace(
                    currentQuestion.highlighted_word,
                    `**${currentQuestion.highlighted_word}**`
                  ).split('**').map((part: string, index: number) =>
                    index % 2 === 1 ? (
                      <span key={index} className="bg-yellow-300 px-1 rounded">{part}</span>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
                </p>
                <p className="text-gray-600 italic">{currentQuestion.transliteration}</p>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {currentQuestion.surah_reference}
                </Badge>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Select the correct Tajweed rule:</h4>
            <div className="grid gap-3">
              {answerOptions.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className={`p-4 h-auto text-left justify-start ${
                    selectedAnswer === option ? "bg-purple-600 text-white" : "hover:bg-purple-50"
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showAnswer}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            {!showAnswer ? (
              <Button 
                onClick={checkAnswer}
                disabled={!selectedAnswer}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                onClick={nextQuestion}
                className="bg-green-600 hover:bg-green-700"
              >
                {currentQuestionIndex < currentQuestions.length - 1 ? "Next Question" : "Finish Test"}
              </Button>
            )}
          </div>

          {/* Answer Explanation */}
          {showAnswer && (
            <div className="border-t pt-4 space-y-3">
              <div className={`p-4 rounded-lg ${
                selectedAnswer === currentQuestion.rule_name_en 
                  ? "bg-green-50 border border-green-200" 
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {selectedAnswer === currentQuestion.rule_name_en ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    selectedAnswer === currentQuestion.rule_name_en ? "text-green-800" : "text-red-800"
                  }`}>
                    {selectedAnswer === currentQuestion.rule_name_en ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Correct Answer: {currentQuestion.rule_name_en}</p>
                  <p className="text-sm text-gray-600">{currentQuestion.rule_description}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Rule Trigger:</strong> {currentQuestion.rule_trigger}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
