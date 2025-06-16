
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
import juzDataJson from "@/data/juz-numbers.json"; // Import juzData
import surahNamesData from "@/data/surah-names.json"; // Import surahNamesData
import { PracticeVerseCard } from './PracticeVerseCard'; // Import PracticeVerseCard

// Define a type for surahNamesData
interface SurahNameInfo {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
  translated_name: { language_name: string; name: string };
}
interface SurahNamesType {
  [key: string]: SurahNameInfo;
}
const surahNames: SurahNamesType = surahNamesData;


// Define a type for juzDataJson to avoid 'any' type if possible
interface JuzVerseMapping {
  [surahId: string]: string;
}
interface JuzInfo {
  juz_number: number;
  verse_mapping: JuzVerseMapping;
  verses_count: number;
  first_verse_id: number;
  last_verse_id: number;
  first_verse_key: string;
  last_verse_key: string;
}
interface JuzData {
  [juzKey: string]: JuzInfo;
}
const juzData: JuzData = juzDataJson; // Assign with type

// Updated ReviewCycle interface
interface ReviewCycle {
  id: string; // Added id
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading' | 'New'; // Added 'New' for potential future use
  title: string;
  content: string;
  startDate: string; // Added startDate
  completed: boolean;
  icon: React.ReactNode;
  color: string;
}

// Added ReviewSettings interface
interface ReviewSettings {
  rmvPages: number;
  omvJuz: number;
  listeningJuz: number;
  readingJuz: number;
  currentJuz: number; // Current Juz being memorized, for RMV context
  startDate: string; // ISO string, for OMV rotation
}

// Updated DailyCompletion interface
interface DailyCompletion {
  date: string;
  completions: { [cycleId: string]: boolean }; // Changed from boolean[]
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

interface DailyCompletion {
  date: string;
  completions: boolean[];
}

export const MurajahMainDashboard = () => {
  const [todaysReviewCycles, setTodaysReviewCycles] = useState<ReviewCycle[]>([]);
  const [weeklyReviewCycles, setWeeklyReviewCycles] = useState<ReviewCycle[]>([]); // This might need re-evaluation based on new cycle generation
  const [memorizationSchedule, setMemorizationSchedule] = useState<ScheduleItem[]>([]);
  const [juzMemorization, setJuzMemorization] = useState<JuzMemorization[]>([]);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({ // Added reviewSettings state
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
    // Load review settings first as other data might depend on it for generation logic
    const savedSettings = localStorage.getItem('murajah-review-settings');
    if (savedSettings) {
      setReviewSettings(JSON.parse(savedSettings));
    }
    loadDashboardData(); // loadDashboardData might use reviewSettings, so ensure it's loaded or default is fine
    generateRandomVerses();
    calculateStreaks();
    generateAchievements();
  }, []);

  const loadDashboardData = () => {
    console.log('Loading dashboard data...');
    
    // Load Murajah review data
    // savedSettings is already loaded in useEffect
    const savedCompletions = localStorage.getItem('murajah-daily-completions'); // This will be used by new helper functions
    const savedJuz = localStorage.getItem('murajah-juz-memorization');

    // Load memorization planner data
    const savedSchedule = localStorage.getItem('memorizationPlannerSchedule');
    
    console.log('Saved juz:', savedJuz); // Settings already logged or available via state
    
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
        setJuzMemorization([]); // Set to empty array on error
      }
    }
    
    if (savedSchedule) {
      try {
        const scheduleData = JSON.parse(savedSchedule);
        setMemorizationSchedule(Array.isArray(scheduleData) ? scheduleData : []);
      } catch (error) {
        console.error('Error parsing memorization schedule:', error);
        setMemorizationSchedule([]);
      }
    }

    // Generate cycles using the new logic if settings and juzMemorization are available
    // Note: reviewSettings state might not be updated immediately after setReviewSettings from localStorage
    // So, we use the locally loaded savedSettings for the initial generation if available.
    const settingsToUse = localStorage.getItem('murajah-review-settings')
      ? JSON.parse(localStorage.getItem('murajah-review-settings')!)
      : reviewSettings; // reviewSettings state is used as a fallback

