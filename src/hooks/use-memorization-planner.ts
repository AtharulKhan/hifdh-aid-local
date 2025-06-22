import { useState, useEffect, useCallback, useMemo } from "react";
import { juzPageMapData } from "@/data/juz-page-map";
import { addDays, getDay, parseISO, isBefore, startOfDay } from 'date-fns';
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

// Added JuzMemorization interface
interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
  memorizedSurahs?: number[];
}

export interface PlannerSettingsData {
  linesPerDay: number;
  daysOfWeek: DayOfWeek[];
  juzOrder: 'sequential' | 'reverse' | 'custom';
  surahOrder?: 'sequential' | 'reverse' | 'custom';
  orderType?: 'juz' | 'surah';
  startDate: string; // ISO string
  customJuzOrder?: number[];
  customSurahOrder?: number[];
}

export interface ScheduleItem {
  date: string; // ISO string
  task: string;
  completed: boolean;
  page: number;
  startLine: number;
  endLine: number;
  surah: string;
  isOverdue?: boolean;
  isPostponed?: boolean;
  postponedToDate?: string;
}

const defaultSettings: PlannerSettingsData = {
  linesPerDay: 15,
  daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  juzOrder: 'sequential',
  surahOrder: 'sequential',
  orderType: 'juz',
  startDate: new Date().toISOString(),
  customJuzOrder: Array.from({ length: 30 }, (_, i) => i + 1),
  customSurahOrder: Array.from({ length: 114 }, (_, i) => i + 1),
};

