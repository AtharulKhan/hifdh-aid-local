import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from 'date-fns';
import { ScheduleItem } from '@/hooks/use-memorization-planner';
import { Label } from '@/components/ui/label';

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
          <div className="max-h-96 overflow-y-auto pr-4 space-y-2">
            {schedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => onDayStatusChange(item.date, !!checked)}
                    id={`day-${index}`}
                  />
                  <div>
                    <Label htmlFor={`day-${index}`} className="font-bold">{format(parseISO(item.date), "EEE, MMM d")}</Label>
                    <p className="text-sm text-muted-foreground">{item.task}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
