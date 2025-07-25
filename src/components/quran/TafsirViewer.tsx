

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { getVersesArray, getSurahName, getTafsirIbnKathirForVerse, getTafsirMaarifForVerse, getTranslationForVerse } from "@/data/quranData";
import { PersonalNotes } from "./PersonalNotes";

interface TafsirViewerProps {
  startingVerseId?: number;
}

export const TafsirViewer: React.FC<TafsirViewerProps> = ({ startingVerseId = 1 }) => {
  const allVerses = getVersesArray();
  const [currentVerseIndex, setCurrentVerseIndex] = useState(() => {
    const index = allVerses.findIndex(verse => verse.id === startingVerseId);
    return index >= 0 ? index : 0;
  });

  const currentVerse = allVerses[currentVerseIndex];
  const currentTafsirIbnKathir = getTafsirIbnKathirForVerse(currentVerse.surah, currentVerse.ayah);
  const currentTafsirMaarif = getTafsirMaarifForVerse(currentVerse.surah, currentVerse.ayah);
  const currentTranslation = getTranslationForVerse(currentVerse.surah, currentVerse.ayah);

  const goToNextVerse = () => {
    if (currentVerseIndex < allVerses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    }
  };

  const goToPreviousVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
    }
  };

  const handleVerseSliderChange = (value: number[]) => {
    setCurrentVerseIndex(value[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          Tafsir Commentary
        </h2>
        <p className="text-gray-600">
          Classical commentary on the Holy Qur'an
        </p>
      </div>

      {/* Verse Navigation Slider */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Navigate to Verse:</span>
            <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
              {currentVerseIndex + 1} of {allVerses.length}
            </span>
          </div>
          <Slider 
            value={[currentVerseIndex]} 
            onValueChange={handleVerseSliderChange} 
            max={allVerses.length - 1} 
            min={0} 
            step={1} 
            className="w-full" 
          />
          <div className="flex justify-between text-xs text-blue-400">
            <span>1:1</span>
            <span>{allVerses[allVerses.length - 1]?.surah}:{allVerses[allVerses.length - 1]?.ayah}</span>
          </div>
        </div>
      </Card>

      {/* Current Verse Info */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {getSurahName(currentVerse.surah)}
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-600">
              Verse {currentVerse.surah}:{currentVerse.ayah}
            </Badge>
          </div>
          
          {/* Arabic Text */}
          <div className="text-center">
            <p className="font-arabic text-2xl leading-loose text-gray-800 mb-4">
              {currentVerse.text}
            </p>
            
            {/* Translation Display */}
            {currentTranslation && (
              <div className="text-center text-gray-600 text-lg leading-relaxed italic mb-4">
                {currentTranslation}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousVerse}
              disabled={currentVerseIndex <= 0}
              className="border-green-200 text-green-600 hover:bg-green-100"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm text-green-600">
              {currentVerseIndex + 1} of {allVerses.length}
            </span>
            
            <Button
              variant="outline"
              onClick={goToNextVerse}
              disabled={currentVerseIndex >= allVerses.length - 1}
              className="border-green-200 text-green-600 hover:bg-green-100"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tafsir Content with Tabs */}
      <Card className="border-amber-200">
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-700">
              Commentary for Verse {currentVerse.surah}:{currentVerse.ayah}
            </h3>
          </div>
        </div>
        
        <Tabs defaultValue="ibn-kathir" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-amber-25">
            <TabsTrigger value="ibn-kathir" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
              Ibn Kathir
            </TabsTrigger>
            <TabsTrigger value="maarif-ul-quran" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
              Maarif-ul-Qur'an
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ibn-kathir" className="mt-0">
            <ScrollArea className="h-[400px] p-6">
              {currentTafsirIbnKathir ? (
                <div 
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentTafsirIbnKathir.text }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <BookOpen className="h-12 w-12 text-gray-300" />
                  <div>
                    <p className="text-gray-500 font-medium">No commentary available</p>
                    <p className="text-sm text-gray-400">
                      Ibn Kathir tafsir for this verse is not yet available in our collection
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="maarif-ul-quran" className="mt-0">
            <ScrollArea className="h-[400px] p-6">
              {currentTafsirMaarif ? (
                <div 
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentTafsirMaarif.text }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <BookOpen className="h-12 w-12 text-gray-300" />
                  <div>
                    <p className="text-gray-500 font-medium">No commentary available</p>
                    <p className="text-sm text-gray-400">
                      Maarif-ul-Qur'an tafsir for this verse is not yet available in our collection
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Personal Notes for Current Verse */}
      <PersonalNotes 
        surahNumber={currentVerse.surah} 
        verseNumber={currentVerse.ayah} 
      />

      {/* Tafsir Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-center space-y-2">
          <h4 className="font-semibold text-blue-700">About the Commentaries</h4>
          <div className="text-sm text-blue-600 space-y-2">
            <p>
              <strong>Ibn Kathir (1300-1373 CE):</strong> Renowned Islamic scholar and historian. 
              His tafsir is one of the most respected classical commentaries on the Qur'an, 
              known for its authentic narrations and scholarly approach.
            </p>
            <p>
              <strong>Maarif-ul-Qur'an:</strong> A comprehensive commentary by Mufti Muhammad Shafi,
              providing detailed explanations with practical applications and contemporary relevance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

