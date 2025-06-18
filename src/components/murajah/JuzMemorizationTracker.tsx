import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Check, Hash, Search } from "lucide-react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import juzData from "@/data/juz-numbers.json";
import surahNames from "@/data/surah-names.json";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
  memorizedSurahs?: number[]; // Array of surah IDs that are memorized within this juz
}

export const JuzMemorizationTracker = () => {
  const [memorizedJuz, setMemorizedJuz] = useState<JuzMemorization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedJuz = localStorage.getItem('murajah-juz-memorization');
    if (savedJuz) {
      setMemorizedJuz(JSON.parse(savedJuz));
    }
  }, []);

  // Helper function to update memorization planner data
  const updateMemorizationPlannerData = (juzData: JuzMemorization[]) => {
    const memorizedJuzNumbers = juzData
      .filter(j => j.isMemorized)
      .map(j => j.juzNumber);
    
    const memorizedSurahIds = new Set<number>();
    
    // Add surahs from fully memorized juz
    memorizedJuzNumbers.forEach(juzNumber => {
      const juz = juzData.find(j => j.juzNumber === juzNumber);
      if (juz?.isMemorized) {
        const juzInfo = juzData[juzNumber.toString() as keyof typeof juzData];
        if (juzInfo) {
          Object.keys(juzInfo.verse_mapping).forEach(surahId => {
            memorizedSurahIds.add(Number(surahId));
          });
        }
      }
    });
    
    // Add individually memorized surahs
    juzData.forEach(juz => {
      if (juz.memorizedSurahs) {
        juz.memorizedSurahs.forEach(surahId => {
          memorizedSurahIds.add(surahId);
        });
      }
    });
    
    const plannerData = {
      juz: memorizedJuzNumbers,
      surahs: Array.from(memorizedSurahIds)
    };
    
    localStorage.setItem('memorizationPlannerAlreadyMemorized', JSON.stringify(plannerData));
  };

  useEffect(() => {
    localStorage.setItem('murajah-juz-memorization', JSON.stringify(memorizedJuz));
    
    // Update memorization planner data format
    updateMemorizationPlannerData(memorizedJuz);
    
    if (user && memorizedJuz.length > 0) {
      syncToSupabase();
    }
  }, [memorizedJuz, user]);

  const syncToSupabase = async () => {
    if (!user) return;

    try {
      for (const juz of memorizedJuz) {
        await supabase
          .from('juz_memorization')
          .upsert({
            user_id: user.id,
            juz_number: juz.juzNumber,
            is_memorized: juz.isMemorized,
            date_memorized: juz.dateMemorized,
            start_page: juz.startPage,
            end_page: juz.endPage,
            memorized_surahs: juz.memorizedSurahs
          });
      }
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  };

  const toggleMemorization = (juzNumber: number, isMemorized: boolean) => {
    setMemorizedJuz(prev => {
      const existingJuz = prev.find(j => j.juzNumber === juzNumber);
      
      if (existingJuz) {
        return prev.map(juz => 
          juz.juzNumber === juzNumber 
            ? { 
                ...juz, 
                isMemorized,
                dateMemorized: isMemorized ? new Date().toISOString().split('T')[0] : undefined,
                memorizedSurahs: isMemorized ? undefined : juz.memorizedSurahs
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

  const toggleSurahMemorization = (juzNumber: number, surahId: number, isMemorized: boolean) => {
    setMemorizedJuz(prev => {
      const existingJuz = prev.find(j => j.juzNumber === juzNumber);
      
      if (existingJuz) {
        return prev.map(juz => {
          if (juz.juzNumber === juzNumber) {
            const currentSurahs = juz.memorizedSurahs || [];
            let newSurahs: number[];
            
            if (isMemorized) {
              newSurahs = [...currentSurahs, surahId];
            } else {
              newSurahs = currentSurahs.filter(id => id !== surahId);
            }
            
            return {
              ...juz,
              memorizedSurahs: newSurahs.length > 0 ? newSurahs : undefined,
              isMemorized: false
            };
          }
          return juz;
        });
      } else if (isMemorized) {
        return [...prev, {
          juzNumber,
          isMemorized: false,
          memorizedSurahs: [surahId]
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

  const getMemorizedSurahCount = () => {
    const memorizedJuzNumbers = memorizedJuz
      .filter(j => j.isMemorized)
      .map(j => j.juzNumber);
    
    const memorizedSurahs = new Set<string>();
    
    memorizedJuzNumbers.forEach(juzNumber => {
      const juz = juzData[juzNumber.toString() as keyof typeof juzData];
      if (juz) {
        Object.keys(juz.verse_mapping).forEach(surahId => {
          memorizedSurahs.add(surahId);
        });
      }
    });
    
    memorizedJuz.forEach(juz => {
      if (juz.memorizedSurahs) {
        juz.memorizedSurahs.forEach(surahId => {
          memorizedSurahs.add(surahId.toString());
        });
      }
    });
    
    return memorizedSurahs.size;
  };

  const isJuzMemorized = (juzNumber: number) => {
    const juz = memorizedJuz.find(j => j.juzNumber === juzNumber);
    return juz?.isMemorized || false;
  };

  const isSurahMemorizedInJuz = (juzNumber: number, surahId: number) => {
    const juz = memorizedJuz.find(j => j.juzNumber === juzNumber);
    if (juz?.isMemorized) return true;
    return juz?.memorizedSurahs?.includes(surahId) || false;
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

  // Filter juz based on search term
  const filteredJuzData = useMemo(() => {
    if (!searchTerm.trim()) {
      return Object.values(juzData);
    }

    const searchLower = searchTerm.toLowerCase();
    
    return Object.values(juzData).filter((juz) => {
      // Search by Juz number
      if (juz.juz_number.toString().includes(searchLower)) {
        return true;
      }

      // Search by Surah names in this Juz
      const surahsInJuz = getSurahsInJuz(juz.juz_number);
      return surahsInJuz.some(surah => 
        surah.name_simple.toLowerCase().includes(searchLower) ||
        surah.name_arabic.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{getMemorizedCount()}</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Juz Memorized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{getMemorizedSurahCount()}</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Surahs Memorized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">30</div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Total Juz</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {Math.round((getMemorizedCount() / 30) * 100)}%
            </div>
            <div className="text-xs md:text-sm text-gray-600 break-words">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by Juz number or Surah name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Juz List */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Hash className="h-4 md:h-5 w-4 md:w-5" />
            Juz Memorization Progress
            {searchTerm && (
              <Badge variant="outline" className="text-xs">
                {filteredJuzData.length} results
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <ExpandableSection 
            initialHeight="400px"
            title={null}
          >
            <div className="space-y-4 md:space-y-6">
              {filteredJuzData.map((juz) => {
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
                        {surahsInJuz.map((surah) => {
                          const isSurahMemorized = isSurahMemorizedInJuz(juz.juz_number, surah.id);
                          return (
                            <div key={surah.id} className="flex items-center gap-1">
                              <Checkbox
                                checked={isSurahMemorized}
                                onCheckedChange={(checked) => toggleSurahMemorization(juz.juz_number, surah.id, checked as boolean)}
                                className="h-3 w-3"
                                disabled={isMemorized}
                              />
                              <Badge 
                                variant={isSurahMemorized ? "default" : "secondary"} 
                                className={`text-xs cursor-pointer ${
                                  isSurahMemorized ? 'bg-green-500 hover:bg-green-600' : ''
                                }`}
                                onClick={() => toggleSurahMemorization(juz.juz_number, surah.id, !isSurahMemorized)}
                              >
                                {surah.name_simple} ({surah.verses})
                                {isSurahMemorized && <Check className="h-3 w-3 ml-1" />}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ExpandableSection>
        </CardContent>
      </Card>
    </div>
  );
};
