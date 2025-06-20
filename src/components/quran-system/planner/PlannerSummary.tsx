import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScheduleItem } from '@/hooks/use-memorization-planner';
import { format, parseISO, isFuture } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

interface PlannerSummaryProps {
  schedule: ScheduleItem[];
}

export const PlannerSummary = ({ schedule }: PlannerSummaryProps) => {

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
    <Card>
      <CardHeader>
        <CardTitle>Planner Summary</CardTitle>
        <CardDescription>A quick overview of your memorization plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overdue Alert */}
        {overdueTasks.length > 0 && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-800">Overdue Tasks</h4>
              <Badge variant="destructive">{overdueTasks.length}</Badge>
            </div>
            <p className="text-sm text-red-700">
              You have {overdueTasks.length} overdue memorization task{overdueTasks.length > 1 ? 's' : ''}. 
              Complete them before new tasks will appear.
            </p>
          </div>
        )}

        <div>
          <h4 className="text-lg font-semibold mb-2">
            {todaysTask?.isOverdue ? "Priority Task (Overdue)" : "Today's Goal"}
          </h4>
          {todaysTask ? (
            <div className={`p-3 rounded-lg ${
              todaysTask.isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{format(parseISO(todaysTask.date), "EEE, MMM d")}</p>
                  <p className={`text-sm ${
                    todaysTask.isOverdue ? 'text-red-700' : 'text-muted-foreground'
                  }`}>
                    {todaysTask.task}
                  </p>
                </div>
                {todaysTask.isOverdue && (
                  <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Congratulations! You've completed your plan.</p>
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
          ) : overdueTasks.length > 0 ? (
            <p className="text-muted-foreground">Complete overdue tasks to see upcoming tasks.</p>
          ) : (
            <p className="text-muted-foreground">No further tasks in this plan.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
