import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, RotateCcw, PlayCircle, BookOpen, Clock, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { ReviewSettings } from "./ReviewSettings";
import juzData from "@/data/juz-numbers.json";
import surahNames from "@/data/surah-names.json";
import { ComprehensivePrintDialog } from "@/components/shared/ComprehensivePrintDialog";
import { PrintableMurajahCycles } from "./PrintableMurajahCycles";
import { PrintableMurajahSchedule } from "./PrintableMurajahSchedule";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MurajahTable } from "./MurajahTable";

interface ReviewCycle {
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading' | 'New';
  title: string;
  content: string;
  startDate: string;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
  id: string;
  isOverdue?: boolean;
  isPostponed?: boolean;
  postponedToDate?: string;
}

interface DailyCompletion {
  date: string;
  completions: { [cycleId: string]: boolean };
}

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
  memorizedSurahs?: number[]; // Array of surah IDs that are memorized within this juz
}

export const MurajahDashboard = () => {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [juzMemorization, setJuzMemorization] = useState<JuzMemorization[]>([]);
  const [postponedCycles, setPostponedCycles] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<ReviewSettings>({
    rmvPages: 7,
    omvJuz: 1,
    listeningJuz: 2,
    readingJuz: 1,
    currentJuz: 1,
    startDate: new Date().toISOString().split('T')[0]
  });

  const { user } = useAuth();

  // Load data from localStorage
  useEffect(() => {
    const savedJuz = localStorage.getItem('murajah-juz-memorization');
    const savedSettings = localStorage.getItem('murajah-review-settings');

    if (savedJuz) {
      setJuzMemorization(JSON.parse(savedJuz));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const getPostponedCycleIds = (date: string): Set<string> => {
    const postponedKey = 'murajah-postponed-cycles';
    const existingPostponed = localStorage.getItem(postponedKey);
    const postponedIds = new Set<string>();
    
    if (!existingPostponed) return postponedIds;
    
    try {
      const postponedCycles = JSON.parse(existingPostponed);
      postponedCycles.forEach((cycle: any) => {
        if (cycle.originalDate === date || cycle.postponedFromDate === date) {
          // Create the cycle ID that would match the original cycle
          const cycleId = `${cycle.type.toLowerCase()}-${cycle.originalDate}`;
          postponedIds.add(cycleId);
        }
      });
    } catch (error) {
      console.error('Error loading postponed cycle IDs:', error);
    }
    
    return postponedIds;
  };

  const postponeCycle = async (cycleIndex: number) => {
    const cycle = cycles[cycleIndex];
    if (cycle.completed || cycle.isPostponed) return; // Don't postpone completed or already postponed cycles

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Create clean postponed cycle data (without React components)
    const postponedCycle = {
      type: cycle.type,
      title: cycle.title,
      content: cycle.content,
      originalDate: cycle.startDate,
      targetDate: tomorrowStr,
      postponedFromDate: new Date().toISOString().split('T')[0],
      isPostponed: true
    };

    // Save postponed cycle to localStorage
    const postponedKey = 'murajah-postponed-cycles';
    const existingPostponed = localStorage.getItem(postponedKey);
    let postponedCycles = [];
    
    if (existingPostponed) {
      try {
        postponedCycles = JSON.parse(existingPostponed);
      } catch (error) {
        console.error('Error parsing postponed cycles:', error);
      }
    }

    postponedCycles.push(postponedCycle);
    localStorage.setItem(postponedKey, JSON.stringify(postponedCycles));

    // Save to Supabase if user is authenticated
    if (user) {
      try {
        await supabase
          .from('postponed_murajah_cycles')
          .insert({
            user_id: user.id,
            cycle_type: cycle.type,
            title: cycle.title,
            content: cycle.content,
            original_date: cycle.startDate,
            target_date: tomorrowStr,
            postponed_from_date: new Date().toISOString().split('T')[0]
          });
        
        console.log('Postponed cycle saved to Supabase');
      } catch (error) {
        console.error('Error saving postponed cycle to Supabase:', error);
      }
    }

    // Update the cycle in the current list to show it's postponed
    const updatedCycles = [...cycles];
    updatedCycles[cycleIndex] = {
      ...cycle,
      isPostponed: true,
      postponedToDate: tomorrowStr,
      title: cycle.title.includes('Postponed!') ? cycle.title : `${cycle.title} - Postponed!`
    };
    setCycles(updatedCycles);

    // Mark cycle as postponed in state
    setPostponedCycles(prev => new Set([...prev, cycle.id]));

    // Update today's completions to reflect the current state
    const completions = updatedCycles.reduce((acc, cycle) => {
      acc[cycle.id] = cycle.completed;
      return acc;
    }, {} as { [cycleId: string]: boolean });
    
    saveTodaysCompletions(completions);

    // Show success toast
    toast.success(`${cycle.title} postponed to tomorrow`, {
      description: "This cycle will appear in tomorrow's review list."
    });
  };

  const unPostponeCycle = async (cycleIndex: number) => {
    const cycle = cycles[cycleIndex];
    if (!cycle.isPostponed) return; // Only allow un-postponing of postponed cycles

    // Remove from postponed cycles in localStorage
    const postponedKey = 'murajah-postponed-cycles';
    const existingPostponed = localStorage.getItem(postponedKey);
    
    if (existingPostponed) {
      try {
        let postponedCycles = JSON.parse(existingPostponed);
        // Remove cycles that match this cycle's original data
        postponedCycles = postponedCycles.filter((postponedCycle: any) => {
          return !(
            postponedCycle.type === cycle.type &&
            postponedCycle.originalDate === cycle.startDate &&
            postponedCycle.content === cycle.content
          );
        });
        localStorage.setItem(postponedKey, JSON.stringify(postponedCycles));
      } catch (error) {
        console.error('Error removing postponed cycle from localStorage:', error);
      }
    }

    // Remove from Supabase if user is authenticated
    if (user) {
      try {
        await supabase
          .from('postponed_murajah_cycles')
          .delete()
          .eq('user_id', user.id)
          .eq('cycle_type', cycle.type)
          .eq('original_date', cycle.startDate)
          .eq('content', cycle.content);
        
        console.log('Postponed cycle removed from Supabase');
      } catch (error) {
        console.error('Error removing postponed cycle from Supabase:', error);
      }
    }

    // Update the cycle in the current list to show it's no longer postponed
    const updatedCycles = [...cycles];
    updatedCycles[cycleIndex] = {
      ...cycle,
      isPostponed: false,
      postponedToDate: undefined,
      title: cycle.title.replace(' - Postponed!', '')
    };
    setCycles(updatedCycles);

    // Remove cycle from postponed state
    setPostponedCycles(prev => {
      const newSet = new Set([...prev]);
      newSet.delete(cycle.id);
      return newSet;
    });

    // Update today's completions to reflect the current state
    const completions = updatedCycles.reduce((acc, cycle) => {
      acc[cycle.id] = cycle.completed;
      return acc;
    }, {} as { [cycleId: string]: boolean });
    
    saveTodaysCompletions(completions);

    // Show success toast
    toast.success(`${cycle.title.replace(' - Postponed!', '')} moved back to today`, {
      description: "This cycle is now available for completion today."
    });
  };

  const getPostponedCycles = (date: string): ReviewCycle[] => {
    const postponedKey = 'murajah-postponed-cycles';
    const existingPostponed = localStorage.getItem(postponedKey);
    
    if (!existingPostponed) return [];
    
    try {
      const postponedCycles = JSON.parse(existingPostponed);
      return postponedCycles
        .filter((cycle: any) => cycle.targetDate === date)
        .map((cycle: any) => ({
          type: cycle.type,
          title: cycle.title.includes('Postponed!') ? cycle.title : `${cycle.title} - Postponed!`,
          content: cycle.content,
          startDate: cycle.originalDate,
          completed: false,
          icon: getIconForCycleType(cycle.type),
          color: getColorForCycleType(cycle.type),
          id: `${cycle.type.toLowerCase()}-${cycle.originalDate}-postponed`,
          isPostponed: true,
          postponedToDate: cycle.targetDate
        }));
    } catch (error) {
      console.error('Error loading postponed cycles:', error);
      return [];
    }
  };

  const getIconForCycleType = (type: string) => {
    switch (type) {
      case 'RMV': return <Clock className="h-4 w-4" />;
      case 'OMV': return <RotateCcw className="h-4 w-4" />;
      case 'Listening': return <PlayCircle className="h-4 w-4" />;
      case 'Reading': return <BookOpen className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getColorForCycleType = (type: string) => {
    switch (type) {
      case 'RMV': return 'bg-green-50 border-green-200';
      case 'OMV': return 'bg-purple-50 border-purple-200';
      case 'Listening': return 'bg-blue-50 border-blue-200';
      case 'Reading': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Generate daily cycles based on current data
  useEffect(() => {
    if (juzMemorization.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Get postponed cycle IDs for today
    const todaysPostponedIds = getPostponedCycleIds(today);
    
    const newCycles = generateDailyCycles(juzMemorization, settings, today);
    
    // Add postponed cycles for today
    const postponedCycles = getPostponedCycles(today);
    const allCycles = [...newCycles, ...postponedCycles];
    
    // Load completion status for today
    const savedCompletions = loadTodaysCompletions();
    const cyclesWithStatus = allCycles.map(cycle => {
      // Check if this cycle was postponed
      const isPostponed = todaysPostponedIds.has(cycle.id) || cycle.isPostponed;
      
      return {
        ...cycle,
        completed: savedCompletions[cycle.id] || false,
        isPostponed,
        title: isPostponed && !cycle.title.includes('Postponed!') ? `${cycle.title} - Postponed!` : cycle.title,
        postponedToDate: isPostponed ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : cycle.postponedToDate
      };
    });
    
    setCycles(cyclesWithStatus);
    
    // Update postponed cycles state
    setPostponedCycles(todaysPostponedIds);
  }, [juzMemorization, settings]);

  const loadTodaysCompletions = (): { [cycleId: string]: boolean } => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('murajah-daily-completions');
    
    if (!savedData) return {};
    
    try {
      const allCompletions: DailyCompletion[] = JSON.parse(savedData);
      const todaysData = allCompletions.find(d => d.date === today);
      return todaysData?.completions || {};
    } catch (error) {
      console.error('Error loading completions:', error);
      return {};
    }
  };

  const saveTodaysCompletions = (completions: { [cycleId: string]: boolean }) => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('murajah-daily-completions');
    
    let allCompletions: DailyCompletion[] = [];
    if (savedData) {
      try {
        allCompletions = JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved completions:', error);
      }
    }

    // Update or add today's completions
    const todayIndex = allCompletions.findIndex(d => d.date === today);
    if (todayIndex >= 0) {
      allCompletions[todayIndex].completions = completions;
    } else {
      allCompletions.push({ date: today, completions });
    }

    localStorage.setItem('murajah-daily-completions', JSON.stringify(allCompletions));
  };

  const generateDailyCycles = (juzMem: JuzMemorization[], settings: ReviewSettings, date: string): ReviewCycle[] => {
    const cycles: ReviewCycle[] = [];
    
    // Get all Juz that have some memorization (either full Juz or individual surahs)
    const juzWithMemorization = juzMem.filter(j => 
      j.isMemorized || (j.memorizedSurahs && j.memorizedSurahs.length > 0)
    );

    if (juzWithMemorization.length === 0) return cycles;

    // Check for overdue cycles first
    const overdueCycles = getOverdueCycles(date);
    
    // If there are overdue cycles, only show those and don't generate new ones
    if (overdueCycles.length > 0) {
      return overdueCycles;
    }

    // Check for carry-overs from previous days (not overdue)
    const carryOvers = getCarryOverCycles(date);

    // RMV - Recent Memorization (Last X pages from current Juz)
    const rmvCarryOver = carryOvers.find(c => c.type === 'RMV');
    if (rmvCarryOver) {
      cycles.push(rmvCarryOver);
    } else {
      const rmvContent = calculateRMV(juzMem, settings);
      if (rmvContent) {
        cycles.push({
          type: 'RMV',
          title: `RMV (Last ${settings.rmvPages} Pages)`,
          content: rmvContent,
          startDate: date,
          completed: false,
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-green-50 border-green-200',
          id: `rmv-${date}`
        });
      }
    }

    // OMV - Old Memorization (Rotating through memorized Juz and partial Juz)
    const omvCarryOver = carryOvers.find(c => c.type === 'OMV');
    if (omvCarryOver) {
      cycles.push(omvCarryOver);
    } else {
      const omvContent = calculateOMV(juzWithMemorization, settings, date);
      if (omvContent) {
        cycles.push({
          type: 'OMV',
          title: `OMV (${settings.omvJuz} Juz)`,
          content: omvContent,
          startDate: date,
          completed: false,
          icon: <RotateCcw className="h-4 w-4" />,
          color: 'bg-purple-50 border-purple-200',
          id: `omv-${date}`
        });
      }
    }

    // Listening Cycle
    const listeningCarryOver = carryOvers.find(c => c.type === 'Listening');
    if (listeningCarryOver) {
      cycles.push(listeningCarryOver);
    } else {
      const listeningContent = calculateListeningCycle(juzWithMemorization, settings, date);
      if (listeningContent) {
        cycles.push({
          type: 'Listening',
          title: `Listening Cycle (${settings.listeningJuz} Juz)`,
          content: listeningContent,
          startDate: date,
          completed: false,
          icon: <PlayCircle className="h-4 w-4" />,
          color: 'bg-blue-50 border-blue-200',
          id: `listening-${date}`
        });
      }
    }

    // Reading Cycle
    const readingCarryOver = carryOvers.find(c => c.type === 'Reading');
    if (readingCarryOver) {
      cycles.push(readingCarryOver);
    } else {
      const readingContent = calculateReadingCycle(juzWithMemorization, settings, date);
      if (readingContent) {
        cycles.push({
          type: 'Reading',
          title: `Reading Cycle (${settings.readingJuz} Juz)`,
          content: readingContent,
          startDate: date,
          completed: false,
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-orange-50 border-orange-200',
          id: `reading-${date}`
        });
      }
    }

    return cycles;
  };

  const getOverdueCycles = (currentDate: string): ReviewCycle[] => {
    const savedData = localStorage.getItem('murajah-daily-completions');
    if (!savedData) return [];

    try {
      const allCompletions: DailyCompletion[] = JSON.parse(savedData);
      const overdueCycles: ReviewCycle[] = [];
      const currentDateObj = new Date(currentDate);
      
      // Check previous days for incomplete cycles
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(currentDateObj);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        const dayData = allCompletions.find(d => d.date === checkDateStr);
        if (dayData) {
          Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
            if (!completed && !overdueCycles.some(c => c.type === cycleId.split('-')[0].toUpperCase())) {
              const cycleType = cycleId.split('-')[0] as 'rmv' | 'omv' | 'listening' | 'reading';
              const overdueCycle = createOverdueCycle(cycleType, checkDateStr, currentDate);
              if (overdueCycle) {
                overdueCycles.push(overdueCycle);
              }
            }
          });
        }
      }

      return overdueCycles;
    } catch (error) {
      console.error('Error getting overdue cycles:', error);
      return [];
    }
  };

  const createOverdueCycle = (type: string, originalDate: string, currentDate: string): ReviewCycle | null => {
    const upperType = type.toUpperCase() as 'RMV' | 'OMV' | 'LISTENING' | 'READING';
    const memorizedJuz = juzMemorization.filter(j => j.isMemorized || (j.memorizedSurahs && j.memorizedSurahs.length > 0));
    const daysDiff = Math.floor((new Date(currentDate).getTime() - new Date(originalDate).getTime()) / (1000 * 60 * 60 * 24));
    
    switch (upperType) {
      case 'RMV':
        const rmvContent = calculateRMV(juzMemorization, settings);
        if (!rmvContent) return null;
        return {
          type: 'RMV',
          title: `RMV (Last ${settings.rmvPages} Pages)`,
          content: rmvContent,
          startDate: originalDate,
          completed: false,
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-red-50 border-red-200',
          id: `rmv-${originalDate}-overdue`,
          isOverdue: true
        };
      case 'OMV':
        const omvContent = calculateOMV(memorizedJuz, settings, originalDate);
        if (!omvContent) return null;
        return {
          type: 'OMV',
          title: `OMV (${settings.omvJuz} Juz)`,
          content: omvContent,
          startDate: originalDate,
          completed: false,
          icon: <RotateCcw className="h-4 w-4" />,
          color: 'bg-red-50 border-red-200',
          id: `omv-${originalDate}-overdue`,
          isOverdue: true
        };
      case 'LISTENING':
        const listeningContent = calculateListeningCycle(memorizedJuz, settings, originalDate);
        if (!listeningContent) return null;
        return {
          type: 'Listening',
          title: `Listening Cycle (${settings.listeningJuz} Juz)`,
          content: listeningContent,
          startDate: originalDate,
          completed: false,
          icon: <PlayCircle className="h-4 w-4" />,
          color: 'bg-red-50 border-red-200',
          id: `listening-${originalDate}-overdue`,
          isOverdue: true
        };
      case 'READING':
        const readingContent = calculateReadingCycle(memorizedJuz, settings, originalDate);
        if (!readingContent) return null;
        return {
          type: 'Reading',
          title: `Reading Cycle (${settings.readingJuz} Juz)`,
          content: readingContent,
          startDate: originalDate,
          completed: false,
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-red-50 border-red-200',
          id: `reading-${originalDate}-overdue`,
          isOverdue: true
        };
      default:
        return null;
    }
  };

  const getCarryOverCycles = (currentDate: string): ReviewCycle[] => {
    const savedData = localStorage.getItem('murajah-daily-completions');
    if (!savedData) return [];

    try {
      const allCompletions: DailyCompletion[] = JSON.parse(savedData);
      const carryOvers: ReviewCycle[] = [];
      const currentDateObj = new Date(currentDate);
      
      // Only check yesterday for carry-overs (not overdue)
      const yesterday = new Date(currentDateObj);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const dayData = allCompletions.find(d => d.date === yesterdayStr);
      if (dayData) {
        Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
          if (!completed && !carryOvers.some(c => c.type === cycleId.split('-')[0].toUpperCase())) {
            const cycleType = cycleId.split('-')[0] as 'rmv' | 'omv' | 'listening' | 'reading';
            const carryOverCycle = createCarryOverCycle(cycleType, yesterdayStr, currentDate);
            if (carryOverCycle) {
              carryOvers.push(carryOverCycle);
            }
          }
        });
      }

      return carryOvers;
    } catch (error) {
      console.error('Error getting carry-over cycles:', error);
      return [];
    }
  };

  const createCarryOverCycle = (type: string, originalDate: string, currentDate: string): ReviewCycle | null => {
    const upperType = type.toUpperCase() as 'RMV' | 'OMV' | 'LISTENING' | 'READING';
    const memorizedJuz = juzMemorization.filter(j => j.isMemorized || (j.memorizedSurahs && j.memorizedSurahs.length > 0));
    
    switch (upperType) {
      case 'RMV':
        const rmvContent = calculateRMV(juzMemorization, settings);
        if (!rmvContent) return null;
        return {
          type: 'RMV',
          title: `RMV (Last ${settings.rmvPages} Pages) - Carry-over`,
          content: rmvContent,
          startDate: originalDate,
          completed: false,
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-green-50 border-green-200',
          id: `rmv-${originalDate}-carryover`
        };
      case 'OMV':
        const omvContent = calculateOMV(memorizedJuz, settings, originalDate);
        if (!omvContent) return null;
        return {
          type: 'OMV',
          title: `OMV (${settings.omvJuz} Juz) - Carry-over`,
          content: omvContent,
          startDate: originalDate,
          completed: false,
          icon: <RotateCcw className="h-4 w-4" />,
          color: 'bg-purple-50 border-purple-200',
          id: `omv-${originalDate}-carryover`
        };
      case 'LISTENING':
        const listeningContent = calculateListeningCycle(memorizedJuz, settings, originalDate);
        if (!listeningContent) return null;
        return {
          type: 'Listening',
          title: `Listening Cycle (${settings.listeningJuz} Juz) - Carry-over`,
          content: listeningContent,
          startDate: originalDate,
          completed: false,
          icon: <PlayCircle className="h-4 w-4" />,
          color: 'bg-blue-50 border-blue-200',
          id: `listening-${originalDate}-carryover`
        };
      case 'READING':
        const readingContent = calculateReadingCycle(memorizedJuz, settings, originalDate);
        if (!readingContent) return null;
        return {
          type: 'Reading',
          title: `Reading Cycle (${settings.readingJuz} Juz) - Carry-over`,
          content: readingContent,
          startDate: originalDate,
          completed: false,
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-orange-50 border-orange-200',
          id: `reading-${originalDate}-carryover`
        };
      default:
        return null;
    }
  };

  const calculateRMV = (juzMem: JuzMemorization[], settings: ReviewSettings): string => {
    // Find the current Juz being worked on
    const currentJuzMem = juzMem.find(j => j.juzNumber === settings.currentJuz);
    if (!currentJuzMem || !currentJuzMem.startPage || !currentJuzMem.endPage) {
      return '';
    }

    const maxPage = currentJuzMem.endPage;
    const minPage = currentJuzMem.startPage;
    const startPage = Math.max(maxPage - settings.rmvPages + 1, minPage);

    return `Juz ${settings.currentJuz} - Pages (${startPage}-${maxPage})`;
  };

  const calculateOMV = (juzWithMemorization: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    if (juzWithMemorization.length === 0) return '';

    // Get all available memorization units (full juz + partial juz with individual surahs)
    const memorizationUnits: Array<{
      type: 'full_juz' | 'partial_juz';
      juzNumber: number;
      surahIds?: number[];
      displayText: string;
    }> = [];

    juzWithMemorization.forEach(juzMem => {
      if (juzMem.isMemorized) {
        // Full juz memorized
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
        // Partial juz with individual surahs
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

    if (memorizationUnits.length === 0) return '';

    // Calculate rotation based on date
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

  const calculateListeningCycle = (juzWithMemorization: JuzMemorization[],  settings: ReviewSettings, date: string): string => {
    return calculateOMV(juzWithMemorization, { ...settings, omvJuz: settings.listeningJuz }, date);
  };

  const calculateReadingCycle = (juzWithMemorization: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    return calculateOMV(juzWithMemorization, { ...settings, omvJuz: settings.readingJuz }, date);
  };

  const toggleCycleCompletion = (index: number) => {
    const newCycles = [...cycles];
    newCycles[index].completed = !newCycles[index].completed;
    setCycles(newCycles);

    // Save completion status to localStorage
    const completions = newCycles.reduce((acc, cycle) => {
      acc[cycle.id] = cycle.completed;
      return acc;
    }, {} as { [cycleId: string]: boolean });
    
    saveTodaysCompletions(completions);
  };

  // Add a function to generate future murajah schedule for printing
  const generateMurajahSchedule = () => {
    const schedule = [];
    const today = new Date();
    
    // Generate schedule for the next 180 days (6 months)
    for (let i = 0; i < 180; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyCycles = generateDailyCycles(juzMemorization, settings, dateStr);
      
      dailyCycles.forEach(cycle => {
        schedule.push({
          date: dateStr,
          task: `${cycle.title}: ${cycle.content}`,
          type: cycle.type,
          completed: false,
          title: cycle.title,
          content: cycle.content
        });
      });
    }
    
    return schedule;
  };

  // Updated condition to check for any memorized content (full Juz or individual surahs)
  if (juzMemorization.filter(j => j.isMemorized || (j.memorizedSurahs && j.memorizedSurahs.length > 0)).length === 0) {
    return (
      <Card className="text-center py-8 sm:py-12 mx-4 sm:mx-0">
        <CardContent className="p-4 sm:p-6">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Memorized Content</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            Mark your memorized Juz or individual Surahs in the Juz tab to generate your daily review cycles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Review Cycles</h2>
              <p className="text-sm sm:text-base text-gray-600">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Based on start date: {new Date(settings.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {cycles.filter(c => c.completed).length}/{cycles.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Completed</div>
              </div>
              <ComprehensivePrintDialog
                murajah={{
                  schedule: generateMurajahSchedule(),
                  component: PrintableMurajahSchedule
                }}
                todaysMurajah={{
                  data: cycles,
                  component: PrintableMurajahCycles
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Cycles */}
      <div className="grid gap-3 sm:gap-4">
        {cycles.map((cycle, index) => (
          <Card key={cycle.id} className={`${cycle.color} transition-all duration-200 ${cycle.completed ? 'opacity-75' : ''} ${cycle.isPostponed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${cycle.completed ? 'bg-green-100' : 'bg-white'}`}>
                    {cycle.completed ? <CheckCircle className="h-4 w-4 text-green-600" /> : cycle.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base break-words">{cycle.title}</h3>
                    <p className="text-gray-600 text-sm break-words">{cycle.content}</p>
                    {cycle.startDate !== new Date().toISOString().split('T')[0] && !cycle.isPostponed && (
                      <p className="text-xs text-orange-600 mt-1">
                        {cycle.isOverdue ? 'Overdue from' : 'Carried over from'} {new Date(cycle.startDate).toLocaleDateString()}
                      </p>
                    )}
                    {cycle.isPostponed && cycle.postponedToDate && (
                      <p className="text-xs text-blue-600 mt-1">
                        Postponed to {new Date(cycle.postponedToDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  {cycle.isOverdue && (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                  {cycle.isPostponed && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                      Postponed
                    </Badge>
                  )}
                  {!cycle.isPostponed && (
                    <Badge variant={cycle.completed ? "default" : "outline"} className="text-xs">
                      {cycle.completed ? "Completed" : "Pending"}
                    </Badge>
                  )}
                  {cycle.isPostponed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unPostponeCycle(index)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300 text-xs px-2 py-1"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Un-postpone</span>
                      <span className="sm:hidden">Undo</span>
                    </Button>
                  )}
                  {!cycle.completed && !cycle.isPostponed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => postponeCycle(index)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300 text-xs px-2 py-1"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Postpone
                    </Button>
                  )}
                  {!cycle.isPostponed && (
                    <Button
                      variant={cycle.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCycleCompletion(index)}
                      className="text-xs px-3 py-1"
                    >
                      {cycle.completed ? "Undo" : "Complete"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cycles.length === 0 && (
        <Card className="text-center py-6 sm:py-8">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-500">
              Configure your settings and mark memorized Juz or individual Surahs to generate review cycles.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 30-Day Schedule Table */}
      <MurajahTable juzMemorization={juzMemorization} settings={settings} />
    </div>
  );
};
