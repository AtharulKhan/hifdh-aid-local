import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  CheckCircle, 
  RotateCcw, 
  PlayCircle, 
  BookOpen, 
  Clock,
  Flame,
  Trophy,
  Book,
  Shuffle,
  TrendingUp,
  Award,
  Target,
  Settings,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { format, parseISO, isToday, startOfWeek, endOfWeek, isWithinInterval, isBefore, startOfDay } from 'date-fns';
import { getVersesArray, QuranVerse } from '@/data/quranData';
import juzDataJson from "@/data/juz-numbers.json";
import surahNames from "@/data/surah-names.json";
import { PracticeVerseCard } from './PracticeVerseCard';
import { useNavigate } from 'react-router-dom';
import { ConsistencyCalendar } from './ConsistencyCalendar';

// Use the actual data structures from quranData
const juzData = juzDataJson;

// Updated ReviewCycle interface
interface ReviewCycle {
  id: string;
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading' | 'New';
  title: string;
  content: string;
  startDate: string;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
  isOverdue?: boolean;
}

// Updated ReviewSettings interface
interface ReviewSettings {
  rmvPages: number;
  omvJuz: number;
  listeningJuz: number;
  readingJuz: number;
  currentJuz: number;
  startDate: string;
}

// Updated DailyCompletion interface - using the new format consistently
interface DailyCompletion {
  date: string;
  completions: { [cycleId: string]: boolean };
}

interface ScheduleItem {
  date: string;
  task: string;
  completed: boolean;
  page: number;
  startLine: number;
  endLine: number;
  surah: string;
  isOverdue?: boolean;
}

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
  memorizedSurahs?: number[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  date?: string;
}

type JuzPortion = 'all' | 'first-third' | 'second-third' | 'third-third';
type ContentSource = 'juz' | 'surah';

interface RandomVerseSettings {
  contentSource: ContentSource;
  selectedJuzNumbers: number[];
  selectedSurahs: number[];
  juzPortion: JuzPortion;
}

