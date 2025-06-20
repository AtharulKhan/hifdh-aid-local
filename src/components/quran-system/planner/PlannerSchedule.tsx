
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
import { X, CheckSquare, AlertTriangle } from 'lucide-react';

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

  const renderTaskItem = (item: ScheduleItem, showSelectionCheckbox: boolean = false) => {
    const juzNumber = getJuzForPage(item.page);
    const taskWithJuz = juzNumber 
      ? `Juz ${juzNumber}, Surah ${item.surah}, Page ${item.page}, Lines ${item.startLine}-${item.endLine}`
      : item.task;
    
    return (
      <div key={item.date} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
        item.isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
      } ${item.completed ? 'opacity-70' : ''}`}>
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
          />
          <div className="flex-1">
            <Label htmlFor={`day-${item.date}`} className="font-bold">{format(parseISO(item.date), "EEE, MMM d, yyyy")}</Label>
            <p className="text-sm text-muted-foreground">{taskWithJuz}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.isOverdue && !item.completed && (
            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          )}
          <Badge variant={item.completed ? "default" : "outline"}>
            {item.completed ? "Completed" : "Pending"}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Memorization Schedule</CardTitle>
        <CardDescription>
          Estimated completion date: {format(parseISO(completionDate), "MMMM do, yyyy")}
        </CardDescription>
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
