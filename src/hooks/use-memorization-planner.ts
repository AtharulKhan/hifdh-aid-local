
import { useState, useEffect, useCallback, useMemo } from "react";
import { juzPageMapData } from "@/data/juz-page-map";
import { addDays, getDay, parseISO } from 'date-fns';
import { getSurahForPage, surahJuzPageMapData } from "@/data/surah-juz-page-map";
import surahNamesData from '@/data/surah-names.json';

type SurahNames = {
  [key: string]: {
    name_simple: string;
  }
}
const typedSurahNames: SurahNames = surahNamesData;

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
const dayMapping: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface AlreadyMemorizedData {
  juz: number[];
  surahs: number[];
}

export interface PlannerSettingsData {
  linesPerDay: number;
  daysOfWeek: DayOfWeek[];
  juzOrder: 'sequential' | 'reverse';
  startDate: string; // ISO string
}

export interface ScheduleItem {
  date: string; // ISO string
  task: string;
  completed: boolean;
  page: number;
  startLine: number;
  endLine: number;
  surah: string;
}

const defaultSettings: PlannerSettingsData = {
  linesPerDay: 15,
  daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  juzOrder: 'sequential',
  startDate: new Date().toISOString(),
};

const defaultAlreadyMemorized: AlreadyMemorizedData = {
  juz: [],
  surahs: [],
};

export const useMemorizationPlanner = () => {
  const [settings, setSettings] = useState<PlannerSettingsData>(() => {
    const savedSettings = localStorage.getItem('memorizationPlannerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [alreadyMemorized, setAlreadyMemorized] = useState<AlreadyMemorizedData>(() => {
    const saved = localStorage.getItem('memorizationPlannerAlreadyMemorized');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && 'juz' in parsed && 'surahs' in parsed && Array.isArray(parsed.juz) && Array.isArray(parsed.surahs)) {
          return parsed;
        }
        // Handle old format which might be just an array of numbers (juz)
        if (Array.isArray(parsed)) {
          return { juz: parsed.filter(item => typeof item === 'number'), surahs: [] };
        }
      } catch (error) {
        console.error('Failed to parse already memorized data from local storage:', error);
      }
    }
    return defaultAlreadyMemorized;
  });
  
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('memorizationPlannerSchedule');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('memorizationPlannerSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('memorizationPlannerAlreadyMemorized', JSON.stringify(alreadyMemorized));
  }, [alreadyMemorized]);

  useEffect(() => {
    localStorage.setItem('memorizationPlannerSchedule', JSON.stringify(schedule));
  }, [schedule]);

  const resetPlanner = useCallback(() => {
    localStorage.removeItem('memorizationPlannerSettings');
    localStorage.removeItem('memorizationPlannerAlreadyMemorized');
    localStorage.removeItem('memorizationPlannerSchedule');
    setSettings(defaultSettings);
    setAlreadyMemorized(defaultAlreadyMemorized);
    setSchedule([]);
  }, []);

  const memorizedPagesSet = useMemo(() => {
    const pages = new Set<number>();
    
    alreadyMemorized.juz.forEach(juzNumber => {
      const juzData = juzPageMapData.find(j => j.juz === juzNumber);
      if (juzData) {
        for (let i = juzData.startPage; i <= juzData.endPage; i++) {
          pages.add(i);
        }
      }
    });

    const surahNumberToName = (surahNumber: number) => {
        return typedSurahNames[surahNumber]?.name_simple;
    };
    
    alreadyMemorized.surahs.forEach(surahNumber => {
        const surahName = surahNumberToName(surahNumber);
        if (surahName) {
            const surahPagesData = surahJuzPageMapData.filter(item => item.surahName === surahName);
            surahPagesData.forEach(entry => {
                for (let i = entry.startPage; i <= entry.endPage; i++) {
                    pages.add(i);
                }
            });
        }
    });

    return pages;
  }, [alreadyMemorized]);

  const generateSchedule = useCallback(() => {
    const newSchedule: ScheduleItem[] = [];
    
    let allQuranPages: {page: number, juz: number}[] = [];
    juzPageMapData.forEach(juzInfo => {
      for (let i = juzInfo.startPage; i <= juzInfo.endPage; i++) {
        if (!allQuranPages.some(p => p.page === i)) {
          allQuranPages.push({page: i, juz: juzInfo.juz});
        }
      }
    });

    if (settings.juzOrder === 'reverse') {
      allQuranPages.reverse();
    }
    
    const pagesToMemorize = allQuranPages.filter(p => !memorizedPagesSet.has(p.page));

    if (pagesToMemorize.length === 0) {
      setSchedule([]);
      return;
    }

    let currentDate = parseISO(settings.startDate);
    let pageIndex = 0;
    let lineOnPage = 1;

    while (pageIndex < pagesToMemorize.length) {
      const dayOfWeek = getDay(currentDate);
      if (settings.daysOfWeek.includes(dayMapping[dayOfWeek])) {
        const { page } = pagesToMemorize[pageIndex];
        const surah = getSurahForPage(page);
        const startLine = lineOnPage;
        let linesForThisDay = settings.linesPerDay;
        
        let endLine = lineOnPage + linesForThisDay - 1;

        newSchedule.push({
          date: currentDate.toISOString(),
          task: `Surah ${surah}, Page ${page}, Lines ${startLine}-${Math.min(endLine, 15)}`,
          completed: false,
          page: page,
          startLine: startLine,
          endLine: Math.min(endLine, 15),
          surah: surah
        });

        lineOnPage += linesForThisDay;
        if(lineOnPage > 15) {
            pageIndex++;
            lineOnPage = lineOnPage - 15;
        }
      }
      currentDate = addDays(currentDate, 1);
    }

    setSchedule(newSchedule);
  }, [settings, alreadyMemorized, memorizedPagesSet]);
  
  const updateDayStatus = (date: string, completed: boolean) => {
    setSchedule(prevSchedule =>
      prevSchedule.map(item =>
        item.date === date ? { ...item, completed } : item
      )
    );
  };
  
  return { settings, setSettings, schedule, generateSchedule, updateDayStatus, alreadyMemorized, setAlreadyMemorized, resetPlanner, memorizedPagesSet };
};