    if (currentJuzMemorization.length > 0 || Object.keys(settingsToUse).length > 0) { // Check if there's any data to process
      const today = new Date().toISOString().split('T')[0];
      const dailyCycles = generateDailyCycles(currentJuzMemorization, settingsToUse, today);
      setTodaysReviewCycles(dailyCycles);

      // For weekly cycles: This is a simplified approach.
      // The old logic for weekly cycles was tied to the old completions format.
      // A more robust weekly view would need to aggregate data based on the new completion format
      // or re-generate cycles for each day of the week.
      // For now, we'll just show today's cycles for the week view or leave it empty.
      // This part can be enhanced later.
      // const weekStart = startOfWeek(new Date());
      // const weekEnd = endOfWeek(new Date());
      // let tempWeeklyCycles: ReviewCycle[] = [];
      // todo: logic to populate weekly cycles if needed, for now, it's not directly supported by generateDailyCycles for a week.
      setWeeklyReviewCycles([]); // Clearing it as the old logic is not compatible.
    } else {
      setTodaysReviewCycles([]);
      setWeeklyReviewCycles([]);
    }
  };

  // --- START: Functions copied and adapted from MurajahDashboard.tsx ---

  const loadTodaysCompletions = (): { [cycleId: string]: boolean } => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('murajah-daily-completions');
    
    if (!savedData) return {};
    
    try {
      // Assuming new DailyCompletion format: { date: string; completions: { [cycleId: string]: boolean }; }[]
      const allCompletions: DailyCompletion[] = JSON.parse(savedData);
      const todaysData = allCompletions.find(d => d.date === today);
      return todaysData?.completions || {};
    } catch (error) {
      // Attempt to handle old format: { [date: string]: boolean[] } or DailyCompletion[] with boolean[]
      try {
        const oldFormatCompletions = JSON.parse(savedData);
        if (Array.isArray(oldFormatCompletions)) { // Old DailyCompletion[]
            const oldTodayData = oldFormatCompletions.find(d => d.date === today);
            if (oldTodayData && Array.isArray(oldTodayData.completions)) {
                // Convert boolean[] to { [cycleId: string]: boolean }
                // This requires knowing the cycle IDs for that day, which is tricky here.
                // For simplicity, if old format is detected, return empty or a basic mapping if possible.
                // This part might need more sophisticated migration logic outside this scope.
                console.warn("Old completion format detected and cannot be fully converted here.");
                return {};
            }
        } else if (typeof oldFormatCompletions === 'object' && oldFormatCompletions[today] && Array.isArray(oldFormatCompletions[today])) {
             // Old { [date: string]: boolean[] } format
             console.warn("Old completion format (date map to boolean[]) detected and cannot be fully converted here.");
             return {};
        }
      } catch (e) {
        // If secondary parsing fails, then it's likely a format we can't automatically handle here or corrupted.
        console.error('Error loading or converting completions:', error, e);
      }
      return {};
    }
  };

  const calculateRMV = (currentJuzMem: JuzMemorization[], currentSettings: ReviewSettings): string => {
    const targetJuz = currentJuzMem.find(j => j.juzNumber === currentSettings.currentJuz);
    if (!targetJuz || !targetJuz.startPage || !targetJuz.endPage) {
      // Try to find any memorized juz if currentJuz is not set or not found in details
      const anyMemorizedJuz = currentJuzMem.find(j => j.isMemorized && j.startPage && j.endPage);
      if (!anyMemorizedJuz || !anyMemorizedJuz.startPage || !anyMemorizedJuz.endPage) {
         return 'Set current Juz or ensure page numbers are available for RMV.';
      }
      // Use this anyMemorizedJuz instead
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

    // The original calculateOMV in MurajahDashboard.tsx had a more complex memorizationUnits structure
    // that included partial surah details. This simplified version only uses Juz display text.
    // If partial surah display for OMV is needed here, this function would need to be expanded
    // similar to its original version, using surahNames.
    // For now, this uses the simplified displayText from fully memorized Juz.
    const memorizationUnits: string[] = juzWithCompleteMemorization.map(juzMem => {
        const juzInfo = juzData[juzMem.juzNumber.toString() as keyof typeof JuzData];
        let displayText = `Juz ${juzMem.juzNumber}`;
        if (juzMem.startPage && juzMem.endPage) {
            displayText += ` (Pages ${juzMem.startPage}-${juzMem.endPage})`;
        } else if (juzInfo) { // Fallback to verse keys if no pages
            displayText += ` (${juzInfo.first_verse_key} - ${juzInfo.last_verse_key})`;
        }
        // Example of how surahNames could be used if we were detailing surahs:
        // if (juzMem.memorizedSurahs) { displayText += ` Surahs: ${juzMem.memorizedSurahs.map(id => surahNames[id.toString()]?.name_simple).join(', ')}` }
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
    const upperType = type.toUpperCase() as 'RMV' | 'OMV' | 'LISTENING' | 'READING';
    const baseId = type.toLowerCase();
    const juzForOMV = currentJuzMem.filter(j => j.isMemorized); // OMV, Listening, Reading typically use fully memorized Juz

    let content = '';
    let titleSuffix = '';

    switch (upperType) {
      case 'RMV':
        content = calculateRMV(currentJuzMem, currentSettings);
        titleSuffix = `(Last ${currentSettings.rmvPages} Pages)`;
        break;
      case 'OMV':
        content = calculateOMV(juzForOMV, currentSettings, originalDate); // Use originalDate for OMV calculation consistency
        titleSuffix = `(${currentSettings.omvJuz} Juz)`;
        break;
      case 'LISTENING':
        content = calculateListeningCycle(juzForOMV, currentSettings, originalDate);
        titleSuffix = `(${currentSettings.listeningJuz} Juz)`;
        break;
      case 'READING':
        content = calculateReadingCycle(juzForOMV, currentSettings, originalDate);
        titleSuffix = `(${currentSettings.readingJuz} Juz)`;
        break;
      default:
        return null;
    }
    if (!content || content.startsWith('No Juz') || content.startsWith('Set current Juz')) return null;

    const icons = {
        RMV: <Clock className="h-4 w-4" />,
        OMV: <RotateCcw className="h-4 w-4" />,
        LISTENING: <PlayCircle className="h-4 w-4" />,
        READING: <BookOpen className="h-4 w-4" />,
    };
    const colors = {
        RMV: 'bg-green-50 border-green-200',
        OMV: 'bg-purple-50 border-purple-200',
        LISTENING: 'bg-blue-50 border-blue-200',
        READING: 'bg-orange-50 border-orange-200',
    };

    return {
      id: `${baseId}-${originalDate}-carryover`,
      type: upperType,
      title: `${upperType} ${titleSuffix} - Carry-over`,
      content: content,
      startDate: originalDate, // Keep original start date for tracking
      completed: false, // Carry-over cycles are initially not completed
      icon: icons[upperType],
      color: colors[upperType],
    };
  };

  const getCarryOverCycles = (currentDateStr: string, currentJuzMem: JuzMemorization[], currentSettings: ReviewSettings): ReviewCycle[] => {
    const savedData = localStorage.getItem('murajah-daily-completions');
    if (!savedData) return [];
    try {
      const allCompletions: DailyCompletion[] = JSON.parse(savedData);
      const carryOvers: ReviewCycle[] = [];
      const currentDateObj = new Date(currentDateStr);

      for (let i = 1; i <= 7; i++) { // Check last 7 days
        const checkDate = new Date(currentDateObj);
        checkDate.setDate(currentDateObj.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];

        const dayData = allCompletions.find(d => d.date === checkDateStr);
        if (dayData && dayData.completions) {
          Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
            const cycleTypePart = cycleId.split('-')[0]; // e.g., "rmv" from "rmv-2023-10-26"
            if (!completed && !carryOvers.some(c => c.type === cycleTypePart.toUpperCase() as ReviewCycle['type'])) {
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

    // Filter for Juz that have some form of memorization for OMV, Listening, Reading.
    const juzForOMVTypeCycles = currentJuzMem.filter(j => j.isMemorized); // Typically OMV uses fully memorized Juz

    // Get carry-over cycles first
    const carryOverCycles = getCarryOverCycles(date, currentJuzMem, currentSettings);
    carryOverCycles.forEach(cycle => {
        // Ensure no duplicate type carry-overs
        if (!generatedCycles.some(c => c.type === cycle.type)) {
            generatedCycles.push({ ...cycle, completed: todayCompletions[cycle.id] || false });
        }
    });


    // Define standard cycle types and their generation logic
    const cycleDefinitions: { type: ReviewCycle['type'], titleSuffix: string, contentFn: () => string, icon: JSX.Element, color: string }[] = [
        { type: 'RMV', titleSuffix: `(Last ${currentSettings.rmvPages} Pages)`, contentFn: () => calculateRMV(currentJuzMem, currentSettings), icon: <Clock className="h-4 w-4" />, color: 'bg-green-50 border-green-200' },
        { type: 'OMV', titleSuffix: `(${currentSettings.omvJuz} Juz)`, contentFn: () => calculateOMV(juzForOMVTypeCycles, currentSettings, date), icon: <RotateCcw className="h-4 w-4" />, color: 'bg-purple-50 border-purple-200' },
        { type: 'Listening', titleSuffix: `(${currentSettings.listeningJuz} Juz)`, contentFn: () => calculateListeningCycle(juzForOMVTypeCycles, currentSettings, date), icon: <PlayCircle className="h-4 w-4" />, color: 'bg-blue-50 border-blue-200' },
        { type: 'Reading', titleSuffix: `(${currentSettings.readingJuz} Juz)`, contentFn: () => calculateReadingCycle(juzForOMVTypeCycles, currentSettings, date), icon: <BookOpen className="h-4 w-4" />, color: 'bg-orange-50 border-orange-200' },
    ];

    cycleDefinitions.forEach(def => {
        // If a carry-over of this type already exists, don't add a new one for today
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

  // --- END: Functions copied and adapted from MurajahDashboard.tsx ---

  // Removing old generateReviewCycles and createReviewCycle
  /*
  const generateReviewCycles = (completions: any, settings: ReviewSettings, juzMem: JuzMemorization[]) => {
    // This function will be removed
    console.log("Old generateReviewCycles called, will be replaced.");
    const today = new Date().toISOString().split('T')[0];
    const todayCycles = createReviewCycle("RMV", false, settings, juzMem) ? [createReviewCycle("RMV", false, settings, juzMem)!] : [];
    setTodaysReviewCycles(todayCycles);
  };
  const createReviewCycle = (type: string, completed: boolean, settings?: ReviewSettings, juzMem?: JuzMemorization[]): ReviewCycle | null => {
    // This function will be removed
    console.log("Old createReviewCycle called, will be replaced.");
    if(!settings || !juzMem || juzMem.length === 0) return null;
    return {
      id: `${type.toLowerCase()}-${new Date().toISOString().split('T')[0]}`,
      type: type.toUpperCase() as ReviewCycle['type'],
      title: `${type} Title`,
      content: `${type} content`,
      startDate: new Date().toISOString().split('T')[0],
      completed: completed,
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-gray-50 border-gray-200'
    };
  };
  */

  const calculateStreaks = () => {
    const completions = localStorage.getItem('murajah-daily-completions'); // This will use the new DailyCompletion format
    if (!completions) {
      console.log('No completions data for streak calculation');
      return;
    }

    try {
      const data = JSON.parse(completions);
      console.log('Calculating streaks with data:', data, 'Type:', typeof data);
      
      let streak = 0;
      const today = new Date();
      
      // Handle different data formats for streak calculation
      let completionsData: { [date: string]: boolean[] } = {};
      
      if (Array.isArray(data)) {
        // Convert array format to object format
        data.forEach((item: DailyCompletion) => {
          if (item.date && item.completions) {
            completionsData[item.date] = item.completions;
          }
        });
      } else if (data.date && data.completions) {
        // Single day format
        completionsData[data.date] = data.completions;
      } else if (typeof data === 'object') {
        // Already in object format
        completionsData = data;
      }
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayCompletions = completionsData[dateStr];
        if (dayCompletions && Array.isArray(dayCompletions)) {
          const allCompleted = dayCompletions.every(c => c === true);
          if (allCompleted) {
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
      // Fallback: if no surahs memorized, use verses from Surah Al-Fatihah (1) and Al-Baqarah (2) up to certain verses
      versesForPractice = allVerses.filter(verse => verse.surah === 1 || (verse.surah === 2 && verse.ayah <= 20));
    }

    if (versesForPractice.length === 0 && allVerses.length > 0) {
        // Ultimate fallback: first 5 verses of the Quran if previous logic yielded nothing
        versesForPractice = allVerses.slice(0,5);
    }

    const shuffled = versesForPractice.sort(() => 0.5 - Math.random());
    setRandomVerses(shuffled.slice(0, 5)); // Show up to 5 random verses
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
  }, [juzMemorization]); // Recalculate only when juzMemorization changes

  const totalQuranProgress = (totalJuzMemorized / 30) * 100;
  
  const todaysMemorizationTask = memorizationSchedule.find(item => 
    isToday(parseISO(item.date)) && !item.completed
  );
  
  const upcomingMemorizationTasks = React.useMemo(() => {
    const uncompletedTasks = memorizationSchedule.filter(item => !item.completed);
    return uncompletedTasks.slice(1, 6); // Skip today's task, get next 5
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
                      {/* Wrapped title and content in a div for better layout control */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {cycle.icon}
                          <span className="font-medium">{cycle.title}</span>
                        </div>
                        {/* Added p tag for cycle.content */}
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
                Today's Memorization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysMemorizationTask ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="font-medium">{todaysMemorizationTask.task}</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(todaysMemorizationTask.date), "EEEE, MMM d, yyyy")}
                    </p>
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
              {/* Updated to use PracticeVerseCard */}
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
