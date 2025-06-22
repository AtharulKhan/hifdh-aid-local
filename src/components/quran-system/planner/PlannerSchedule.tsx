import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { ScheduleItem } from '@/hooks/use-memorization-planner';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { juzPageMapData } from '@/data/juz-page-map';
import { X, CheckSquare, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { PrintableScheduleTable } from './PrintableScheduleTable';
import { ComprehensivePrintDialog } from '@/components/shared/ComprehensivePrintDialog';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get juz number for a page
const getJuzForPage = (page: number): number | undefined => {
  const juzInfo = juzPageMapData.find(juz => page >= juz.startPage && page <= juz.endPage);
  return juzInfo?.juz;
};

export const PlannerSchedule = ({
  schedule,
  onDayStatusChange,
  totalProgress,
  planProgress,
  alreadyMemorizedPages,
  completedPagesInPlan,
  totalPagesInPlan,
  totalQuranPages,
}: {
  schedule: ScheduleItem[];
  onDayStatusChange: (date: string, completed: boolean) => void;
  totalProgress: number;
  planProgress: number;
  alreadyMemorizedPages: number;
  completedPagesInPlan: number;
  totalPagesInPlan: number;
  totalQuranPages: number;
}) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const { user } = useAuth();

  if (schedule.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memorization Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No schedule generated. Please set your preferences and generate a new plan.</p>
        </CardContent>
      </Card>
    );
  }

  const completionDate = schedule[schedule.length - 1].date;
  const upcomingTasks = schedule.filter(item => !item.completed);
  const completedTasks = schedule.filter(item => item.completed).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const handleTaskSelection = (date: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(date);
    } else {
      newSelected.delete(date);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkComplete = () => {
    selectedTasks.forEach(date => {
      onDayStatusChange(date, true);
    });
    setSelectedTasks(new Set());
  };

  const handleBulkUncomplete = () => {
    selectedTasks.forEach(date => {
      onDayStatusChange(date, false);
    });
    setSelectedTasks(new Set());
  };

  const handleUnselectAll = () => {
    setSelectedTasks(new Set());
  };

  const postponeTask = async (item: ScheduleItem) => {
    if (item.completed || item.isPostponed) return; // Don't postpone completed or already postponed tasks

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Create clean postponed task data (without React components)
    const postponedTask = {
      date: item.date,
      task: item.task,
      page: item.page,
      startLine: item.startLine,
      endLine: item.endLine,
      surah: item.surah,
      originalDate: item.date,
      targetDate: tomorrowStr,
      postponedFromDate: new Date().toISOString().split('T')[0],
      isPostponed: true
    };

    // Save postponed task to localStorage
    const postponedKey = 'memorization-planner-postponed-tasks';
    const existingPostponed = localStorage.getItem(postponedKey);
    let postponedTasks = [];
    
    if (existingPostponed) {
      try {
        postponedTasks = JSON.parse(existingPostponed);
      } catch (error) {
        console.error('Error parsing postponed tasks:', error);
      }
    }

    postponedTasks.push(postponedTask);
    localStorage.setItem(postponedKey, JSON.stringify(postponedTasks));

    // Save to Supabase if user is authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('memorization_planner_schedule')
          .update({
            is_postponed: true,
            postponed_to_date: tomorrowStr,
            postponed_from_date: new Date().toISOString().split('T')[0]
          } as any)
          .eq('user_id', user.id)
          .eq('date', item.date)
          .eq('page', item.page)
          .eq('start_line', item.startLine)
          .eq('end_line', item.endLine);
        
        if (error) {
          console.error('Error postponing task in Supabase:', error);
        } else {
          console.log('Task postponed in Supabase');
        }
      } catch (error) {
        console.error('Error postponing task in Supabase:', error);
      }
    }

    // Show success toast
    toast.success(`Task postponed to tomorrow`, {
      description: "This task will appear in tomorrow's schedule."
    });

    // Trigger a re-render by updating the schedule
    window.location.reload();
  };

  const unPostponeTask = async (item: ScheduleItem) => {
    if (!item.isPostponed) return; // Only allow un-postponing of postponed tasks

    // Remove from postponed tasks in localStorage
    const postponedKey = 'memorization-planner-postponed-tasks';
    const existingPostponed = localStorage.getItem(postponedKey);
    
    if (existingPostponed) {
      try {
        let postponedTasks = JSON.parse(existingPostponed);
        // Remove tasks that match this task's original data
        postponedTasks = postponedTasks.filter((postponedTask: any) => {
          return !(
            postponedTask.originalDate === item.date &&
            postponedTask.page === item.page &&
            postponedTask.startLine === item.startLine &&
            postponedTask.endLine === item.endLine
          );
        });
        localStorage.setItem(postponedKey, JSON.stringify(postponedTasks));
      } catch (error) {
        console.error('Error removing postponed task from localStorage:', error);
      }
    }

    // Remove from Supabase if user is authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('memorization_planner_schedule')
          .update({
            is_postponed: false,
            postponed_to_date: null,
            postponed_from_date: null
          } as any)
          .eq('user_id', user.id)
          .eq('date', item.date)
          .eq('page', item.page)
          .eq('start_line', item.startLine)
          .eq('end_line', item.endLine);
        
        if (error) {
          console.error('Error un-postponing task in Supabase:', error);
        } else {
          console.log('Task un-postponed in Supabase');
        }
      } catch (error) {
        console.error('Error un-postponing task in Supabase:', error);
      }
    }

    // Show success toast
    toast.success(`Task moved back to today`, {
      description: "This task is now available for completion today."
    });

    // Trigger a re-render by updating the schedule
    window.location.reload();
  };

  const renderTaskItem = (item: ScheduleItem, showSelectionCheckbox: boolean = false) => {
    const juzNumber = getJuzForPage(item.page);
    const taskWithJuz = juzNumber 
      ? `Juz ${juzNumber}, Surah ${item.surah}, Page ${item.page}, Lines ${item.startLine}-${item.endLine}`
      : item.task;
    
    const displayTitle = item.isPostponed && !item.task.includes('Postponed!') 
      ? `${item.task} - Postponed!`
      : item.task;
    
    return (
      <div key={item.date} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
        item.isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
      } ${item.completed ? 'opacity-70' : ''} ${item.isPostponed ? 'opacity-60' : ''}`}>
        <div className="flex items-center space-x-4">
          {showSelectionCheckbox && (
            <Checkbox
              checked={selectedTasks.has(item.date)}
              onCheckedChange={(checked) => handleTaskSelection(item.date, !!checked)}
              id={`select-${item.date}`}
            />
          )}
          <Checkbox
            checked={item.completed}
            onCheckedChange={(checked) => onDayStatusChange(item.date, !!checked)}
            id={`day-${item.date}`}
            disabled={item.isPostponed}
          />
          <div className="flex-1">
            <Label htmlFor={`day-${item.date}`} className="font-bold">{format(parseISO(item.date), "EEE, MMM d, yyyy")}</Label>
            <p className="text-sm text-muted-foreground">{taskWithJuz}</p>
            {item.isPostponed && (
              <p className="text-xs text-blue-600 mt-1">
                Postponed to tomorrow
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.isOverdue && !item.completed && (
            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          )}
          {item.isPostponed && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
              Postponed
            </Badge>
          )}
          {!item.isPostponed && (
            <Badge variant={item.completed ? "default" : "outline"}>
              {item.completed ? "Completed" : "Pending"}
            </Badge>
          )}
          {item.isPostponed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unPostponeTask(item)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Un-postpone
            </Button>
          )}
          {!item.completed && !item.isPostponed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => postponeTask(item)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Postpone
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Memorization Schedule</CardTitle>
            <CardDescription>
              Estimated completion date: {format(parseISO(completionDate), "MMMM do, yyyy")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <ComprehensivePrintDialog
              memorization={{
                schedule: schedule,
                component: PrintableScheduleTable
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className='space-y-4'>
            <div>
                <Label className="text-base font-medium">Total Memorization</Label>
                <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium text-muted-foreground">
                        {`${(alreadyMemorizedPages + completedPagesInPlan).toFixed(1)} / ${totalQuranPages} pages`}
                    </span>
                    <span className="font-medium text-primary">{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} className="w-full" aria-label={`${Math.round(totalProgress)}% of Quran memorized`} />
            </div>
            <div>
                <Label className="text-base font-medium">Current Plan Progress</Label>
                <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium text-muted-foreground">
                        {`${completedPagesInPlan.toFixed(1)} / ${totalPagesInPlan} pages`}
                    </span>
                    <span className="font-medium text-primary">{Math.round(planProgress)}%</span>
                </div>
                <Progress value={planProgress} className="w-full" aria-label={`${Math.round(planProgress)}% of current plan completed`} />
            </div>
          </div>

          {/* Multi-select controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {isMultiSelectMode ? 'Exit Multi-Select' : 'Multi-Select'}
            </Button>
            
            {isMultiSelectMode && selectedTasks.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkComplete}
                >
                  Mark Selected Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkUncomplete}
                >
                  Mark Selected Incomplete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnselectAll}
                >
                  <X className="h-4 w-4 mr-2" />
                  Unselect All
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedTasks.size} selected
                </span>
              </>
            )}
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <div className="max-h-96 overflow-y-auto pr-4 space-y-2 mt-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((item) => renderTaskItem(item, isMultiSelectMode))
                ) : (
                   <div className="text-center py-10">
                     <p className="text-muted-foreground">You've completed all tasks in this plan!</p>
                   </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="completed">
               <div className="max-h-96 overflow-y-auto pr-4 space-y-2 mt-4">
                {completedTasks.length > 0 ? (
                  completedTasks.map((item) => renderTaskItem(item, isMultiSelectMode))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No tasks completed yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </CardContent>
    </Card>
  );
};
