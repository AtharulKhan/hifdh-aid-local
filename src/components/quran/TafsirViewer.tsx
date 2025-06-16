
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { getVersesArray, getSurahName, getTafsirForVerse } from "@/data/quranData";

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
  const currentTafsir = getTafsirForVerse(currentVerse.surah, currentVerse.ayah);

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
          <TabsList className="grid w-full grid-cols-1 bg-amber-25">
            <TabsTrigger value="ibn-kathir" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
              Ibn Kathir
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ibn-kathir" className="mt-0">
            <ScrollArea className="h-[400px] p-6">
              {currentTafsir ? (
                <div 
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentTafsir.text }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <BookOpen className="h-12 w-12 text-gray-300" />
                  <div>
                    <p className="text-gray-500 font-medium">No commentary available</p>
                    <p className="text-sm text-gray-400">
                      Tafsir for this verse is not yet available in our collection
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Tafsir Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-center space-y-2">
          <h4 className="font-semibold text-blue-700">About Ibn Kathir</h4>
          <p className="text-sm text-blue-600">
            Imam Ibn Kathir (1300-1373 CE) was a renowned Islamic scholar and historian. 
            His tafsir is one of the most respected classical commentaries on the Qur'an, 
            known for its authentic narrations and scholarly approach.
          </p>
        </div>
      </Card>
    </div>
  );
};
