
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check } from "lucide-react";
import surahNames from "@/data/surah-names.json";
import juzData from "@/data/juz-numbers.json"; // Added import

// Interface for the unified Juz memorization data structure
interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
  memorizedSurahs?: number[]; // Array of surah IDs that are memorized within this juz
}

export const SurahMemorizationTracker = () => {
  const [juzMemorizationData, setJuzMemorizationData] = useState<JuzMemorization[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedJuzData = localStorage.getItem('murajah-juz-memorization');
    if (savedJuzData) {
      setJuzMemorizationData(JSON.parse(savedJuzData));
    }
  }, []);

  const findJuzNumberOfSurah = (surahId: number): number | undefined => {
    for (const juz in juzData) {
      const juzInfo = juzData[juz as keyof typeof juzData];
      if (Object.keys(juzInfo.verse_mapping).map(Number).includes(surahId)) {
        return juzInfo.juz_number;
      }
    }
    return undefined;
  };

  const toggleMemorization = (surahId: number, isMemorizedCurrently: boolean) => {
    const rawJuzData = localStorage.getItem('murajah-juz-memorization');
    let currentJuzData: JuzMemorization[] = rawJuzData ? JSON.parse(rawJuzData) : [];

    const juzNumberOfSurah = findJuzNumberOfSurah(surahId);
    if (juzNumberOfSurah === undefined) {
      console.error(`Could not find Juz for Surah ID: ${surahId}`);
      return;
    }

    const existingJuzIndex = currentJuzData.findIndex(j => j.juzNumber === juzNumberOfSurah);

    if (existingJuzIndex !== -1) {
      currentJuzData = currentJuzData.map((juz, index) => {
        if (index === existingJuzIndex) {
          let updatedSurahs = juz.memorizedSurahs || [];
          if (isMemorizedCurrently) {
            if (!updatedSurahs.includes(surahId)) {
              updatedSurahs = [...updatedSurahs, surahId];
            }
          } else {
            updatedSurahs = updatedSurahs.filter(id => id !== surahId);
          }
          return {
            ...juz,
            memorizedSurahs: updatedSurahs.length > 0 ? updatedSurahs : undefined,
            isMemorized: false, // Individual surah change implies Juz is not fully memorized
          };
        }
        return juz;
      });
    } else if (isMemorizedCurrently) {
      // New Juz entry because it didn't exist and a surah is being marked
      currentJuzData.push({
        juzNumber: juzNumberOfSurah,
        isMemorized: false,
        memorizedSurahs: [surahId],
      });
    }
    // If !isMemorizedCurrently and no existingJuzIndex, nothing to do.

    localStorage.setItem('murajah-juz-memorization', JSON.stringify(currentJuzData));
    setJuzMemorizationData(currentJuzData);
  };

  const getMemorizedCount = () => {
    let count = 0;
    const allMemorizedSurahIds = new Set<number>();

    juzMemorizationData.forEach(juz => {
      if (juz.isMemorized) {
        const surahsInThisJuz = juzData[juz.juzNumber.toString() as keyof typeof juzData];
        if (surahsInThisJuz) {
          Object.keys(surahsInThisJuz.verse_mapping).forEach(surahIdStr => {
            allMemorizedSurahIds.add(Number(surahIdStr));
          });
        }
      } else if (juz.memorizedSurahs) {
        juz.memorizedSurahs.forEach(surahId => {
          allMemorizedSurahIds.add(surahId);
        });
      }
    });
    return allMemorizedSurahIds.size;
  };

  const getSurahData = (surahId: number) => {
    return surahNames[surahId.toString() as keyof typeof surahNames];
  };

  const isSurahMemorized = (surahId: number): boolean => {
    const juzNumberOfSurah = findJuzNumberOfSurah(surahId);
    if (juzNumberOfSurah === undefined) return false;

    const juz = juzMemorizationData.find(j => j.juzNumber === juzNumberOfSurah);
    if (!juz) return false;

    if (juz.isMemorized) return true; // If full Juz is memorized
    return juz.memorizedSurahs?.includes(surahId) || false;
  };

  const getSurahMemorizationDate = (surahId: number): string | undefined => {
    const juzNumberOfSurah = findJuzNumberOfSurah(surahId);
    if (juzNumberOfSurah === undefined) return undefined;

    const juz = juzMemorizationData.find(j => j.juzNumber === juzNumberOfSurah);
    // Only return date if the whole Juz is memorized, as per requirement.
    // Individual surah dates are not tracked in this component with the new model.
    if (juz?.isMemorized) {
      return juz.dateMemorized;
    }
    return undefined;
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
