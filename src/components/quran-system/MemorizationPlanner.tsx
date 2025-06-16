
import React from "react";
import { PlannerSettings } from "./planner/PlannerSettings";
import { PlannerSchedule } from "./planner/PlannerSchedule";
import { useMemorizationPlanner } from "@/hooks/use-memorization-planner";
import { PlannerActions } from "./planner/PlannerActions";
import { PlannerSummary } from "./planner/PlannerSummary";

export const MemorizationPlanner = () => {
  const {
    settings,
    setSettings,
    schedule,
    generateSchedule,
    updateDayStatus,
    alreadyMemorized,
    resetPlanner,
    memorizedPagesSet,
  } = useMemorizationPlanner();

  const totalQuranPages = 604;

  const alreadyMemorizedPages = memorizedPagesSet.size;
  
  const totalPagesInPlan = React.useMemo(() => {
    if (schedule.length === 0) return 0;
    const uniquePages = new Set(schedule.map(item => item.page));
    return uniquePages.size;
  }, [schedule]);

  const completedPagesInPlan = React.useMemo(() => {
    if (schedule.length === 0) return 0;
    const completedLines = schedule
      .filter(s => s.completed)
      .reduce((acc, s) => acc + (s.endLine - s.startLine + 1), 0);
    return completedLines / 15;
  }, [schedule]);

  const totalProgress = totalQuranPages > 0 
    ? ((alreadyMemorizedPages + completedPagesInPlan) / totalQuranPages) * 100
    : 0;
  
  const planProgress = totalPagesInPlan > 0 
    ? (completedPagesInPlan / totalPagesInPlan) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <PlannerSchedule
        schedule={schedule}
        onDayStatusChange={updateDayStatus}
        totalProgress={totalProgress}
        planProgress={planProgress}
        alreadyMemorizedPages={alreadyMemorizedPages}
        completedPagesInPlan={completedPagesInPlan}
        totalPagesInPlan={totalPagesInPlan}
        totalQuranPages={totalQuranPages}
      />
      <PlannerSummary schedule={schedule} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <PlannerSettings
            settings={settings}
            onSettingsChange={setSettings}
            onGeneratePlan={generateSchedule}
            alreadyMemorized={alreadyMemorized}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <PlannerActions onReset={resetPlanner} />
        </div>
      </div>
    </div>
  );
};