export const MurajahMainDashboard = () => {
  const navigate = useNavigate();
  
  const [todaysReviewCycles, setTodaysReviewCycles] = useState<ReviewCycle[]>([]);
  const [weeklyReviewCycles, setWeeklyReviewCycles] = useState<ReviewCycle[]>([]);
  const [memorizationSchedule, setMemorizationSchedule] = useState<ScheduleItem[]>([]);
  const [juzMemorization, setJuzMemorization] = useState<JuzMemorization[]>([]);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    rmvPages: 7,
    omvJuz: 1,
    listeningJuz: 2,
    readingJuz: 1,
    currentJuz: 1,
    startDate: new Date().toISOString().split('T')[0]
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [randomVerses, setRandomVerses] = useState<QuranVerse[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showRandomVerseSettings, setShowRandomVerseSettings] = useState(false);
  const [randomVerseSettings, setRandomVerseSettings] = useState<RandomVerseSettings>({
    contentSource: 'juz',
    selectedJuzNumbers: [],
    selectedSurahs: [],
    juzPortion: 'all'
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('murajah-review-settings');
    if (savedSettings) {
      setReviewSettings(JSON.parse(savedSettings));
    }
    loadDashboardData();
    generateRandomVerses();
    calculateStreaks();
    generateAchievements();
  }, []);

  const loadDashboardData = () => {
    console.log('Loading dashboard data...');
    
    const savedJuz = localStorage.getItem('murajah-juz-memorization');
    const savedSchedule = localStorage.getItem('memorizationPlannerSchedule');
    
    console.log('Saved juz:', savedJuz);
    console.log('Saved schedule:', savedSchedule);
    
    let currentJuzMemorization: JuzMemorization[] = [];
    if (savedJuz) {
      try {
        const parsedJuz = JSON.parse(savedJuz);
        if (Array.isArray(parsedJuz)) {
          setJuzMemorization(parsedJuz);
          currentJuzMemorization = parsedJuz;
        }
      } catch (error) {
        console.error('Error parsing juz memorization data:', error);
        setJuzMemorization([]);
      }
    }
    
    if (savedSchedule) {
      try {
        const scheduleData = JSON.parse(savedSchedule);
        console.log('Parsed schedule data:', scheduleData);
        
        // Mark overdue items
        const today = startOfDay(new Date());
        const updatedSchedule = scheduleData.map((item: ScheduleItem) => {
          const itemDate = startOfDay(parseISO(item.date));
          const isOverdue = !item.completed && isBefore(itemDate, today);
          return { ...item, isOverdue };
        });
        
        setMemorizationSchedule(Array.isArray(updatedSchedule) ? updatedSchedule : []);
      } catch (error) {
        console.error('Error parsing memorization schedule:', error);
        setMemorizationSchedule([]);
      }
    }

    const settingsToUse = localStorage.getItem('murajah-review-settings')
      ? JSON.parse(localStorage.getItem('murajah-review-settings')!)
      : reviewSettings;

    if (currentJuzMemorization.length > 0 || Object.keys(settingsToUse).length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const dailyCycles = generateDailyCycles(currentJuzMemorization, settingsToUse, today);
      setTodaysReviewCycles(dailyCycles);
      setWeeklyReviewCycles([]);
    } else {
      setTodaysReviewCycles([]);
      setWeeklyReviewCycles([]);
    }
  };

  const loadTodaysCompletions = (): { [cycleId: string]: boolean } => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('murajah-daily-completions');
    
    if (!savedData) return {};
    
    try {
      const parsedData = JSON.parse(savedData);
      console.log('Loading completions data:', parsedData, 'Type:', typeof parsedData);
      
      // Handle both array format (DailyCompletion[]) and object format
      let allCompletions: DailyCompletion[] = [];
      
      if (Array.isArray(parsedData)) {
        allCompletions = parsedData;
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        // Convert old object format to array format
        Object.entries(parsedData).forEach(([date, completions]) => {
          if (typeof completions === 'object' && completions !== null) {
            allCompletions.push({
              date,
              completions: completions as { [cycleId: string]: boolean }
            });
          }
        });
      }
      
      const todaysData = allCompletions.find(d => d.date === today);
      return todaysData?.completions || {};
    } catch (error) {
      console.error('Error loading completions:', error);
      return {};
    }
  };

  const calculateRMV = (currentJuzMem: JuzMemorization[], currentSettings: ReviewSettings): string => {
    const targetJuz = currentJuzMem.find(j => j.juzNumber === currentSettings.currentJuz);
    if (!targetJuz || !targetJuz.startPage || !targetJuz.endPage) {
      const anyMemorizedJuz = currentJuzMem.find(j => j.isMemorized && j.startPage && j.endPage);
      if (!anyMemorizedJuz || !anyMemorizedJuz.startPage || !anyMemorizedJuz.endPage) {
         return 'Set current Juz or ensure page numbers are available for RMV.';
      }
      const maxPage = anyMemorizedJuz.endPage;
      const minPage = anyMemorizedJuz.startPage;
      const startPage = Math.max(maxPage - currentSettings.rmvPages + 1, minPage);
      return `Juz ${anyMemorizedJuz.juzNumber} (Pages ${startPage}-${maxPage})`;
    }

    const maxPage = targetJuz.endPage;
    const minPage = targetJuz.startPage;
    const startPage = Math.max(maxPage - currentSettings.rmvPages + 1, minPage);
    return `Juz ${targetJuz.juzNumber} (Pages ${startPage}-${maxPage})`;
  };

  const calculateOMV = (juzWithCompleteMemorization: JuzMemorization[], currentSettings: ReviewSettings, date: string): string => {
    if (juzWithCompleteMemorization.length === 0) return 'No Juz fully memorized for OMV.';
    
    const memorizationUnits: string[] = juzWithCompleteMemorization.map(juzMem => {
        const juzInfo = juzData[juzMem.juzNumber.toString() as keyof typeof juzData];
        let displayText = `Juz ${juzMem.juzNumber}`;
        if (juzMem.startPage && juzMem.endPage) {
            displayText += ` (Pages ${juzMem.startPage}-${juzMem.endPage})`;
        } else if (juzInfo) {
            displayText += ` (${juzInfo.first_verse_key} - ${juzInfo.last_verse_key})`;
        }
        return displayText;
    });

    const startDate = new Date(currentSettings.startDate);
    const currentDate = new Date(date);
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleIndex = Math.max(0, daysSinceStart) % memorizationUnits.length;

    const selectedUnits: string[] = [];
    for (let i = 0; i < currentSettings.omvJuz && i < memorizationUnits.length; i++) {
      const unitIndex = (cycleIndex + i) % memorizationUnits.length;
      selectedUnits.push(memorizationUnits[unitIndex]);
    }
    return selectedUnits.join('; ');
  };

  const calculateListeningCycle = (juzWithCompleteMemorization: JuzMemorization[], currentSettings: ReviewSettings, date: string): string => {
    return calculateOMV(juzWithCompleteMemorization, { ...currentSettings, omvJuz: currentSettings.listeningJuz }, date);
  };

  const calculateReadingCycle = (juzWithCompleteMemorization: JuzMemorization[], currentSettings: ReviewSettings, date: string): string => {
    return calculateOMV(juzWithCompleteMemorization, { ...currentSettings, omvJuz: currentSettings.readingJuz }, date);
  };

  const createCarryOverCycle = (type: string, originalDate: string, currentJuzMem: JuzMemorization[], currentSettings: ReviewSettings): ReviewCycle | null => {
    const upperType = type.toUpperCase();
    const baseId = type.toLowerCase();
    const juzForOMV = currentJuzMem.filter(j => j.isMemorized);

    let content = '';
    let titleSuffix = '';
    let cycleType: ReviewCycle['type'] = 'RMV';

    switch (upperType) {
      case 'RMV':
        content = calculateRMV(currentJuzMem, currentSettings);
        titleSuffix = `(Last ${currentSettings.rmvPages} Pages)`;
        cycleType = 'RMV';
        break;
      case 'OMV':
        content = calculateOMV(juzForOMV, currentSettings, originalDate);
        titleSuffix = `(${currentSettings.omvJuz} Juz)`;
        cycleType = 'OMV';
        break;
      case 'LISTENING':
        content = calculateListeningCycle(juzForOMV, currentSettings, originalDate);
        titleSuffix = `(${currentSettings.listeningJuz} Juz)`;
        cycleType = 'Listening';
        break;
      case 'READING':
        content = calculateReadingCycle(juzForOMV, currentSettings, originalDate);
        titleSuffix = `(${currentSettings.readingJuz} Juz)`;
        cycleType = 'Reading';
        break;
      default:
        return null;
    }
    if (!content || content.startsWith('No Juz') || content.startsWith('Set current Juz')) return null;

    const icons = {
        RMV: <Clock className="h-4 w-4" />,
        OMV: <RotateCcw className="h-4 w-4" />,
        Listening: <PlayCircle className="h-4 w-4" />,
        Reading: <BookOpen className="h-4 w-4" />,
    };
    const colors = {
        RMV: 'bg-green-50 border-green-200',
        OMV: 'bg-purple-50 border-purple-200',
        Listening: 'bg-blue-50 border-blue-200',
        Reading: 'bg-orange-50 border-orange-200',
    };

    return {
      id: `${baseId}-${originalDate}-carryover`,
      type: cycleType,
      title: `${cycleType} ${titleSuffix} - Carry-over`,
      content: content,
      startDate: originalDate,
      completed: false,
      icon: icons[cycleType],
      color: colors[cycleType],
    };
  };

  const getCarryOverCycles = (currentDateStr: string, currentJuzMem: JuzMemorization[], currentSettings: ReviewSettings): ReviewCycle[] => {
    const savedData = localStorage.getItem('murajah-daily-completions');
    if (!savedData) return [];
    
    try {
      const parsedData = JSON.parse(savedData);
      console.log('Getting carry-over cycles with data:', parsedData);
      
      // Handle both array format (DailyCompletion[]) and object format
      let allCompletions: DailyCompletion[] = [];
      
      if (Array.isArray(parsedData)) {
        allCompletions = parsedData;
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        // Convert old object format to array format
        Object.entries(parsedData).forEach(([date, completions]) => {
          if (typeof completions === 'object' && completions !== null) {
            allCompletions.push({
              date,
              completions: completions as { [cycleId: string]: boolean }
            });
          }
        });
      }
      
      const carryOvers: ReviewCycle[] = [];
      const currentDateObj = new Date(currentDateStr);

      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(currentDateObj);
        checkDate.setDate(currentDateObj.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];

        const dayData = allCompletions.find(d => d.date === checkDateStr);
        if (dayData && dayData.completions) {
          Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
            const cycleTypePart = cycleId.split('-')[0];
            if (!completed && !carryOvers.some(c => c.type.toLowerCase() === cycleTypePart)) {
              const carryOverCycle = createCarryOverCycle(cycleTypePart, checkDateStr, currentJuzMem, currentSettings);
              if (carryOverCycle) {
                carryOvers.push(carryOverCycle);
              }
            }
          });
        }
      }
      return carryOvers;
    } catch (error) {
      console.error('Error getting carry-over cycles:', error);
      return [];
    }
  };

  const generateDailyCycles = (currentJuzMem: JuzMemorization[], currentSettings: ReviewSettings, date: string): ReviewCycle[] => {
    const generatedCycles: ReviewCycle[] = [];
    const todayCompletions = loadTodaysCompletions();

    const juzForOMVTypeCycles = currentJuzMem.filter(j => j.isMemorized);

    const carryOverCycles = getCarryOverCycles(date, currentJuzMem, currentSettings);
    carryOverCycles.forEach(cycle => {
        if (!generatedCycles.some(c => c.type === cycle.type)) {
            // Check if this cycle is overdue
            const cycleDate = startOfDay(parseISO(cycle.startDate));
            const today = startOfDay(new Date());
            const isOverdue = isBefore(cycleDate, today);
            
            generatedCycles.push({ 
              ...cycle, 
              completed: todayCompletions[cycle.id] || false,
              isOverdue,
              color: isOverdue ? 'bg-red-50 border border-red-200' : cycle.color
            });
        }
    });

    const cycleDefinitions: { type: ReviewCycle['type'], titleSuffix: string, contentFn: () => string, icon: JSX.Element, color: string }[] = [
        { type: 'RMV', titleSuffix: `(Last ${currentSettings.rmvPages} Pages)`, contentFn: () => calculateRMV(currentJuzMem, currentSettings), icon: <Clock className="h-4 w-4" />, color: 'bg-green-50 border-green-200' },
        { type: 'OMV', titleSuffix: `(${currentSettings.omvJuz} Juz)`, contentFn: () => calculateOMV(juzForOMVTypeCycles, currentSettings, date), icon: <RotateCcw className="h-4 w-4" />, color: 'bg-purple-50 border-purple-200' },
        { type: 'Listening', titleSuffix: `(${currentSettings.listeningJuz} Juz)`, contentFn: () => calculateListeningCycle(juzForOMVTypeCycles, currentSettings, date), icon: <PlayCircle className="h-4 w-4" />, color: 'bg-blue-50 border-blue-200' },
        { type: 'Reading', titleSuffix: `(${currentSettings.readingJuz} Juz)`, contentFn: () => calculateReadingCycle(juzForOMVTypeCycles, currentSettings, date), icon: <BookOpen className="h-4 w-4" />, color: 'bg-orange-50 border-orange-200' },
    ];

    cycleDefinitions.forEach(def => {
        if (generatedCycles.some(c => c.type === def.type)) return;

        const content = def.contentFn();
        if (content && !content.startsWith('No Juz') && !content.startsWith('Set current Juz')) {
            const cycleId = `${def.type.toLowerCase()}-${date}`;
            generatedCycles.push({
                id: cycleId,
                type: def.type,
                title: `${def.type} ${def.titleSuffix}`,
                content: content,
                startDate: date,
                completed: todayCompletions[cycleId] || false,
                icon: def.icon,
                color: def.color,
                isOverdue: false
            });
        }
    });

    return generatedCycles;
  };

  const calculateStreaks = () => {
    const completions = localStorage.getItem('murajah-daily-completions');
    if (!completions) {
      console.log('No completions data for streak calculation');
      return;
    }

    try {
      const parsedData = JSON.parse(completions);
      console.log('Calculating streaks with data:', parsedData, 'Type:', typeof parsedData);
      
      let streak = 0;
      const today = new Date();
      
      let completionsData: { [date: string]: { [cycleId: string]: boolean } } = {};
      
      // Handle both array format (DailyCompletion[]) and object format
      if (Array.isArray(parsedData)) {
        parsedData.forEach((item: DailyCompletion) => {
          if (item.date && item.completions) {
            completionsData[item.date] = item.completions;
          }
        });
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        completionsData = parsedData;
      }
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayCompletions = completionsData[dateStr];
        if (dayCompletions && typeof dayCompletions === 'object') {
          const allCompleted = Object.values(dayCompletions).every(c => c === true);
          if (allCompleted && Object.keys(dayCompletions).length > 0) {
            streak++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      console.log('Calculated streak:', streak);
      setCurrentStreak(streak);
    } catch (error) {
      console.error('Error calculating streaks:', error);
    }
  };

  const generateAchievements = () => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-surah',
        title: 'First Surah Memorized',
        description: 'Complete your first surah',
        icon: <Award className="h-6 w-6" />,
        unlocked: juzMemorization.some(j => j.memorizedSurahs && j.memorizedSurahs.length > 0),
        date: '2024-01-15'
      },
      {
        id: 'streak-7',
        title: '7-Day Streak',
        description: 'Complete review for 7 days in a row',
        icon: <Flame className="h-6 w-6" />,
        unlocked: currentStreak >= 7,
        date: currentStreak >= 7 ? new Date().toISOString().split('T')[0] : undefined
      },
      {
        id: 'streak-30',
        title: '30-Day Streak',
        description: 'Complete review for 30 days in a row',
        icon: <Trophy className="h-6 w-6" />,
        unlocked: currentStreak >= 30,
        date: currentStreak >= 30 ? new Date().toISOString().split('T')[0] : undefined
      },
      {
        id: 'first-juz',
        title: 'First Juz Complete',
        description: 'Memorize your first complete Juz',
        icon: <Book className="h-6 w-6" />,
        unlocked: juzMemorization.some(j => j.isMemorized),
        date: '2024-02-20'
      },
      {
        id: 'juz-amma',
        title: "Juz 'Amma Complete",
        description: 'Complete the 30th Juz',
        icon: <Target className="h-6 w-6" />,
        unlocked: juzMemorization.some(j => j.juzNumber === 30 && j.isMemorized),
        date: '2024-03-10'
      }
    ];

    setAchievements(baseAchievements);
  };

  const getJuzPortionVerses = (juzNumber: number, allVersesInput: QuranVerse[], portion: JuzPortion): QuranVerse[] => {
    const juzInfo = juzData[juzNumber.toString() as keyof typeof juzData];
    if (!juzInfo) return [];

    let juzVerses: QuranVerse[] = [];
    
    Object.entries(juzInfo.verse_mapping).forEach(([surahIdStr, range]) => {
      const surahId = Number(surahIdStr);
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        const surahVerses = allVersesInput.filter(verse => 
          verse.surah === surahId && verse.ayah >= start && verse.ayah <= end
        );
        juzVerses.push(...surahVerses);
      } else {
        const ayahNumber = parseInt(range);
        const verse = allVersesInput.find(verse => 
          verse.surah === surahId && verse.ayah === ayahNumber
        );
        if (verse) juzVerses.push(verse);
      }
    });

    // Sort verses by surah and ayah
    juzVerses.sort((a, b) => {
      if (a.surah !== b.surah) return a.surah - b.surah;
      return a.ayah - b.ayah;
    });

    if (portion === 'all') return juzVerses;

    const totalVerses = juzVerses.length;
    const thirdSize = Math.ceil(totalVerses / 3);

    switch (portion) {
      case 'first-third':
        return juzVerses.slice(0, thirdSize);
      case 'second-third':
        return juzVerses.slice(thirdSize, thirdSize * 2);
      case 'third-third':
        return juzVerses.slice(thirdSize * 2);
      default:
        return juzVerses;
    }
  };

  const getSurahVerses = (surahNumber: number, allVersesInput: QuranVerse[], portion: JuzPortion): QuranVerse[] => {
    const surahVerses = allVersesInput.filter(verse => verse.surah === surahNumber);
    
    if (portion === 'all') return surahVerses;

    const totalVerses = surahVerses.length;
    const thirdSize = Math.ceil(totalVerses / 3);

    switch (portion) {
      case 'first-third':
        return surahVerses.slice(0, thirdSize);
      case 'second-third':
        return surahVerses.slice(thirdSize, thirdSize * 2);
      case 'third-third':
        return surahVerses.slice(thirdSize * 2);
      default:
        return surahVerses;
    }
  };

  const generateRandomVerses = () => {
    const allVerses = getVersesArray();
    let versesForPractice: QuranVerse[] = [];

    if (randomVerseSettings.contentSource === 'juz') {
      // Juz-based selection
      if (randomVerseSettings.selectedJuzNumbers.length > 0) {
        randomVerseSettings.selectedJuzNumbers.forEach(juzNumber => {
          const juzVerses = getJuzPortionVerses(juzNumber, allVerses, randomVerseSettings.juzPortion);
          versesForPractice.push(...juzVerses);
        });
      } else {
        // Default behavior - use all memorized Juz
        juzMemorization.forEach(juzEntry => {
          if (juzEntry.isMemorized) {
            const juzVerses = getJuzPortionVerses(juzEntry.juzNumber, allVerses, randomVerseSettings.juzPortion);
            versesForPractice.push(...juzVerses);
          }
        });
      }
    } else {
      // Surah-based selection
      if (randomVerseSettings.selectedSurahs.length > 0) {
        randomVerseSettings.selectedSurahs.forEach(surahNumber => {
          const surahVerses = getSurahVerses(surahNumber, allVerses, randomVerseSettings.juzPortion);
          versesForPractice.push(...surahVerses);
        });
      } else {
        // Default behavior - use all memorized Surahs
        const memorizedSurahIds = new Set<number>();
        juzMemorization.forEach(juzEntry => {
          if (juzEntry.isMemorized) {
            const juzInfo = juzData[juzEntry.juzNumber.toString() as keyof typeof juzData];
            if (juzInfo) {
              Object.keys(juzInfo.verse_mapping).forEach(surahIdStr => {
                memorizedSurahIds.add(Number(surahIdStr));
              });
            }
          } else if (juzEntry.memorizedSurahs) {
            juzEntry.memorizedSurahs.forEach(surahId => {
              memorizedSurahIds.add(surahId);
            });
          }
        });

        if (memorizedSurahIds.size > 0) {
          memorizedSurahIds.forEach(surahId => {
            const surahVerses = getSurahVerses(surahId, allVerses, randomVerseSettings.juzPortion);
            versesForPractice.push(...surahVerses);
          });
        }
      }
    }

    // Fallback if no memorized content
    if (versesForPractice.length === 0) {
      versesForPractice = allVerses.filter(verse => verse.surah === 1 || (verse.surah === 2 && verse.ayah <= 20));
    }

    if (versesForPractice.length === 0 && allVerses.length > 0) {
      versesForPractice = allVerses.slice(0, 5);
    }

    const shuffled = versesForPractice.sort(() => 0.5 - Math.random());
    setRandomVerses(shuffled.slice(0, 5));
  };

  // Initialize settings with all memorized Juz/Surahs when component loads
  useEffect(() => {
    const memorizedJuzNumbers = getMemorizedJuzNumbers();
    const memorizedSurahs = getMemorizedSurahs();
    setRandomVerseSettings(prev => ({
      ...prev,
      selectedJuzNumbers: prev.selectedJuzNumbers.length === 0 ? memorizedJuzNumbers : prev.selectedJuzNumbers,
      selectedSurahs: prev.selectedSurahs.length === 0 ? memorizedSurahs : prev.selectedSurahs
    }));
  }, [juzMemorization]);

  const getMemorizedJuzNumbers = () => {
    return juzMemorization.filter(j => j.isMemorized).map(j => j.juzNumber);
  };

  const getMemorizedSurahs = () => {
    const memorizedSurahs = new Set<number>();
    juzMemorization.forEach(juzEntry => {
      if (juzEntry.isMemorized) {
        const juzInfo = juzData[juzEntry.juzNumber.toString() as keyof typeof juzData];
        if (juzInfo) {
          Object.keys(juzInfo.verse_mapping).forEach(surahIdStr => {
            memorizedSurahs.add(Number(surahIdStr));
          });
        }
      } else if (juzEntry.memorizedSurahs) {
        juzEntry.memorizedSurahs.forEach(surahId => {
          memorizedSurahs.add(surahId);
        });
      }
    });
    return Array.from(memorizedSurahs).sort((a, b) => a - b);
  };

  const toggleJuzSelection = (juzNumber: number) => {
    setRandomVerseSettings(prev => ({
      ...prev,
      selectedJuzNumbers: prev.selectedJuzNumbers.includes(juzNumber)
        ? prev.selectedJuzNumbers.filter(j => j !== juzNumber)
        : [...prev.selectedJuzNumbers, juzNumber]
    }));
  };

  const toggleSurahSelection = (surahNumber: number) => {
    setRandomVerseSettings(prev => ({
      ...prev,
      selectedSurahs: prev.selectedSurahs.includes(surahNumber)
        ? prev.selectedSurahs.filter(s => s !== surahNumber)
        : [...prev.selectedSurahs, surahNumber]
    }));
  };

  const selectAllMemorizedJuz = () => {
    const memorizedJuzNumbers = getMemorizedJuzNumbers();
    setRandomVerseSettings(prev => ({
      ...prev,
      selectedJuzNumbers: memorizedJuzNumbers
    }));
  };

  const deselectAllJuz = () => {
    setRandomVerseSettings(prev => ({
      ...prev,
      selectedJuzNumbers: []
    }));
  };

  const selectAllMemorizedSurahs = () => {
    const memorizedSurahs = getMemorizedSurahs();
    setRandomVerseSettings(prev => ({
      ...prev,
      selectedSurahs: memorizedSurahs
    }));
  };

  const deselectAllSurahs = () => {
    setRandomVerseSettings(prev => ({
      ...prev,
      selectedSurahs: []
    }));
  };

  const saveTodaysCompletions = (completions: { [cycleId: string]: boolean }) => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('murajah-daily-completions');
    
    let allCompletions: DailyCompletion[] = [];
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        if (Array.isArray(parsedData)) {
          allCompletions = parsedData;
        } else if (typeof parsedData === 'object' && parsedData !== null) {
          Object.entries(parsedData).forEach(([date, completions]) => {
            if (typeof completions === 'object' && completions !== null) {
              allCompletions.push({
                date,
                completions: completions as { [cycleId: string]: boolean }
              });
            }
          });
        }
      } catch (error) {
        console.error('Error parsing saved completions:', error);
      }
    }

    const todayIndex = allCompletions.findIndex(d => d.date === today);
    if (todayIndex >= 0) {
      allCompletions[todayIndex].completions = completions;
    } else {
      allCompletions.push({ date: today, completions });
    }

    localStorage.setItem('murajah-daily-completions', JSON.stringify(allCompletions));
    
    // Refresh data to update UI
    loadDashboardData();
    calculateStreaks();
  };

  const toggleCycleCompletion = (cycleId: string) => {
    const updatedCycles = todaysReviewCycles.map(cycle => 
      cycle.id === cycleId ? { ...cycle, completed: !cycle.completed } : cycle
    );
    setTodaysReviewCycles(updatedCycles);

    // Save to localStorage
    const completions = updatedCycles.reduce((acc, cycle) => {
      acc[cycle.id] = cycle.completed;
      return acc;
    }, {} as { [cycleId: string]: boolean });
    
    saveTodaysCompletions(completions);
  };

  const toggleMemorizationTaskCompletion = () => {
    if (!todaysMemorizationTask) return;

    const updatedSchedule = memorizationSchedule.map(item =>
      item.date === todaysMemorizationTask.date
        ? { ...item, completed: !item.completed }
        : item
    );
    
    setMemorizationSchedule(updatedSchedule);
    localStorage.setItem('memorizationPlannerSchedule', JSON.stringify(updatedSchedule));
  };

  // Calculate statistics
  const totalJuzMemorized = juzMemorization.filter(j => j.isMemorized).length;

  const totalSurahsMemorized = useMemo(() => {
    const memorizedSurahIds = new Set<number>();
    juzMemorization.forEach(juzEntry => {
      if (juzEntry.isMemorized) {
        const juzInfo = juzData[juzEntry.juzNumber.toString() as keyof typeof juzData];
        if (juzInfo) {
          Object.keys(juzInfo.verse_mapping).forEach(surahIdStr => {
            memorizedSurahIds.add(Number(surahIdStr));
          });
        }
      } else if (juzEntry.memorizedSurahs) {
        juzEntry.memorizedSurahs.forEach(surahId => {
          memorizedSurahIds.add(surahId);
        });
      }
    });
    return memorizedSurahIds.size;
  }, [juzMemorization]);

  const totalQuranProgress = (totalJuzMemorized / 30) * 100;
  
  // Updated logic to match PlannerSummary - find first uncompleted task
  const todaysMemorizationTask = React.useMemo(() => {
    const uncompletedTasks = memorizationSchedule.filter(item => !item.completed);
    const overdueTasks = uncompletedTasks.filter(item => item.isOverdue);
    
    // If there are overdue tasks, show the first overdue task
    if (overdueTasks.length > 0) {
      return overdueTasks[0];
    }
    // Otherwise show the first uncompleted task
    return uncompletedTasks[0];
  }, [memorizationSchedule]);
  
  console.log('Todays memorization task:', todaysMemorizationTask);
  console.log('All memorization schedule:', memorizationSchedule);
  
  const upcomingMemorizationTasks = React.useMemo(() => {
    const uncompletedTasks = memorizationSchedule.filter(item => !item.completed);
    const overdueTasks = uncompletedTasks.filter(item => item.isOverdue);
    
    // If there are overdue tasks, don't show upcoming tasks
    if (overdueTasks.length > 0) {
      return [];
    }
    
    return uncompletedTasks.slice(1, 6); // Next 5 tasks after the first one
  }, [memorizationSchedule]);
  
  const weeklyMemorizationTasks = memorizationSchedule.filter(item => {
    const date = parseISO(item.date);
    return isWithinInterval(date, { 
      start: startOfWeek(new Date()), 
      end: endOfWeek(new Date()) 
    });
  });

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Assalamu Alaikum! Welcome to your Dashboard
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600 flex items-center gap-1">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6" />
                  {currentStreak}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{totalJuzMemorized}</p>
                <p className="text-xs sm:text-sm text-gray-600">Juz Memorized</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{totalSurahsMemorized}</p>
                <p className="text-xs sm:text-sm text-gray-600">Surahs Memorized</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{Math.round(totalQuranProgress)}%</p>
                <p className="text-xs sm:text-sm text-gray-600">Quran Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{unlockedAchievements.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activities and Goal - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Muraja'ah */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Today's Muraja'ah
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/murajah?tab=review')}
                className="text-xs flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Today's Muraja'ah
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {todaysReviewCycles.length > 0 ? (
              <div className="space-y-2">
                {todaysReviewCycles.map((cycle, index) => (
                  <div key={index} className={`p-2 sm:p-3 rounded-lg ${cycle.color} flex items-center justify-between`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {cycle.completed ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        ) : (
                          cycle.icon
                        )}
                        <span className="font-medium text-sm sm:text-base">{cycle.title}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-6 truncate">{cycle.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cycle.isOverdue && !cycle.completed && (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                      {cycle.completed ? (
                        <Badge variant="default" className="text-xs">Completed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                      <Button
                        variant={cycle.completed ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCycleCompletion(cycle.id)}
                        className="text-xs"
                      >
                        {cycle.completed ? "Undo" : "Complete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Set up your memorization data in the Juz tab to see review cycles</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Goal */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                {todaysMemorizationTask?.isOverdue ? "Priority Task (Overdue)" : "Today's Goal"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/murajah?tab=planner')}
                className="text-xs flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Memorization Planner
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {todaysMemorizationTask ? (
              <div className="space-y-4">
                <div className={`p-2 sm:p-3 rounded-lg ${
                  todaysMemorizationTask.isOverdue ? 'bg-red-50 border border-red-200' : 
                  todaysMemorizationTask.completed ? 'bg-green-50 border border-green-200' : 'bg-muted/50'
                } flex items-center justify-between`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {todaysMemorizationTask.completed ? (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ) : (
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      )}
                      <p className="font-bold text-sm sm:text-base">{format(parseISO(todaysMemorizationTask.date), "EEE, MMM d")}</p>
                    </div>
                    <p className={`text-xs sm:text-sm ml-6 ${
                      todaysMemorizationTask.isOverdue ? 'text-red-700' : 'text-muted-foreground'
                    }`}>
                      {todaysMemorizationTask.task}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {todaysMemorizationTask.isOverdue && !todaysMemorizationTask.completed && (
                      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                    {todaysMemorizationTask.completed ? (
                      <Badge variant="default" className="text-xs">Completed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                    <Button
                      variant={todaysMemorizationTask.completed ? "default" : "outline"}
                      size="sm"
                      onClick={toggleMemorizationTaskCompletion}
                      className="text-xs"
                    >
                      {todaysMemorizationTask.completed ? "Undo" : "Complete"}
                    </Button>
                  </div>
                </div>
                
                {upcomingMemorizationTasks.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-xs sm:text-sm text-gray-700">Upcoming Tasks</h5>
                    <div className="space-y-2">
                      {upcomingMemorizationTasks.map(item => (
                        <div key={item.date} className="text-xs sm:text-sm p-2 rounded-md bg-muted/50">
                          <strong>{format(parseISO(item.date), 'EEE, MMM d')}:</strong> {item.task}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {upcomingMemorizationTasks.length === 0 && memorizationSchedule.some(item => item.isOverdue && !item.completed) && (
                  <p className="text-red-600 text-xs sm:text-sm">Complete overdue tasks to see upcoming tasks.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Create a memorization plan in the Memorization Planner tab to see today's task</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Random Verse Practice */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg">Random Verse Practice</span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowRandomVerseSettings(!showRandomVerseSettings)} 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Settings
              </Button>
              <Button onClick={generateRandomVerses} variant="outline" size="sm" className="text-xs sm:text-sm">
                <Shuffle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Regenerate
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Settings Panel */}
          {showRandomVerseSettings && (
            <Card className="mb-4 p-3 sm:p-4 bg-gray-50 border-gray-200">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Practice Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Content Source</label>
                    <Select 
                      value={randomVerseSettings.contentSource} 
                      onValueChange={(value: ContentSource) => 
                        setRandomVerseSettings(prev => ({ ...prev, contentSource: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="juz">By Juz</SelectItem>
                        <SelectItem value="surah">By Surah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Portion</label>
                    <Select 
                      value={randomVerseSettings.juzPortion} 
                      onValueChange={(value: JuzPortion) => 
                        setRandomVerseSettings(prev => ({ ...prev, juzPortion: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Complete {randomVerseSettings.contentSource === 'juz' ? 'Juz' : 'Surah'}</SelectItem>
                        <SelectItem value="first-third">First Third</SelectItem>
                        <SelectItem value="second-third">Second Third</SelectItem>
                        <SelectItem value="third-third">Third Third</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {randomVerseSettings.contentSource === 'juz' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700">Select Juz to Practice</label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={selectAllMemorizedJuz} className="text-xs">
                            Select All
                          </Button>
                          <Button variant="outline" size="sm" onClick={deselectAllJuz} className="text-xs">
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {getMemorizedJuzNumbers().map(juzNumber => (
                          <div key={juzNumber} className="flex items-center space-x-2">
                            <Switch
                              id={`juz-${juzNumber}`}
                              checked={randomVerseSettings.selectedJuzNumbers.includes(juzNumber)}
                              onCheckedChange={() => toggleJuzSelection(juzNumber)}
                            />
                            <label 
                              htmlFor={`juz-${juzNumber}`} 
                              className="text-xs sm:text-sm cursor-pointer"
                            >
                              Juz {juzNumber}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {randomVerseSettings.selectedJuzNumbers.length === 0 && (
                        <p className="text-xs sm:text-sm text-amber-600 mt-2">
                          No Juz selected. Will use default practice verses.
                        </p>
                      )}
                    </div>
                  )}

                  {randomVerseSettings.contentSource === 'surah' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700">Select Surahs to Practice</label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={selectAllMemorizedSurahs} className="text-xs">
                            Select All
                          </Button>
                          <Button variant="outline" size="sm" onClick={deselectAllSurahs} className="text-xs">
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {getMemorizedSurahs().map(surahNumber => {
                          const surahInfo = surahNames[surahNumber.toString() as keyof typeof surahNames];
                          const surahName = surahInfo ? surahInfo.name_simple : `Surah ${surahNumber}`;
                          return (
                            <div key={surahNumber} className="flex items-center space-x-2">
                              <Switch
                                id={`surah-${surahNumber}`}
                                checked={randomVerseSettings.selectedSurahs.includes(surahNumber)}
                                onCheckedChange={() => toggleSurahSelection(surahNumber)}
                              />
                              <label 
                                htmlFor={`surah-${surahNumber}`} 
                                className="text-xs sm:text-sm cursor-pointer truncate"
                              >
                                {surahName}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      
                      {randomVerseSettings.selectedSurahs.length === 0 && (
                        <p className="text-xs sm:text-sm text-amber-600 mt-2">
                          No Surahs selected. Will use default practice verses.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {randomVerses.length > 0 ? (
            <div className="space-y-4">
              {randomVerses.map((verse) => (
                <PracticeVerseCard key={verse.id} startVerse={verse} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No verses available for practice</p>
          )}
        </CardContent>
      </Card>

      {/* Consistency Calendar - Full Width */}
      <ConsistencyCalendar 
        dailyCompletions={localStorage.getItem('murajah-daily-completions') ? 
          (() => {
            try {
              const savedData = localStorage.getItem('murajah-daily-completions');
              if (!savedData) return [];
              
              const parsedData = JSON.parse(savedData);
              if (Array.isArray(parsedData)) {
                return parsedData;
              } else if (typeof parsedData === 'object' && parsedData !== null) {
                // Convert old object format to array format
                return Object.entries(parsedData).map(([date, completions]) => ({
                  date,
                  completions: completions as { [cycleId: string]: boolean }
                }));
              }
              return [];
            } catch (error) {
              console.error('Error parsing daily completions:', error);
              return [];
            }
          })() : []
        }
        memorizationSchedule={memorizationSchedule}
        currentStreak={currentStreak}
      />

      {/* Weekly Overview and Achievements - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Overview */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">This Week's Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span>Muraja'ah Cycles</span>
                  <span>{weeklyReviewCycles.filter(c => c.completed).length}/{weeklyReviewCycles.length}</span>
                </div>
                <Progress 
                  value={weeklyReviewCycles.length > 0 ? (weeklyReviewCycles.filter(c => c.completed).length / weeklyReviewCycles.length) * 100 : 0} 
                  className="w-full" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span>Memorization Tasks</span>
                  <span>{weeklyMemorizationTasks.filter(t => t.completed).length}/{weeklyMemorizationTasks.length}</span>
                </div>
                <Progress 
                  value={weeklyMemorizationTasks.length > 0 ? (weeklyMemorizationTasks.filter(t => t.completed).length / weeklyMemorizationTasks.length) * 100 : 0} 
                  className="w-full" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {unlockedAchievements.length > 0 ? (
              <div className="space-y-2">
                {unlockedAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-yellow-600 flex-shrink-0">{achievement.icon}</div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600 truncate">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Start memorizing to unlock achievements!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
