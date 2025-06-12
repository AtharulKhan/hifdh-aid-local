
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, RotateCcw, PlayCircle, BookOpen, Clock } from "lucide-react";
import { ReviewSettings } from "./ReviewSettings";
import juzData from "@/data/juz-numbers.json";

interface ReviewCycle {
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading' | 'New';
  title: string;
  content: string;
  startDate: string;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
  id: string;
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
}

export const MurajahDashboard = () => {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [juzMemorization, setJuzMemorization] = useState<JuzMemorization[]>([]);
  const [settings, setSettings] = useState<ReviewSettings>({
    rmvPages: 7,
    omvJuz: 1,
    listeningJuz: 2,
    readingJuz: 1,
    currentJuz: 1,
    startDate: new Date().toISOString().split('T')[0]
  });

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

  // Generate daily cycles based on current data
  useEffect(() => {
    if (juzMemorization.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const newCycles = generateDailyCycles(juzMemorization, settings, today);
    
    // Load completion status for today
    const savedCompletions = loadTodaysCompletions();
    const cyclesWithStatus = newCycles.map(cycle => ({
      ...cycle,
      completed: savedCompletions[cycle.id] || false
    }));
    
    setCycles(cyclesWithStatus);
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
    const memorizedJuz = juzMem.filter(j => j.isMemorized);

    if (memorizedJuz.length === 0) return cycles;

    // Check for carry-overs from previous days
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

    // OMV - Old Memorization (Rotating through memorized Juz)
    const omvCarryOver = carryOvers.find(c => c.type === 'OMV');
    if (omvCarryOver) {
      cycles.push(omvCarryOver);
    } else {
      const omvContent = calculateOMV(memorizedJuz, settings, date);
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
      const listeningContent = calculateListeningCycle(memorizedJuz, settings, date);
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
      const readingContent = calculateReadingCycle(memorizedJuz, settings, date);
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

  const getCarryOverCycles = (currentDate: string): ReviewCycle[] => {
    const savedData = localStorage.getItem('murajah-daily-completions');
    if (!savedData) return [];

    try {
      const allCompletions: DailyCompletion[] = JSON.parse(savedData);
      const carryOvers: ReviewCycle[] = [];

      // Look for incomplete cycles from previous days
      const currentDateObj = new Date(currentDate);
      
      for (let i = 1; i <= 7; i++) { // Check last 7 days for incomplete cycles
        const checkDate = new Date(currentDateObj);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        const dayData = allCompletions.find(d => d.date === checkDateStr);
        if (dayData) {
          Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
            if (!completed && !carryOvers.some(c => c.type === cycleId.split('-')[0].toUpperCase())) {
              // Create carry-over cycle based on the incomplete cycle
              const cycleType = cycleId.split('-')[0] as 'rmv' | 'omv' | 'listening' | 'reading';
              const carryOverCycle = createCarryOverCycle(cycleType, checkDateStr, currentDate);
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

  const createCarryOverCycle = (type: string, originalDate: string, currentDate: string): ReviewCycle | null => {
    const upperType = type.toUpperCase() as 'RMV' | 'OMV' | 'LISTENING' | 'READING';
    const memorizedJuz = juzMemorization.filter(j => j.isMemorized);
    
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

  const calculateOMV = (memorizedJuz: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    if (memorizedJuz.length === 0) return '';

    // Calculate days since start date for rotation
    const startDate = new Date(settings.startDate);
    const currentDate = new Date(date);
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Ensure we have a positive cycle index
    const cycleIndex = Math.max(0, daysSinceStart) % memorizedJuz.length;
    
    const selectedJuz = [];
    for (let i = 0; i < settings.omvJuz && i < memorizedJuz.length; i++) {
      const juzIndex = (cycleIndex + i) % memorizedJuz.length;
      selectedJuz.push(memorizedJuz[juzIndex]);
    }

    return selectedJuz.map(juzMem => {
      const juzNumber = juzMem.juzNumber;
      const juz = juzData[juzNumber.toString() as keyof typeof juzData];
      
      // Prioritize page range if both start and end pages are set
      if (juzMem.startPage && juzMem.endPage) {
        return `Juz ${juzNumber} (Pages ${juzMem.startPage}-${juzMem.endPage})`;
      } 
      // Fallback to verse range if juz data exists
      else if (juz) {
        return `Juz ${juzNumber} (${juz.first_verse_key} - ${juz.last_verse_key})`;
      } 
      // Final fallback to just juz number
      else {
        return `Juz ${juzNumber}`;
      }
    }).filter(content => content).join(', ');
  };

  const calculateListeningCycle = (memorizedJuz: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    return calculateOMV(memorizedJuz, { ...settings, omvJuz: settings.listeningJuz }, date);
  };

  const calculateReadingCycle = (memorizedJuz: JuzMemorization[], settings: ReviewSettings, date: string): string => {
    return calculateOMV(memorizedJuz, { ...settings, omvJuz: settings.readingJuz }, date);
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

  if (juzMemorization.filter(j => j.isMemorized).length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Memorized Juz</h3>
          <p className="text-gray-500 mb-4">
            Mark your memorized Juz in the Juz tab to generate your daily review cycles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Today's Review Cycles</h2>
              <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p className="text-sm text-gray-500 mt-1">
                Based on start date: {new Date(settings.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {cycles.filter(c => c.completed).length}/{cycles.length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Cycles */}
      <div className="grid gap-4">
        {cycles.map((cycle, index) => (
          <Card key={cycle.id} className={`${cycle.color} transition-all duration-200 ${cycle.completed ? 'opacity-75' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cycle.completed ? 'bg-green-100' : 'bg-white'}`}>
                    {cycle.completed ? <CheckCircle className="h-4 w-4 text-green-600" /> : cycle.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cycle.title}</h3>
                    <p className="text-gray-600">{cycle.content}</p>
                    {cycle.startDate !== new Date().toISOString().split('T')[0] && (
                      <p className="text-xs text-orange-600 mt-1">
                        Carried over from {new Date(cycle.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cycle.completed ? "default" : "outline"}>
                    {cycle.completed ? "Completed" : "Pending"}
                  </Badge>
                  <Button
                    variant={cycle.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCycleCompletion(index)}
                  >
                    {cycle.completed ? "Undo" : "Complete"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cycles.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500">
              Configure your settings and mark memorized Juz to generate review cycles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