export const useMemorizationPlanner = () => {
  const [settings, setSettings] = useState<PlannerSettingsData>(() => {
    const savedSettings = localStorage.getItem('memorizationPlannerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Derive alreadyMemorized from 'murajah-juz-memorization'
  const alreadyMemorized = useMemo((): AlreadyMemorizedData => {
    const savedJuzData = localStorage.getItem('murajah-juz-memorization');
    const derived: AlreadyMemorizedData = { juz: [], surahs: [] };
    if (savedJuzData) {
      try {
        const parsedJuzData: JuzMemorization[] = JSON.parse(savedJuzData);
        if (Array.isArray(parsedJuzData)) {
          parsedJuzData.forEach(juzEntry => {
            if (juzEntry.isMemorized) {
              derived.juz.push(juzEntry.juzNumber);
            } else if (juzEntry.memorizedSurahs && juzEntry.memorizedSurahs.length > 0) {
              juzEntry.memorizedSurahs.forEach(surahId => {
                if (!derived.surahs.includes(surahId)) {
                  derived.surahs.push(surahId);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to parse murajah-juz-memorization for planner:', error);
      }
    }
    return derived;
  }, [refreshKey]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('memorizationPlannerSchedule');
    if (saved) {
      const parsedSchedule = JSON.parse(saved);
      // Load postponed tasks and merge them
      const postponedKey = 'memorization-planner-postponed-tasks';
      const postponedTasks = localStorage.getItem(postponedKey);
      if (postponedTasks) {
        try {
          const postponed = JSON.parse(postponedTasks);
          return parsedSchedule.map((item: ScheduleItem) => {
            const postponedTask = postponed.find((p: any) => 
              p.originalDate === item.date && 
              p.page === item.page && 
              p.startLine === item.startLine && 
              p.endLine === item.endLine
            );
            if (postponedTask) {
              return {
                ...item,
                isPostponed: true,
                postponedToDate: postponedTask.targetDate
              };
            }
            return item;
          });
        } catch (error) {
          console.error('Error parsing postponed tasks:', error);
          return parsedSchedule;
        }
      }
      return parsedSchedule;
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('memorizationPlannerSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('memorizationPlannerSchedule', JSON.stringify(schedule));
  }, [schedule]);

  // Check for overdue tasks and mark them
  useEffect(() => {
    const today = startOfDay(new Date());
    const updatedSchedule = schedule.map(item => {
      const itemDate = startOfDay(parseISO(item.date));
      const isOverdue = !item.completed && isBefore(itemDate, today);
      return { ...item, isOverdue };
    });
    
    // Only update if there are changes to avoid infinite loops
    const hasChanges = updatedSchedule.some((item, index) => 
      item.isOverdue !== schedule[index].isOverdue
    );
    
    if (hasChanges) {
      setSchedule(updatedSchedule);
    }
  }, [schedule]);

  const resetPlanner = useCallback(() => {
    localStorage.removeItem('memorizationPlannerSettings');
    localStorage.removeItem('memorizationPlannerSchedule');
    localStorage.removeItem('memorization-planner-postponed-tasks');
    setSettings(defaultSettings);
    setSchedule([]);
  }, []);

  const memorizedPagesSet = useMemo(() => {
    const pages = new Set<number>();
    // alreadyMemorized is now the derived data from useMemo
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
    setRefreshKey(prev => prev + 1);
    
    // Check if there are any overdue tasks
    const today = startOfDay(new Date());
    const overdueTasks = schedule.filter(item => {
      const itemDate = startOfDay(parseISO(item.date));
      return !item.completed && isBefore(itemDate, today);
    });

    // If there are overdue tasks, don't generate new schedule
    if (overdueTasks.length > 0) {
      console.log('Cannot generate new schedule - there are overdue tasks that need to be completed first');
      return;
    }

    const newSchedule: ScheduleItem[] = [];
    
    let allQuranPages: {page: number, juz: number}[] = [];
    
    if (settings.orderType === 'surah') {
      // Handle surah-based ordering
      let orderedSurahNumbers: number[];
      if (settings.surahOrder === 'custom' && settings.customSurahOrder) {
        orderedSurahNumbers = settings.customSurahOrder;
      } else if (settings.surahOrder === 'reverse') {
        orderedSurahNumbers = Array.from({ length: 114 }, (_, i) => 114 - i);
      } else {
        orderedSurahNumbers = Array.from({ length: 114 }, (_, i) => i + 1);
      }

      // Build pages array based on ordered surahs
      orderedSurahNumbers.forEach(surahNumber => {
        const surahName = typedSurahNames[surahNumber]?.name_simple;
        if (surahName) {
          const surahPagesData = surahJuzPageMapData.filter(item => item.surahName === surahName);
          surahPagesData.forEach(entry => {
            for (let i = entry.startPage; i <= entry.endPage; i++) {
              if (!allQuranPages.some(p => p.page === i)) {
                allQuranPages.push({page: i, juz: entry.juz});
              }
            }
          });
        }
      });
    } else {
      // Handle juz-based ordering (existing logic)
      let orderedJuzNumbers: number[];
      if (settings.juzOrder === 'custom' && settings.customJuzOrder) {
        orderedJuzNumbers = settings.customJuzOrder;
      } else if (settings.juzOrder === 'reverse') {
        orderedJuzNumbers = Array.from({ length: 30 }, (_, i) => 30 - i);
      } else {
        orderedJuzNumbers = Array.from({ length: 30 }, (_, i) => i + 1);
      }

      // Build pages array based on the ordered Juz
      orderedJuzNumbers.forEach(juzNumber => {
        const juzInfo = juzPageMapData.find(j => j.juz === juzNumber);
        if (juzInfo) {
          for (let i = juzInfo.startPage; i <= juzInfo.endPage; i++) {
            if (!allQuranPages.some(p => p.page === i)) {
              allQuranPages.push({page: i, juz: juzInfo.juz});
            }
          }
        }
      });
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
          surah: surah,
          isOverdue: false
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
  }, [settings, memorizedPagesSet, alreadyMemorized, schedule]);

  const updateDayStatus = (date: string, completed: boolean) => {
    setSchedule(prevSchedule =>
      prevSchedule.map(item =>
        item.date === date ? { ...item, completed } : item
      )
    );
  };

  return { settings, setSettings, schedule, generateSchedule, updateDayStatus, alreadyMemorized, resetPlanner, memorizedPagesSet };
};
