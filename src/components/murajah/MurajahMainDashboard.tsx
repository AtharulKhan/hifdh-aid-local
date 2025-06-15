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

interface ReviewCycle {
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading';
  title: string;
  content: string;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
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
  const [currentStreak, setCurrentStreak] = useState(0);
  const [randomVerses, setRandomVerses] = useState<QuranVerse[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadDashboardData();
    generateRandomVerses();
    calculateStreaks();
    generateAchievements();
  }, []);

  const loadDashboardData = () => {
    console.log('Loading dashboard data...');
    
    // Load Murajah review data
    const savedCompletions = localStorage.getItem('murajah-daily-completions');
    const savedJuz = localStorage.getItem('murajah-juz-memorization');
    const savedSettings = localStorage.getItem('murajah-review-settings');
    
    // Load memorization planner data
    const savedSchedule = localStorage.getItem('memorizationPlannerSchedule');
    
    console.log('Saved completions:', savedCompletions);
    console.log('Saved schedule:', savedSchedule);
    console.log('Saved juz:', savedJuz);
    
    if (savedJuz) {
      try {
        const juzData = JSON.parse(savedJuz);
        console.log('Parsed juz data:', juzData);
        setJuzMemorization(Array.isArray(juzData) ? juzData : []);
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

    if (savedCompletions) {
      try {
        const completions = JSON.parse(savedCompletions);
        console.log('Parsed completions data:', completions, 'Type:', typeof completions);
        
        // Handle both array and object formats
        let completionsArray = [];
        if (Array.isArray(completions)) {
          completionsArray = completions;
        } else if (completions && typeof completions === 'object') {
          // Convert object format to array format
          completionsArray = Object.keys(completions).map(date => ({
            date,
            completions: completions[date]
          }));
        }
        
        console.log('Completions array:', completionsArray);
        
        if (savedSettings && savedJuz) {
          const settings = JSON.parse(savedSettings);
          const juzMem = JSON.parse(savedJuz);
          generateReviewCycles(completionsArray, settings, juzMem);
        }
      } catch (error) {
        console.error('Error parsing dashboard data:', error);
        setTodaysReviewCycles([]);
        setWeeklyReviewCycles([]);
      }
    } else {
      console.log('No saved completions found');
      setTodaysReviewCycles([]);
      setWeeklyReviewCycles([]);
    }
  };

  const generateReviewCycles = (completions: any[], settings: any, juzMem: JuzMemorization[]) => {
    console.log('Generating review cycles with:', { completions, settings, juzMem });
    
    if (!Array.isArray(completions)) {
      console.warn('Expected completions to be an array, got:', typeof completions);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());

    console.log('Looking for today:', today);

    // Get today's cycles
    const todayData = completions.find(d => d && d.date === today);
    console.log('Today data found:', todayData);
    
    const todayCycles: ReviewCycle[] = [];
    
    if (todayData && todayData.completions) {
      Object.entries(todayData.completions).forEach(([cycleId, completed]) => {
        const [cycleType] = cycleId.split('-');
        const cycle = createReviewCycle(cycleType, completed as boolean);
        if (cycle) todayCycles.push(cycle);
      });
    }

    console.log('Today cycles:', todayCycles);

    // Get this week's cycles
    const weekCycles: ReviewCycle[] = [];
    completions.forEach(dayData => {
      if (!dayData || !dayData.date || !dayData.completions) return;
      
      const date = new Date(dayData.date);
      if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
        Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
          const [cycleType] = cycleId.split('-');
          const cycle = createReviewCycle(cycleType, completed as boolean);
          if (cycle && !weekCycles.some(c => c.type === cycle.type)) {
            weekCycles.push(cycle);
          }
        });
      }
    });

    console.log('Week cycles:', weekCycles);

    setTodaysReviewCycles(todayCycles);
    setWeeklyReviewCycles(weekCycles);
  };

  const createReviewCycle = (type: string, completed: boolean): ReviewCycle | null => {
    const upperType = type.toUpperCase() as 'RMV' | 'OMV' | 'LISTENING' | 'READING';
    
    switch (upperType) {
      case 'RMV':
        return {
          type: 'RMV',
          title: 'RMV (Recent)',
          content: 'Recent memorization review',
          completed,
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-green-50 border-green-200'
        };
      case 'OMV':
        return {
          type: 'OMV',
          title: 'OMV (Old)',
          content: 'Old memorization review',
          completed,
          icon: <RotateCcw className="h-4 w-4" />,
          color: 'bg-purple-50 border-purple-200'
        };
      case 'LISTENING':
        return {
          type: 'Listening',
          title: 'Listening Cycle',
          content: 'Audio review session',
          completed,
          icon: <PlayCircle className="h-4 w-4" />,
          color: 'bg-blue-50 border-blue-200'
        };
      case 'READING':
        return {
          type: 'Reading',
          title: 'Reading Cycle',
          content: 'Reading review session',
          completed,
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-orange-50 border-orange-200'
        };
      default:
        return null;
    }
  };

  const calculateStreaks = () => {
    const completions = localStorage.getItem('murajah-daily-completions');
    if (!completions) {
      console.log('No completions data for streak calculation');
      return;
    }

    try {
      const data = JSON.parse(completions);
      console.log('Calculating streaks with data:', data, 'Type:', typeof data);
      
      let completionsArray = [];
      if (Array.isArray(data)) {
        completionsArray = data;
      } else if (data && typeof data === 'object') {
        // Convert object format to array format
        completionsArray = Object.keys(data).map(date => ({
          date,
          completions: data[date]
        }));
      } else {
        console.warn('Expected streak data to be an array or object');
        return;
      }
      
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayData = completionsArray.find((d: any) => d && d.date === dateStr);
        if (dayData && dayData.completions) {
          const allCompleted = Object.values(dayData.completions).every(c => c === true);
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
    const memorizedPages = new Set<number>();
    
    // Get all memorized pages from Juz data
    juzMemorization.forEach(juzMem => {
      if (juzMem.isMemorized && juzMem.startPage && juzMem.endPage) {
        for (let i = juzMem.startPage; i <= juzMem.endPage; i++) {
          memorizedPages.add(i);
        }
      }
    });

    // For now, if no specific memorized verses, show random verses from first 5 surahs
    const sampleVerses = allVerses.filter(verse => verse.surah <= 5);
    const shuffled = sampleVerses.sort(() => 0.5 - Math.random());
    setRandomVerses(shuffled.slice(0, 5));
  };

  // Calculate statistics
  const totalJuzMemorized = juzMemorization.filter(j => j.isMemorized).length;
  const totalSurahsMemorized = juzMemorization.reduce((acc, j) => 
    acc + (j.memorizedSurahs?.length || 0), 0
  );
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
                      <div className="flex items-center gap-2">
                        {cycle.icon}
                        <span className="font-medium">{cycle.title}</span>
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
                <p className="text-gray-500">No review cycles for today</p>
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
                <p className="text-gray-500">No memorization task for today</p>
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
                <div key={verse.id} className="p-4 rounded-lg bg-gray-50 border">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">
                      Surah {verse.surah}, Ayah {verse.ayah}
                    </Badge>
                    <span className="text-sm text-gray-500">Verse {verse.verse_key}</span>
                  </div>
                  <p className="text-right text-lg leading-relaxed font-arabic" dir="rtl">
                    {verse.text}
                  </p>
                </div>
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
