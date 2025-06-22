import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, RotateCcw, PlayCircle, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import juzData from "@/data/juz-numbers.json";
import surahNames from "@/data/surah-names.json";

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
  memorizedSurahs?: number[];
}

interface ReviewSettings {
  rmvPages: number;
  omvJuz: number;
  listeningJuz: number;
  readingJuz: number;
  currentJuz: number;
  startDate: string;
}

interface MurajahTableProps {
  juzMemorization: JuzMemorization[];
  settings: ReviewSettings;
}

interface DayData {
  date: string;
  formattedDate: string;
  isToday: boolean;
  rmv: string;
  omv: string;
  listening: string;
  reading: string;
}

export const MurajahTable: React.FC<MurajahTableProps> = ({ juzMemorization, settings }) => {
  const isMobile = useIsMobile();

  const generateTableData = (): DayData[] => {
    const data: DayData[] = [];
    const today = new Date();

    // Get all Juz that have some memorization
    const juzWithMemorization = juzMemorization.filter(j => 
      j.isMemorized || (j.memorizedSurahs && j.memorizedSurahs.length > 0)
    );

    if (juzWithMemorization.length === 0) return data;

    // Generate data for next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = i === 0;

      const dayData: DayData = {
        date: dateStr,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          weekday: isMobile ? undefined : 'short'
        }),
        isToday,
        rmv: calculateRMV(juzMemorization, settings),
        omv: calculateOMV(juzWithMemorization, settings, dateStr),
        listening: calculateListeningCycle(juzWithMemorization, settings, dateStr),
        reading: calculateReadingCycle(juzWithMemorization, settings, dateStr)
      };

      data.push(dayData);
    }

    return data;
  };

  const calculateRMV = (juzMem: JuzMemorization[], settings: ReviewSettings): string => {
    const currentJuzMem = juzMem.find(j => j.juzNumber === settings.currentJuz);
    if (!currentJuzMem || !currentJuzMem.startPage || !currentJuzMem.endPage) {
      return 'N/A';
    }

    const maxPage = currentJuzMem.endPage;
    const minPage = currentJuzMem.startPage;
    const startPage = Math.max(maxPage - settings.rmvPages + 1, minPage);

    return `Juz ${settings.currentJuz} - Pages ${startPage}-${maxPage}`;
  };

  const calculateOMV = (juzWithMemorization: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    if (juzWithMemorization.length === 0) return 'N/A';

    const memorizationUnits: Array<{
      type: 'full_juz' | 'partial_juz';
      juzNumber: number;
      surahIds?: number[];
      displayText: string;
    }> = [];

    juzWithMemorization.forEach(juzMem => {
      if (juzMem.isMemorized) {
        const juz = juzData[juzMem.juzNumber.toString() as keyof typeof juzData];
        if (juz) {
          let displayText = `Juz ${juzMem.juzNumber}`;
          if (juzMem.startPage && juzMem.endPage) {
            displayText += ` (Pages ${juzMem.startPage}-${juzMem.endPage})`;
          } else {
            displayText += ` (${juz.first_verse_key} - ${juz.last_verse_key})`;
          }
          
          memorizationUnits.push({
            type: 'full_juz',
            juzNumber: juzMem.juzNumber,
            displayText
          });
        }
      } else if (juzMem.memorizedSurahs && juzMem.memorizedSurahs.length > 0) {
        const surahTexts = juzMem.memorizedSurahs.map(surahId => {
          const surah = surahNames[surahId.toString() as keyof typeof surahNames];
          return surah ? surah.name_simple : `Surah ${surahId}`;
        });
        
        memorizationUnits.push({
          type: 'partial_juz',
          juzNumber: juzMem.juzNumber,
          surahIds: juzMem.memorizedSurahs,
          displayText: `Juz ${juzMem.juzNumber} (${surahTexts.join(', ')})`
        });
      }
    });

    if (memorizationUnits.length === 0) return 'N/A';

    const startDate = new Date(settings.startDate);
    const currentDate = new Date(date);
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const cycleIndex = Math.max(0, daysSinceStart) % memorizationUnits.length;
    
    const selectedUnits = [];
    for (let i = 0; i < settings.omvJuz && i < memorizationUnits.length; i++) {
      const unitIndex = (cycleIndex + i) % memorizationUnits.length;
      selectedUnits.push(memorizationUnits[unitIndex]);
    }

    return selectedUnits.map(unit => unit.displayText).join(', ');
  };

  const calculateListeningCycle = (juzWithMemorization: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    return calculateOMV(juzWithMemorization, { ...settings, omvJuz: settings.listeningJuz }, date);
  };

  const calculateReadingCycle = (juzWithMemorization: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    return calculateOMV(juzWithMemorization, { ...settings, omvJuz: settings.readingJuz }, date);
  };

  const tableData = generateTableData();

  if (tableData.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-4 sm:p-6 text-center">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Memorized Content</h3>
          <p className="text-sm sm:text-base text-gray-500">
            Mark your memorized Juz or individual Surahs to generate the schedule table.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <Card className="mt-6">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            30-Day Murajah Schedule
          </CardTitle>
          <p className="text-sm text-gray-600">
            Overview of your review cycles for the next 30 days
          </p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {tableData.map((day) => (
            <Card 
              key={day.date} 
              className={`${day.isToday ? 'bg-green-50 border-green-200 border-2' : 'border'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-lg">
                    <span className={day.isToday ? 'text-green-700 font-semibold' : ''}>
                      {day.formattedDate}
                    </span>
                    {day.isToday && (
                      <Badge variant="default" className="ml-2 bg-green-100 text-green-700 text-xs">
                        Today
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">RMV</span>
                    </div>
                    <p className="text-sm text-gray-700">{day.rmv}</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-700">OMV</span>
                    </div>
                    <p className="text-sm text-gray-700">{day.omv}</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <PlayCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700">Listening</span>
                    </div>
                    <p className="text-sm text-gray-700">{day.listening}</p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-700">Reading</span>
                    </div>
                    <p className="text-sm text-gray-700">{day.reading}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Desktop table layout
  return (
    <Card className="mt-6">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calendar className="h-5 w-5" />
          30-Day Murajah Schedule
        </CardTitle>
        <p className="text-sm text-gray-600">
          Overview of your review cycles for the next 30 days
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Date</TableHead>
                <TableHead className="min-w-48">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    RMV
                  </div>
                </TableHead>
                <TableHead className="min-w-48">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-purple-600" />
                    OMV
                  </div>
                </TableHead>
                <TableHead className="min-w-48">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    Listening
                  </div>
                </TableHead>
                <TableHead className="min-w-48">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                    Reading
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((day) => (
                <TableRow 
                  key={day.date} 
                  className={day.isToday ? 'bg-green-50 border-l-4 border-l-green-400' : ''}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className={day.isToday ? 'text-green-700 font-semibold' : ''}>
                        {day.formattedDate}
                      </span>
                      {day.isToday && (
                        <Badge variant="default" className="w-fit mt-1 bg-green-100 text-green-700 text-xs">
                          Today
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                      {day.rmv}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                      {day.omv}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      {day.listening}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                      {day.reading}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
