
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScheduleItem } from '@/hooks/use-memorization-planner';
import { format, parseISO, isFuture } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface PlannerSummaryProps {
  schedule: ScheduleItem[];
}

export const PlannerSummary = ({ schedule }: PlannerSummaryProps) => {
  const isMobile = useIsMobile();

  const uncompletedTasks = React.useMemo(() =>
    schedule.filter(item => !item.completed),
    [schedule]
  );

  const overdueTasks = React.useMemo(() =>
    uncompletedTasks.filter(item => item.isOverdue),
    [uncompletedTasks]
  );
  
  const todaysTask = React.useMemo(() => {
    // If there are overdue tasks, show the first overdue task
    if (overdueTasks.length > 0) {
      return overdueTasks[0];
    }
    // Otherwise show the first uncompleted task
    return uncompletedTasks[0];
  }, [uncompletedTasks, overdueTasks]);

  const pastSessions = React.useMemo(() => 
    schedule
      .filter(item => !isFuture(parseISO(item.date)))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 7),
    [schedule]
  );
  
  const lastMemorizedPages = React.useMemo(() => {
    const completedItems = schedule
        .filter(item => item.completed && !isFuture(parseISO(item.date)))
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    
    const pages = completedItems.map(item => item.page);
    const uniquePages = [...new Set(pages)];
    
    return uniquePages.slice(0, 7);
  }, [schedule]);

  const upcomingTasks = React.useMemo(() =>
    uncompletedTasks.filter(item => !item.isOverdue).slice(0, 5),
    [uncompletedTasks]
  );

  if (schedule.length === 0) {
    return null; // Don't show anything if no schedule
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Planner Summary</CardTitle>
          <CardDescription className="text-sm">A quick overview of your memorization plan.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Overdue Alert */}
          {overdueTasks.length > 0 && (
            <div className="p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 w-full">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                <h4 className="font-semibold text-red-800 text-sm sm:text-base">Overdue Tasks</h4>
                <Badge variant="destructive" className="text-xs">{overdueTasks.length}</Badge>
              </div>
              <p className="text-xs sm:text-sm text-red-700">
                You have {overdueTasks.length} overdue memorization task{overdueTasks.length > 1 ? 's' : ''}. 
                Complete them before new tasks will appear.
              </p>
            </div>
          )}

          <div className="w-full">
            <h4 className="text-base sm:text-lg font-semibold mb-2">
              {todaysTask?.isOverdue ? "Priority Task (Overdue)" : "Today's Goal"}
            </h4>
            {todaysTask ? (
              <div className={`p-3 rounded-lg w-full ${
                todaysTask.isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base">{format(parseISO(todaysTask.date), "EEE, MMM d")}</p>
                    <p className={`text-xs sm:text-sm ${
                      todaysTask.isOverdue ? 'text-red-700' : 'text-muted-foreground'
                    } break-words overflow-hidden`}>
                      {todaysTask.task}
                    </p>
                  </div>
                  {todaysTask.isOverdue && (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 text-xs flex-shrink-0">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Congratulations! You've completed your plan.</p>
            )}
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full min-w-0">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Recent Sessions</h4>
              <div className="w-full">
                <Select>
                  <SelectTrigger className="text-xs sm:text-sm w-full">
                    <SelectValue placeholder="Last 7 sessions" />
                  </SelectTrigger>
                  <SelectContent>
                    {pastSessions.length > 0 ? (
                      pastSessions.map(item => (
                        <SelectItem key={item.date} value={item.date} className="text-xs sm:text-sm">
                          {format(parseISO(item.date), isMobile ? 'MMM d' : 'MMM d')}: {isMobile ? item.task.substring(0, 15) + '...' : item.task.substring(0, 30) + '...'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-xs sm:text-sm">No past sessions</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full min-w-0">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Recent Pages Memorized</h4>
              <div className="w-full">
                <Select>
                  <SelectTrigger className="text-xs sm:text-sm w-full">
                    <SelectValue placeholder="Last 7 pages" />
                  </SelectTrigger>
                  <SelectContent>
                    {lastMemorizedPages.length > 0 ? (
                      lastMemorizedPages.map(page => (
                        <SelectItem key={page} value={String(page)} className="text-xs sm:text-sm">
                          Page {page}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-xs sm:text-sm">No pages memorized yet</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <h4 className="text-base sm:text-lg font-semibold mb-2">Upcoming Tasks</h4>
            {upcomingTasks.length > 0 ? (
              <ul className="space-y-2 w-full">
                {upcomingTasks.map(item => (
                  <li key={item.date} className="text-xs sm:text-sm p-2 rounded-md bg-muted/50 w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <strong className="flex-shrink-0">{format(parseISO(item.date), isMobile ? 'MMM d' : 'EEE, MMM d')}:</strong> 
                      <span className="break-words overflow-hidden">{isMobile ? item.task.substring(0, 25) + '...' : item.task}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : overdueTasks.length > 0 ? (
              <p className="text-muted-foreground text-xs sm:text-sm">Complete overdue tasks to see upcoming tasks.</p>
            ) : (
              <p className="text-muted-foreground text-xs sm:text-sm">No further tasks in this plan.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
