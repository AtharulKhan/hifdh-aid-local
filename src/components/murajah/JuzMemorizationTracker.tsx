
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Check, Hash } from "lucide-react";
import juzData from "@/data/juz-numbers.json";
import surahNames from "@/data/surah-names.json";

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
}

export const JuzMemorizationTracker = () => {
  const [memorizedJuz, setMemorizedJuz] = useState<JuzMemorization[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedJuz = localStorage.getItem('murajah-juz-memorization');
    if (savedJuz) {
      setMemorizedJuz(JSON.parse(savedJuz));
    }
  }, []);

  // Save to localStorage whenever memorizedJuz change
  useEffect(() => {
    localStorage.setItem('murajah-juz-memorization', JSON.stringify(memorizedJuz));
  }, [memorizedJuz]);

  const toggleMemorization = (juzNumber: number, isMemorized: boolean) => {
    setMemorizedJuz(prev => {
      const existingJuz = prev.find(j => j.juzNumber === juzNumber);
      
      if (existingJuz) {
        return prev.map(juz => 
          juz.juzNumber === juzNumber 
            ? { 
                ...juz, 
                isMemorized,
                dateMemorized: isMemorized ? new Date().toISOString().split('T')[0] : undefined
              }
            : juz
        );
      } else if (isMemorized) {
        return [...prev, {
          juzNumber,
          isMemorized: true,
          dateMemorized: new Date().toISOString().split('T')[0]
        }];
      }
      
      return prev;
    });
  };

  const updatePageRange = (juzNumber: number, startPage?: number, endPage?: number) => {
    setMemorizedJuz(prev => {
      const existingJuz = prev.find(j => j.juzNumber === juzNumber);
      
      if (existingJuz) {
        return prev.map(juz => 
          juz.juzNumber === juzNumber 
            ? { ...juz, startPage, endPage }
            : juz
        );
      } else {
        return [...prev, {
          juzNumber,
          isMemorized: false,
          startPage,
          endPage
        }];
      }
    });
  };

  const getMemorizedCount = () => {
    return memorizedJuz.filter(j => j.isMemorized).length;
  };

  const isJuzMemorized = (juzNumber: number) => {
    const juz = memorizedJuz.find(j => j.juzNumber === juzNumber);
    return juz?.isMemorized || false;
  };

  const getJuzData = (juzNumber: number) => {
    return memorizedJuz.find(j => j.juzNumber === juzNumber);
  };

  const getJuzMemorizationDate = (juzNumber: number) => {
    const juz = memorizedJuz.find(j => j.juzNumber === juzNumber);
    return juz?.dateMemorized;
  };

  const getSurahsInJuz = (juzNumber: number) => {
    const juz = juzData[juzNumber.toString() as keyof typeof juzData];
    if (!juz) return [];

    return Object.entries(juz.verse_mapping).map(([surahId, verses]) => {
      const surah = surahNames[surahId as keyof typeof surahNames];
      return {
        ...surah,
        verses: verses
      };
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{getMemorizedCount()}</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Juz Memorized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">30</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Total Juz</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {Math.round((getMemorizedCount() / 30) * 100)}%
            </div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Juz List */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Hash className="h-4 md:h-5 w-4 md:w-5" />
            Juz Memorization Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            {Object.values(juzData).map((juz) => {
              const isMemorized = isJuzMemorized(juz.juz_number);
              const juzMemData = getJuzData(juz.juz_number);
              const dateMemorized = getJuzMemorizationDate(juz.juz_number);
              const surahsInJuz = getSurahsInJuz(juz.juz_number);
              
              return (
                <div
                  key={juz.juz_number}
                  className="border border-gray-200 rounded-lg p-4 md:p-6 space-y-4"
                >
                  {/* Juz Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isMemorized}
                        onCheckedChange={(checked) => toggleMemorization(juz.juz_number, checked as boolean)}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base md:text-lg">
                            Juz {juz.juz_number}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {juz.verses_count} verses
                          </Badge>
                          {isMemorized && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              Memorized
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 mt-1">
                          {juz.first_verse_key} - {juz.last_verse_key}
                        </div>
                        {dateMemorized && (
                          <div className="text-xs text-gray-500 mt-1">
                            Memorized: {new Date(dateMemorized).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Page Range Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start-page-${juz.juz_number}`} className="text-xs md:text-sm">
                        Start Page
                      </Label>
                      <Input
                        id={`start-page-${juz.juz_number}`}
                        type="number"
                        placeholder="Start page"
                        value={juzMemData?.startPage || ''}
                        onChange={(e) => updatePageRange(
                          juz.juz_number, 
                          e.target.value ? parseInt(e.target.value) : undefined, 
                          juzMemData?.endPage
                        )}
                        className="text-xs md:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-page-${juz.juz_number}`} className="text-xs md:text-sm">
                        End Page
                      </Label>
                      <Input
                        id={`end-page-${juz.juz_number}`}
                        type="number"
                        placeholder="End page"
                        value={juzMemData?.endPage || ''}
                        onChange={(e) => updatePageRange(
                          juz.juz_number, 
                          juzMemData?.startPage, 
                          e.target.value ? parseInt(e.target.value) : undefined
                        )}
                        className="text-xs md:text-sm"
                      />
                    </div>
                  </div>

                  {/* Surahs in this Juz */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm md:text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Surahs in this Juz
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {surahsInJuz.map((surah) => (
                        <Badge key={surah.id} variant="secondary" className="text-xs">
                          {surah.name_simple} ({surah.verses})
                        </Badge>
                      ))}
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
