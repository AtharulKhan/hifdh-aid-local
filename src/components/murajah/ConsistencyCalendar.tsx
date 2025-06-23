import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Flame, Trophy } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, isSameDay, startOfDay } from 'date-fns';

interface DailyActivity {
  date: string;
  reviewCompleted: boolean;
  memorizationCompleted: boolean;
  totalTasks: number;
  completedTasks: number;
}

interface ConsistencyCalendarProps {
  dailyCompletions?: Array<{
    date: string;
    completions: { [cycleId: string]: boolean };
  }>;
  memorizationSchedule?: Array<{
    date: string;
    completed: boolean;
  }>;
  currentStreak: number;
}

export const ConsistencyCalendar: React.FC<ConsistencyCalendarProps> = ({
  dailyCompletions = [],
  memorizationSchedule = [],
  currentStreak = 0
}) => {
  const activityData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 364); // 365 days including today
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    
    return dateRange.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check review completions for this date
      const dayCompletions = dailyCompletions.find(d => d.date === dateStr);
      const reviewTasks = dayCompletions ? Object.values(dayCompletions.completions) : [];
      const reviewCompleted = reviewTasks.length > 0 && reviewTasks.every(task => task);
      
      // Check memorization completion for this date
      const memorizationTask = memorizationSchedule.find(task => 
        task.date === dateStr || isSameDay(new Date(task.date), date)
      );
      const memorizationCompleted = memorizationTask?.completed || false;
      
      const totalTasks = reviewTasks.length + (memorizationTask ? 1 : 0);
      const completedTasks = reviewTasks.filter(task => task).length + (memorizationCompleted ? 1 : 0);
      
      return {
        date: dateStr,
        reviewCompleted,
        memorizationCompleted,
        totalTasks,
        completedTasks
      };
    });
  }, [dailyCompletions, memorizationSchedule]);

  const getActivityLevel = (activity: DailyActivity) => {
    if (activity.totalTasks === 0) return 0;
    const completionRate = activity.completedTasks / activity.totalTasks;
    
    if (completionRate === 1) return 4; // Perfect day
    if (completionRate >= 0.75) return 3; // High activity
    if (completionRate >= 0.5) return 2; // Medium activity
    if (completionRate > 0) return 1; // Low activity
    return 0; // No activity
  };

  const getActivityColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-green-600'; // Perfect
      case 3: return 'bg-green-500'; // High
      case 2: return 'bg-green-400'; // Medium
      case 1: return 'bg-green-200'; // Low
      default: return 'bg-gray-100'; // None
    }
  };

  const weeks = useMemo(() => {
    const result: DailyActivity[][] = [];
    let currentWeek: DailyActivity[] = [];
    
    activityData.forEach((activity, index) => {
      const date = new Date(activity.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(activity);
      
      // Handle last week
      if (index === activityData.length - 1) {
        result.push(currentWeek);
      }
    });
    
    return result;
  }, [activityData]);

  const totalActiveDays = activityData.filter(activity => activity.completedTasks > 0).length;
  const perfectDays = activityData.filter(activity => 
    activity.totalTasks > 0 && activity.completedTasks === activity.totalTasks
  ).length;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Consistency Calendar</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{currentStreak} day streak</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Trophy className="h-3 w-3 mr-1" />
              {perfectDays} perfect days
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white">
        <div className="space-y-4">
          {/* Month labels */}
          <div className="flex justify-between text-xs text-gray-500 px-4">
            {months.map(month => (
              <span key={month}>{month}</span>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 pr-2">
              {days.map(day => (
                <div key={day} className="h-3 flex items-center">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Activity grid */}
            <TooltipProvider>
              <div className="flex gap-1 overflow-x-auto">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const activity = week[dayIndex];
                      if (!activity) {
                        return (
                          <div
                            key={dayIndex}
                            className="w-3 h-3 bg-gray-50 rounded-sm"
                          />
                        );
                      }
                      
                      const level = getActivityLevel(activity);
                      const color = getActivityColor(level);
                      
                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-green-300 ${color}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(new Date(activity.date), 'MMM d, yyyy')}
                              </div>
                              <div className="text-gray-600">
                                {activity.totalTasks === 0 ? (
                                  'No tasks scheduled'
                                ) : (
                                  <>
                                    {activity.completedTasks}/{activity.totalTasks} tasks completed
                                    {activity.reviewCompleted && (
                                      <div className="text-green-600">✓ Review completed</div>
                                    )}
                                    {activity.memorizationCompleted && (
                                      <div className="text-blue-600">✓ Memorization completed</div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{totalActiveDays} active days in the last year</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                <div className="w-3 h-3 bg-green-200 rounded-sm" />
                <div className="w-3 h-3 bg-green-400 rounded-sm" />
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                <div className="w-3 h-3 bg-green-600 rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
