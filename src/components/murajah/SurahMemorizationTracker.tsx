
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import surahNames from "@/data/surah-names.json";

interface SurahMemorization {
  surahId: number;
  isMemorized: boolean;
  dateMemorized?: string;
}

export const SurahMemorizationTracker = () => {
  const [memorizedSurahs, setMemorizedSurahs] = useState<SurahMemorization[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>("");

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

  const addSurah = () => {
    if (!selectedSurah) return;

    const surahId = parseInt(selectedSurah);
    const existingSurah = memorizedSurahs.find(s => s.surahId === surahId);
    
    if (existingSurah) {
      alert("This surah is already in your list");
      return;
    }

    const newSurah: SurahMemorization = {
      surahId,
      isMemorized: false
    };

    setMemorizedSurahs([...memorizedSurahs, newSurah]);
    setSelectedSurah("");
  };

  const toggleMemorization = (surahId: number, isMemorized: boolean) => {
    setMemorizedSurahs(prev => prev.map(surah => 
      surah.surahId === surahId 
        ? { 
            ...surah, 
            isMemorized,
            dateMemorized: isMemorized ? new Date().toISOString().split('T')[0] : undefined
          }
        : surah
    ));
  };

  const removeSurah = (surahId: number) => {
    setMemorizedSurahs(prev => prev.filter(surah => surah.surahId !== surahId));
  };

  const getMemorizedCount = () => {
    return memorizedSurahs.filter(s => s.isMemorized).length;
  };

  const getSurahData = (surahId: number) => {
    return surahNames[surahId.toString() as keyof typeof surahNames];
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
            <div className="text-xl md:text-2xl font-bold text-blue-600">{memorizedSurahs.length}</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Surahs in Progress</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {memorizedSurahs.length > 0 ? Math.round((getMemorizedCount() / memorizedSurahs.length) * 100) : 0}%
            </div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Surah */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Plus className="h-4 md:h-5 w-4 md:w-5" />
            <span className="break-words">Add Surah to Track</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Select value={selectedSurah} onValueChange={setSelectedSurah}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a Surah" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(surahNames).map((surah) => (
                  <SelectItem key={surah.id} value={surah.id.toString()}>
                    {surah.id}. {surah.name_simple} - {surah.name_arabic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addSurah} disabled={!selectedSurah} className="w-full sm:w-auto text-xs md:text-sm">
              <Plus className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
              Add Surah
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Surah List */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BookOpen className="h-4 md:h-5 w-4 md:w-5" />
            Surah Memorization Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {memorizedSurahs.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-gray-500 text-sm md:text-base">
              No surahs added yet. Add your first surah above to start tracking!
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {memorizedSurahs
                .sort((a, b) => a.surahId - b.surahId)
                .map((surah) => {
                  const surahData = getSurahData(surah.surahId);
                  return (
                    <div
                      key={surah.surahId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={surah.isMemorized}
                          onCheckedChange={(checked) => toggleMemorization(surah.surahId, checked as boolean)}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm md:text-base">
                              {surahData?.id}. {surahData?.name_simple}
                            </span>
                            <span className="text-xs md:text-sm text-gray-600 break-words">
                              {surahData?.name_arabic}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {surahData?.verses_count} verses
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {surahData?.revelation_place}
                            </Badge>
                            {surah.isMemorized && (
                              <Badge variant="default" className="text-xs bg-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                Memorized
                              </Badge>
                            )}
                          </div>
                          {surah.dateMemorized && (
                            <div className="text-xs text-gray-500 mt-1">
                              Memorized: {new Date(surah.dateMemorized).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSurah(surah.surahId)}
                        className="text-xs self-start sm:self-center"
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
