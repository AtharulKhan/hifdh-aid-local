import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, BookOpen, Eye, Search } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getVersesArray, getSurahName, getTafsirForVerse } from "@/data/quranData";
import { TafsirViewer } from "./TafsirViewer";

interface QuranPageViewerDesktopProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  mode: 'review' | 'study';
}

export const QuranPageViewerDesktop: React.FC<QuranPageViewerDesktopProps> = ({ 
  currentPage, 
  onPageChange,
  mode 
}) => {
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTajweed, setShowTajweed] = useState(false);
  
  const handleVerseClick = (verseId: number) => {
    setSelectedVerseId(verseId === selectedVerseId ? null : verseId);
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const toggleTajweed = () => {
    setShowTajweed(!showTajweed);
  };

  if (mode === 'study') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <div className="p-6 border-b bg-white/70 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Study Mode
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-600">
                Page {currentPage}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="border-green-200 text-green-600 hover:bg-green-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600 px-3">
                Page {currentPage} of 604
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(604, currentPage + 1))}
                disabled={currentPage >= 604}
                className="border-green-200 text-green-600 hover:bg-green-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Interactive Qur'an Study
          </h2>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Tabs defaultValue="reading" className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="reading" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Reading</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="tafsir" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Tafsir</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reading" className="h-full">
              <Card className="h-full border-green-200">
                <div className="p-4 bg-green-50 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-green-700">Qur'an Page {currentPage}</h3>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant={showTranslation ? "default" : "outline"}
                        onClick={toggleTranslation}
                        className={showTranslation ? "bg-green-600" : "text-green-600"}
                      >
                        Translation
                      </Button>
                      <Button 
                        size="sm" 
                        variant={showTajweed ? "default" : "outline"}
                        onClick={toggleTajweed}
                        className={showTajweed ? "bg-green-600" : "text-green-600"}
                      >
                        Tajweed
                      </Button>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100%-60px)] p-6">
                  <div className="space-y-8">
                    {/* This would be replaced with actual Quran page content */}
                    <div className="text-center">
                      <p className="font-arabic text-3xl leading-loose text-gray-800 mb-4">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                      {showTranslation && (
                        <p className="text-gray-600 italic">
                          In the name of Allah, the Entirely Merciful, the Especially Merciful.
                        </p>
                      )}
                    </div>
                    
                    {/* Sample verses - would be dynamically generated */}
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div 
                        key={num}
                        className={`p-4 rounded-lg transition-colors ${
                          selectedVerseId === num ? 'bg-green-100' : 'hover:bg-green-50'
                        }`}
                        onClick={() => handleVerseClick(num)}
                      >
                        <div className="flex items-start">
                          <Badge className="mt-1 bg-green-100 text-green-700 mr-3">
                            {num}
                          </Badge>
                          <div>
                            <p className="font-arabic text-2xl leading-loose text-gray-800 mb-2">
                              {showTajweed ? (
                                <span className="text-tajweed">
                                  وَإِذَا قِيلَ لَهُمْ آمِنُوا كَمَا آمَنَ النَّاسُ
                                </span>
                              ) : (
                                "وَإِذَا قِيلَ لَهُمْ آمِنُوا كَمَا آمَنَ النَّاسُ"
                              )}
                            </p>
                            {showTranslation && (
                              <p className="text-gray-600">
                                And when it is said to them, "Believe as the people have believed,"
                                they say, "Should we believe as the foolish have believed?"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="h-full">
              <Card className="h-full border-blue-200">
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <h3 className="font-semibold text-blue-700">
                    Linguistic Analysis
                  </h3>
                </div>
                
                <ScrollArea className="h-[calc(100%-60px)] p-6">
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-700 mb-2">Word-by-Word Analysis</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {['وَإِذَا', 'قِيلَ', 'لَهُمْ'].map((word, i) => (
                          <div key={i} className="text-center p-3 border rounded-md border-blue-100">
                            <p className="font-arabic text-xl mb-1">{word}</p>
                            <p className="text-xs text-gray-500">And when</p>
                            <p className="text-xs text-blue-600">Conjunction + Adverb</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-700 mb-2">Grammatical Structure</h4>
                      <p className="text-sm text-gray-600">
                        This verse begins with a conditional clause (وَإِذَا) followed by a passive verb (قِيلَ).
                        The structure emphasizes the response of the disbelievers to the call to faith.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-700 mb-2">Rhetorical Devices</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                        <li>Contrast between belief and disbelief</li>
                        <li>Irony in the disbelievers' response</li>
                        <li>Rhetorical question used to express disdain</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="tafsir" className="h-full">
              <TafsirViewer startingVerseId={getFirstVerseOfPage(currentPage)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Review Mode
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="p-6 border-b bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              Review Mode
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-600">
              Page {currentPage}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="border-amber-200 text-amber-600 hover:bg-amber-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600 px-3">
              Page {currentPage} of 604
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(604, currentPage + 1))}
              disabled={currentPage >= 604}
              className="border-amber-200 text-amber-600 hover:bg-amber-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Qur'an Review Session
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Card className="h-full border-amber-200">
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-amber-700">Qur'an Page {currentPage}</h3>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant={showTranslation ? "default" : "outline"}
                  onClick={toggleTranslation}
                  className={showTranslation ? "bg-amber-600" : "text-amber-600"}
                >
                  Translation
                </Button>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100%-60px)] p-6">
            <div className="space-y-8">
              {/* This would be replaced with actual Quran page content */}
              <div className="text-center">
                <p className="font-arabic text-3xl leading-loose text-gray-800 mb-4">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                {showTranslation && (
                  <p className="text-gray-600 italic">
                    In the name of Allah, the Entirely Merciful, the Especially Merciful.
                  </p>
                )}
              </div>
              
              {/* Sample verses - would be dynamically generated */}
              {[1, 2, 3, 4, 5].map((num) => (
                <div 
                  key={num}
                  className={`p-4 rounded-lg transition-colors ${
                    selectedVerseId === num ? 'bg-amber-100' : 'hover:bg-amber-50'
                  }`}
                  onClick={() => handleVerseClick(num)}
                >
                  <div className="flex items-start">
                    <Badge className="mt-1 bg-amber-100 text-amber-700 mr-3">
                      {num}
                    </Badge>
                    <div>
                      <p className="font-arabic text-2xl leading-loose text-gray-800 mb-2">
                        وَإِذَا قِيلَ لَهُمْ آمِنُوا كَمَا آمَنَ النَّاسُ
                      </p>
                      {showTranslation && (
                        <p className="text-gray-600">
                          And when it is said to them, "Believe as the people have believed,"
                          they say, "Should we believe as the foolish have believed?"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get first verse of a page (simplified for now)
const getFirstVerseOfPage = (pageNumber: number): number => {
  // This is a simplified calculation - in a real implementation, 
  // you'd have a proper page-to-verse mapping
  return ((pageNumber - 1) * 15) + 1;
};
