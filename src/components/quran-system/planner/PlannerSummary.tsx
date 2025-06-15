
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleItem } from '@/hooks/use-memorization-planner';
import { format, parseISO, isFuture } from 'date-fns';

interface PlannerSummaryProps {
  schedule: ScheduleItem[];
}

export const PlannerSummary = ({ schedule }: PlannerSummaryProps) => {

  const todaysTask = React.useMemo(() => {
    // Today's goal is the first uncompleted task in the schedule.
    // The schedule is assumed to be sorted by date.
    return schedule.find(item => !item.completed);
  }, [schedule]);

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

  const upcomingTasks = React.useMemo(() => {
    return schedule
      .filter(item => {
        // Must be a future task
        if (!isFuture(parseISO(item.date))) {
          return false;
        }
        // And must not be the current "Today's Goal"
        if (todaysTask && item.date === todaysTask.date) {
          return false;
        }
        return true;
      })
      .slice(0, 5)
  }, [schedule, todaysTask]);

  if (schedule.length === 0) {
    return null; // Don't show anything if no schedule
  }

  const allTasksCompleted = schedule.length > 0 && !todaysTask;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planner Summary</CardTitle>
        <CardDescription>A quick overview of your memorization plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mb-2">Today's Goal</h4>
          {todaysTask ? (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-bold">{format(parseISO(todaysTask.date), "EEE, MMM d")}</p>
              <p className="text-muted-foreground">{todaysTask.task}</p>
            </div>
          ) : allTasksCompleted ? (
            <p className="text-muted-foreground">🎉 Congratulations! You have completed your plan.</p>
          ) : (
            <p className="text-muted-foreground">No tasks scheduled. Please generate a plan.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Recent Sessions</h4>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Last 7 sessions" />
              </SelectTrigger>
              <SelectContent>
                {pastSessions.length > 0 ? (
                  pastSessions.map(item => (
                    <SelectItem key={item.date} value={item.date}>
                      {format(parseISO(item.date), 'MMM d')}: {item.task}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No past sessions</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Recent Pages Memorized</h4>
             <Select>
              <SelectTrigger>
                <SelectValue placeholder="Last 7 pages" />
              </SelectTrigger>
              <SelectContent>
                {lastMemorizedPages.length > 0 ? (
                  lastMemorizedPages.map(page => (
                    <SelectItem key={page} value={String(page)}>
                      Page {page}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No pages memorized yet</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-2">Upcoming Tasks</h4>
          {upcomingTasks.length > 0 ? (
            <ul className="space-y-2">
              {upcomingTasks.map(item => (
                <li key={item.date} className="text-sm p-2 rounded-md bg-muted/50">
                  <strong>{format(parseISO(item.date), 'EEE, MMM d')}:</strong> {item.task}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No more upcoming tasks.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
