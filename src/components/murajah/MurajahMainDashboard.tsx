
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, RotateCcw, PlayCircle, BookOpen, Target, TrendingUp, CheckCircle2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReviewCycle {
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading';
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

export const MurajahMainDashboard = () => {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [stats, setStats] = useState({
    streak: 0,
    totalCompleted: 0,
    weeklyCompletion: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    console.log('Loading dashboard data...');
    
    try {
      const savedJuz = localStorage.getItem('murajah-juz-memorization');
      const savedSettings = localStorage.getItem('murajah-review-settings');
      
      console.log('Saved juz:', savedJuz);
      
      if (savedJuz && savedSettings) {
        const juzMemorization: JuzMemorization[] = JSON.parse(savedJuz);
        const settings: ReviewSettings = JSON.parse(savedSettings);
        
        const today = new Date().toISOString().split('T')[0];
        const todaysCycles = generateDailyCycles(juzMemorization, settings, today);
        setCycles(todaysCycles);
        
        // Calculate stats
        calculateStats();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadTodaysCompletions = (): { [cycleId: string]: boolean } => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('murajah-daily-completions');
    
    if (!savedData) return {};
    
    try {
      const allCompletions = JSON.parse(savedData);
      
      // Ensure allCompletions is an array
      if (!Array.isArray(allCompletions)) {
        console.error('Error loading completions: data is not an array', allCompletions);
        return {};
      }
      
      const todaysData = allCompletions.find((d: DailyCompletion) => d.date === today);
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
        const parsed = JSON.parse(savedData);
        // Ensure it's an array
        if (Array.isArray(parsed)) {
          allCompletions = parsed;
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
  };

  const calculateStats = () => {
    try {
      const savedData = localStorage.getItem('murajah-daily-completions');
      if (!savedData) {
        setStats({ streak: 0, totalCompleted: 0, weeklyCompletion: 0 });
        return;
      }

      const allCompletions = JSON.parse(savedData);
      
      // Ensure it's an array
      if (!Array.isArray(allCompletions)) {
        console.error('Error calculating stats: data is not an array');
        setStats({ streak: 0, totalCompleted: 0, weeklyCompletion: 0 });
        return;
      }

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayData = allCompletions.find((d: DailyCompletion) => d.date === dateStr);
        if (dayData && Object.values(dayData.completions).some(completed => completed)) {
          streak++;
        } else {
          break;
        }
      }

      // Calculate total completed cycles
      const totalCompleted = allCompletions.reduce((total: number, day: DailyCompletion) => {
        return total + Object.values(day.completions).filter(Boolean).length;
      }, 0);

      // Calculate weekly completion rate
      const lastWeek = allCompletions.filter((d: DailyCompletion) => {
        const date = new Date(d.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      });

      const weeklyTotal = lastWeek.reduce((total: number, day: DailyCompletion) => {
        return total + Object.values(day.completions).length;
      }, 0);

      const weeklyCompleted = lastWeek.reduce((total: number, day: DailyCompletion) => {
        return total + Object.values(day.completions).filter(Boolean).length;
      }, 0);

      const weeklyCompletion = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

      console.log('Calculating streaks with data:', { date: allCompletions[0]?.date, completions: Object.values(allCompletions[0]?.completions || {}) }, 'Type:', typeof allCompletions);
      console.log('Calculated streak:', streak);

      setStats({ streak, totalCompleted, weeklyCompletion });
    } catch (error) {
      console.error('Error calculating stats:', error);
      setStats({ streak: 0, totalCompleted: 0, weeklyCompletion: 0 });
    }
  };

  const generateDailyCycles = (juzMemorization: JuzMemorization[], settings: ReviewSettings, date: string): ReviewCycle[] => {
    const cycles: ReviewCycle[] = [];
    
    // Get all memorized content
    const memorizedContent = juzMemorization.filter(j => 
      j.isMemorized || (j.memorizedSurahs && j.memorizedSurahs.length > 0)
    );

    if (memorizedContent.length === 0) return cycles;

    // Check for carry-overs from previous days
    const carryOvers = getCarryOverCycles(date);

    // Add carry-over cycles or generate new ones
    const rmvCarryOver = carryOvers.find(c => c.type === 'RMV');
    if (rmvCarryOver) {
      cycles.push(rmvCarryOver);
    } else {
      // Generate RMV cycle
      const rmvContent = `Juz ${settings.currentJuz} - Last ${settings.rmvPages} pages`;
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

    // Similar logic for other cycles...
    const omvCarryOver = carryOvers.find(c => c.type === 'OMV');
    if (omvCarryOver) {
      cycles.push(omvCarryOver);
    } else {
      cycles.push({
        type: 'OMV',
        title: `OMV (${settings.omvJuz} Juz)`,
        content: `Review ${settings.omvJuz} memorized Juz`,
        startDate: date,
        completed: false,
        icon: <RotateCcw className="h-4 w-4" />,
        color: 'bg-purple-50 border-purple-200',
        id: `omv-${date}`
      });
    }

    // Add Listening cycle
    const listeningCarryOver = carryOvers.find(c => c.type === 'Listening');
    if (listeningCarryOver) {
      cycles.push(listeningCarryOver);
    } else {
      cycles.push({
        type: 'Listening',
        title: `Listening (${settings.listeningJuz} Juz)`,
        content: `Listen to ${settings.listeningJuz} Juz`,
        startDate: date,
        completed: false,
        icon: <Headphones className="h-4 w-4" />,
        color: 'bg-blue-50 border-blue-200',
        id: `listening-${date}`
      });
    }

    // Add Reading cycle
    const readingCarryOver = carryOvers.find(c => c.type === 'Reading');
    if (readingCarryOver) {
      cycles.push(readingCarryOver);
    } else {
      cycles.push({
        type: 'Reading',
        title: `Reading (${settings.readingJuz} Juz)`,
        content: `Read ${settings.readingJuz} Juz`,
        startDate: date,
        completed: false,
        icon: <BookOpen className="h-4 w-4" />,
        color: 'bg-yellow-50 border-yellow-200',
        id: `reading-${date}`
      });
    }

    // Load completion status
    const completions = loadTodaysCompletions();
    return cycles.map(cycle => ({
      ...cycle,
      completed: completions[cycle.id] || false
    }));
  };

  const getCarryOverCycles = (currentDate: string): ReviewCycle[] => {
    const savedData = localStorage.getItem('murajah-daily-completions');
    if (!savedData) return [];

    try {
      const allCompletions = JSON.parse(savedData);
      
      // Ensure it's an array
      if (!Array.isArray(allCompletions)) {
        console.error('Error getting carry-over cycles: data is not an array');
        return [];
      }

      const carryOvers: ReviewCycle[] = [];
      const currentDateObj = new Date(currentDate);
      
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(currentDateObj);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        const dayData = allCompletions.find((d: DailyCompletion) => d.date === checkDateStr);
        if (dayData) {
          Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
            if (!completed && !carryOvers.some(c => c.type === cycleId.split('-')[0])) {
              // Create basic carry-over cycle with proper type casting
              const cyclePrefix = cycleId.split('-')[0];
              let cycleType: 'RMV' | 'OMV' | 'Listening' | 'Reading';
              
              if (cyclePrefix === 'rmv') {
                cycleType = 'RMV';
              } else if (cyclePrefix === 'omv') {
                cycleType = 'OMV';
              } else if (cyclePrefix === 'listening') {
                cycleType = 'Listening';
              } else if (cyclePrefix === 'reading') {
                cycleType = 'Reading';
              } else {
                return; // Skip unknown types
              }

              carryOvers.push({
                type: cycleType,
                title: `${cycleType} - Carry-over`,
                content: `Incomplete from ${checkDateStr}`,
                startDate: checkDateStr,
                completed: false,
                icon: <Clock className="h-4 w-4" />,
                color: 'bg-orange-50 border-orange-200',
                id: `${cycleId}-carryover`
              });
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

  const toggleCycleCompletion = (index: number) => {
    const newCycles = [...cycles];
    newCycles[index].completed = !newCycles[index].completed;
    setCycles(newCycles);

    const completions = newCycles.reduce((acc, cycle) => {
      acc[cycle.id] = cycle.completed;
      return acc;
    }, {} as { [cycleId: string]: boolean });
    
    saveTodaysCompletions(completions);
    calculateStats();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">{stats.streak}</span>
            </div>
            <p className="text-sm text-gray-600">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-blue-600">{stats.totalCompleted}</span>
            </div>
            <p className="text-sm text-gray-600">Total Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-purple-600">{stats.weeklyCompletion}%</span>
            </div>
            <p className="text-sm text-gray-600">Weekly Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Review Cycles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p>No review cycles generated. Check your memorization settings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cycles.map((cycle, index) => (
                <div key={cycle.id} className={`${cycle.color} p-4 rounded-lg transition-all duration-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cycle.completed ? 'bg-green-100' : 'bg-white'}`}>
                        {cycle.completed ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : cycle.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{cycle.title}</h4>
                        <p className="text-gray-600 text-sm">{cycle.content}</p>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
