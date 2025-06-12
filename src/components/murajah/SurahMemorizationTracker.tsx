
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check } from "lucide-react";
import surahNames from "@/data/surah-names.json";

interface SurahMemorization {
  surahId: number;
  isMemorized: boolean;
  dateMemorized?: string;
}

export const SurahMemorizationTracker = () => {
  const [memorizedSurahs, setMemorizedSurahs] = useState<SurahMemorization[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedSurahs = localStorage.getItem('murajah-surah-memorization');
    if (savedSurahs) {
      setMemorizedSurahs(JSON.parse(savedSurahs));
    }
  }, []);

  // Save to localStorage whenever memorizedSurahs change
  useEffect(() => {
    localStorage.setItem('murajah-surah-memorization', JSON.stringify(memorizedSurahs));
  }, [memorizedSurahs]);

  const toggleMemorization = (surahId: number, isMemorized: boolean) => {
    setMemorizedSurahs(prev => {
      const existingSurah = prev.find(s => s.surahId === surahId);
      
      if (existingSurah) {
        // Update existing surah
        return prev.map(surah => 
          surah.surahId === surahId 
            ? { 
                ...surah, 
                isMemorized,
                dateMemorized: isMemorized ? new Date().toISOString().split('T')[0] : undefined
              }
            : surah
        );
      } else if (isMemorized) {
        // Add new surah if being marked as memorized
        return [...prev, {
          surahId,
          isMemorized: true,
          dateMemorized: new Date().toISOString().split('T')[0]
        }];
      }
      
      return prev;
    });
  };

  const getMemorizedCount = () => {
    return memorizedSurahs.filter(s => s.isMemorized).length;
  };

  const getSurahData = (surahId: number) => {
    return surahNames[surahId.toString() as keyof typeof surahNames];
  };

  const isSurahMemorized = (surahId: number) => {
    const surah = memorizedSurahs.find(s => s.surahId === surahId);
    return surah?.isMemorized || false;
  };

  const getSurahMemorizationDate = (surahId: number) => {
    const surah = memorizedSurahs.find(s => s.surahId === surahId);
    return surah?.dateMemorized;
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{getMemorizedCount()}</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Surahs Memorized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">114</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Total Surahs</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {Math.round((getMemorizedCount() / 114) * 100)}%
            </div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Surah List */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BookOpen className="h-4 md:h-5 w-4 md:w-5" />
            Surah Memorization Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-3 md:space-y-4">
            {Object.values(surahNames).map((surahData) => {
              const isMemorized = isSurahMemorized(surahData.id);
              const dateMemorized = getSurahMemorizationDate(surahData.id);
              
              return (
                <div
                  key={surahData.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isMemorized}
                      onCheckedChange={(checked) => toggleMemorization(surahData.id, checked as boolean)}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm md:text-base">
                          {surahData.id}. {surahData.name_simple}
                        </span>
                        <span className="text-xs md:text-sm text-gray-600 break-words">
                          {surahData.name_arabic}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {surahData.verses_count} verses
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {surahData.revelation_place}
                        </Badge>
                        {isMemorized && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Memorized
                          </Badge>
                        )}
                      </div>
                      {dateMemorized && (
                        <div className="text-xs text-gray-500 mt-1">
                          Memorized: {new Date(dateMemorized).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
