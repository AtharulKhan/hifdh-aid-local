import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  Target
} from "lucide-react";
import { format, parseISO, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { getVersesArray, QuranVerse } from '@/data/quranData';
import juzDataJson from "@/data/juz-numbers.json";
import { surahNamesData } from '@/data/quranData';
import { PracticeVerseCard } from './PracticeVerseCard';

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

export const MurajahMainDashboard = () => {
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
        setMemorizationSchedule(Array.isArray(scheduleData) ? scheduleData : []);
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
            generatedCycles.push({ ...cycle, completed: todayCompletions[cycle.id] || false });
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

  const generateRandomVerses = () => {
    const allVerses = getVersesArray();
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

    let versesForPractice: QuranVerse[] = [];
    if (memorizedSurahIds.size > 0) {
      versesForPractice = allVerses.filter(verse => memorizedSurahIds.has(verse.surah));
    } else {
      versesForPractice = allVerses.filter(verse => verse.surah === 1 || (verse.surah === 2 && verse.ayah <= 20));
    }

    if (versesForPractice.length === 0 && allVerses.length > 0) {
        versesForPractice = allVerses.slice(0,5);
    }

    const shuffled = versesForPractice.sort(() => 0.5 - Math.random());
    setRandomVerses(shuffled.slice(0, 5));
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
  
  const todaysMemorizationTask = memorizationSchedule.find(item => 
    isToday(parseISO(item.date)) && !item.completed
  );
  
  console.log('Todays memorization task:', todaysMemorizationTask);
  console.log('All memorization schedule:', memorizationSchedule);
  
  const upcomingMemorizationTasks = React.useMemo(() => {
    const uncompletedTasks = memorizationSchedule.filter(item => !item.completed);
    return uncompletedTasks.slice(1, 6);
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Assalamu Alaikum! Welcome to your Dashboard
              </h2>
              <p className="text-gray-600">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  <Flame className="h-6 w-6" />
                  {currentStreak}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalJuzMemorized}</p>
                <p className="text-sm text-gray-600">Juz Memorized</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalSurahsMemorized}</p>
                <p className="text-sm text-gray-600">Surahs Memorized</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(totalQuranProgress)}%</p>
                <p className="text-sm text-gray-600">Quran Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activities */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Muraja'ah
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysReviewCycles.length > 0 ? (
                <div className="space-y-2">
                  {todaysReviewCycles.map((cycle, index) => (
                    <div key={index} className={`p-3 rounded-lg ${cycle.color} flex items-center justify-between`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {cycle.icon}
                          <span className="font-medium">{cycle.title}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 ml-6 truncate">{cycle.content}</p>
                      </div>
                      {cycle.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Set up your memorization data in the Juz tab to see review cycles</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysMemorizationTask ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-bold">{format(parseISO(todaysMemorizationTask.date), "EEE, MMM d")}</p>
                    <p className="text-muted-foreground">{todaysMemorizationTask.task}</p>
                  </div>
                  
                  {upcomingMemorizationTasks.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-sm text-gray-700">Upcoming Tasks</h5>
                      <div className="space-y-2">
                        {upcomingMemorizationTasks.map(item => (
                          <div key={item.date} className="text-sm p-2 rounded-md bg-muted/50">
                            <strong>{format(parseISO(item.date), 'EEE, MMM d')}:</strong> {item.task}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Create a memorization plan in the Memorization Planner tab to see today's task</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Overview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Muraja'ah Cycles</span>
                    <span>{weeklyReviewCycles.filter(c => c.completed).length}/{weeklyReviewCycles.length}</span>
                  </div>
                  <Progress 
                    value={weeklyReviewCycles.length > 0 ? (weeklyReviewCycles.filter(c => c.completed).length / weeklyReviewCycles.length) * 100 : 0} 
                    className="w-full" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unlockedAchievements.length > 0 ? (
                <div className="space-y-2">
                  {unlockedAchievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="text-yellow-600">{achievement.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Start memorizing to unlock achievements!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Random Verse Practice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Random Verse Practice
            </div>
            <Button onClick={generateRandomVerses} variant="outline" size="sm">
              <Shuffle className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {randomVerses.length > 0 ? (
            <div className="space-y-4">
              {randomVerses.map((verse) => (
                <PracticeVerseCard key={verse.id} startVerse={verse} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No verses available for practice</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
