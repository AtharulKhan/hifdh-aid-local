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
import { X, CheckSquare, AlertTriangle, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { PrintableScheduleTable } from './PrintableScheduleTable';
import { ComprehensivePrintDialog } from '@/components/shared/ComprehensivePrintDialog';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Update local schedule when props change
  React.useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  if (localSchedule.length === 0) {
    return (
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Memorization Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No schedule generated. Please set your preferences and generate a new plan.</p>
        </CardContent>
      </Card>
    );
  }

  const completionDate = localSchedule[localSchedule.length - 1].date;
  const upcomingTasks = localSchedule.filter(item => !item.completed);
  const completedTasks = localSchedule.filter(item => item.completed).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

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

    // Update local schedule state
    const updatedSchedule = localSchedule.map(scheduleItem => 
      scheduleItem.date === item.date && 
      scheduleItem.page === item.page && 
      scheduleItem.startLine === item.startLine && 
      scheduleItem.endLine === item.endLine
        ? { ...scheduleItem, isPostponed: true, postponedToDate: tomorrowStr }
        : scheduleItem
    );
    setLocalSchedule(updatedSchedule);

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
  };

  const unPostponeTask = async (item: ScheduleItem) => {
    if (!item.isPostponed) return; // Only allow un-postponing of postponed tasks

    // Remove from postponed tasks in localStorage
    const postponedKey = 'memorization-planner-postponed-tasks';
    const existingPostponed = localStorage.getItem(postponedKey);
    
    if (existingPostponed) {
      try {
        let postponedTasks = JSON.parse(existingPostponed);
        // Remove tasks that match this task's data
        postponedTasks = postponedTasks.filter((postponedTask: any) => {
          return !(
            postponedTask.date === item.date &&
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

    // Update local schedule state
    const updatedSchedule = localSchedule.map(scheduleItem => 
      scheduleItem.date === item.date && 
      scheduleItem.page === item.page && 
      scheduleItem.startLine === item.startLine && 
      scheduleItem.endLine === item.endLine
        ? { ...scheduleItem, isPostponed: false, postponedToDate: undefined }
        : scheduleItem
    );
    setLocalSchedule(updatedSchedule);

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
      <div key={item.date} className={`w-full max-w-full overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg transition-all duration-200 gap-3 ${
        item.isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
      } ${item.completed ? 'opacity-70' : ''} ${item.isPostponed ? 'opacity-60' : ''}`}>
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div className="flex items-center space-x-2 flex-shrink-0">
            {showSelectionCheckbox && (
              <Checkbox
                checked={selectedTasks.has(item.date)}
                onCheckedChange={(checked) => handleTaskSelection(item.date, !!checked)}
                id={`select-${item.date}`}
              />
            )}
            <Button
              variant={item.completed ? "default" : "outline"}
              size="sm"
              onClick={() => onDayStatusChange(item.date, !item.completed)}
              disabled={item.isPostponed}
              className={`h-8 w-8 p-0 ${
                item.completed 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'hover:bg-green-50 hover:border-green-300'
              }`}
            >
              {item.completed && <Check className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <Label htmlFor={`day-${item.date}`} className="font-bold text-sm sm:text-base break-words">
              {format(parseISO(item.date), isMobile ? "MMM d, yy" : "EEE, MMM d, yyyy")}
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground break-words break-all overflow-wrap-anywhere">
              {taskWithJuz}
            </p>
            {item.isPostponed && (
              <p className="text-xs text-blue-600 mt-1">
                Postponed to tomorrow
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {item.isOverdue && !item.completed && (
            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {isMobile ? "Late" : "Overdue"}
            </Badge>
          )}
          {item.isPostponed && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
              {isMobile ? "Later" : "Postponed"}
            </Badge>
          )}
          {!item.isPostponed && (
            <Badge variant={item.completed ? "default" : "outline"} className="text-xs">
              {item.completed ? (isMobile ? "Done" : "Completed") : (isMobile ? "Todo" : "Pending")}
            </Badge>
          )}
          <div className="flex items-center gap-1">
            {item.isPostponed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => unPostponeTask(item)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300 text-xs px-2 py-1"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                {isMobile ? "Back" : "Un-postpone"}
              </Button>
            )}
            {!item.completed && !item.isPostponed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => postponeTask(item)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300 text-xs px-2 py-1"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                {isMobile ? "Later" : "Postpone"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl break-words">Your Memorization Schedule</CardTitle>
            <CardDescription className="text-sm break-words">
              Estimated completion: {format(parseISO(completionDate), isMobile ? "MMM do, yyyy" : "MMMM do, yyyy")}
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <ComprehensivePrintDialog
              memorization={{
                schedule: localSchedule,
                component: PrintableScheduleTable
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
          <div className='space-y-4 w-full'>
            <div className="w-full">
                <Label className="text-sm sm:text-base font-medium">Total Memorization</Label>
                <div className="flex justify-between mb-1 text-xs sm:text-sm">
                    <span className="font-medium text-muted-foreground break-words">
                        {`${(alreadyMemorizedPages + completedPagesInPlan).toFixed(1)} / ${totalQuranPages} pages`}
                    </span>
                    <span className="font-medium text-primary">{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} className="w-full" aria-label={`${Math.round(totalProgress)}% of Quran memorized`} />
            </div>
            <div className="w-full">
                <Label className="text-sm sm:text-base font-medium">Current Plan Progress</Label>
                <div className="flex justify-between mb-1 text-xs sm:text-sm">
                    <span className="font-medium text-muted-foreground break-words">
                        {`${completedPagesInPlan.toFixed(1)} / ${totalPagesInPlan} pages`}
                    </span>
                    <span className="font-medium text-primary">{Math.round(planProgress)}%</span>
                </div>
                <Progress value={planProgress} className="w-full" aria-label={`${Math.round(planProgress)}% of current plan completed`} />
            </div>
          </div>

          {/* Multi-select controls */}
          <div className="flex items-center gap-2 flex-wrap w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className="text-xs sm:text-sm"
            >
              <CheckSquare className="h-4 w-4 mr-1 sm:mr-2" />
              {isMultiSelectMode ? 'Exit Multi' : 'Multi-Select'}
            </Button>
            
            {isMultiSelectMode && selectedTasks.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkComplete}
                  className="text-xs sm:text-sm"
                >
                  {isMobile ? 'Complete' : 'Mark Selected Complete'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkUncomplete}
                  className="text-xs sm:text-sm"
                >
                  {isMobile ? 'Incomplete' : 'Mark Selected Incomplete'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnselectAll}
                  className="text-xs sm:text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  {isMobile ? 'Clear' : 'Unselect All'}
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {selectedTasks.size} selected
                </span>
              </>
            )}
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="w-full">
              <div className="max-h-96 overflow-y-auto space-y-2 mt-4 w-full">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((item) => renderTaskItem(item, isMultiSelectMode))
                ) : (
                   <div className="text-center py-10">
                     <p className="text-muted-foreground text-sm">You've completed all tasks in this plan!</p>
                   </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="w-full">
               <div className="max-h-96 overflow-y-auto space-y-2 mt-4 w-full">
                {completedTasks.length > 0 ? (
                  completedTasks.map((item) => renderTaskItem(item, isMultiSelectMode))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground text-sm">No tasks completed yet.</p>
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
