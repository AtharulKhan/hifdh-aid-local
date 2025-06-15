import { useState, useEffect, useCallback } from "react";
import { juzPageMapData } from "@/data/juz-page-map";
import { addDays, format, getDay, parseISO } from 'date-fns';
import { getSurahForPage } from "@/data/surah-juz-page-map";

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
const dayMapping: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export const useMemorizationPlanner = () => {
  const [settings, setSettings] = useState<PlannerSettingsData>(() => {
    const savedSettings = localStorage.getItem('memorizationPlannerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [alreadyMemorized, setAlreadyMemorized] = useState<number[]>(() => {
    const saved = localStorage.getItem('memorizationPlannerAlreadyMemorized');
    return saved ? JSON.parse(saved) : [];
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
    setAlreadyMemorized([]);
    setSchedule([]);
  }, []);

  const generateSchedule = useCallback(() => {
    const newSchedule: ScheduleItem[] = [];
    const juzToMemorize = juzPageMapData
      .filter(juz => !alreadyMemorized.includes(juz.juz))
      .sort((a, b) => settings.juzOrder === 'sequential' ? a.juz - b.juz : b.juz - a.juz);

    if (juzToMemorize.length === 0) {
      setSchedule([]);
      return;
    }

    let currentDate = parseISO(settings.startDate);
    let currentLineInQuran = 0; // This will be a cumulative line count

    const totalLinesToMemorize = juzToMemorize.reduce((acc, juz) => acc + (juz.totalPages * 15), 0);
    
    const pagesToMemorize: {page: number, juz: number}[] = [];
    juzToMemorize.forEach(juzInfo => {
      for (let i = juzInfo.startPage; i <= juzInfo.endPage; i++) {
        pagesToMemorize.push({page: i, juz: juzInfo.juz});
      }
    });

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
  }, [settings, alreadyMemorized]);
  
  const updateDayStatus = (date: string, completed: boolean) => {
    setSchedule(prevSchedule =>
      prevSchedule.map(item =>
        item.date === date ? { ...item, completed } : item
      )
    );
  };
  
  return { settings, setSettings, schedule, generateSchedule, updateDayStatus, alreadyMemorized, setAlreadyMemorized, resetPlanner };
};
