
import React from "react";
import { PlannerSettings } from "./planner/PlannerSettings";
import { PlannerSchedule } from "./planner/PlannerSchedule";
import { useMemorizationPlanner } from "@/hooks/use-memorization-planner";

export const MemorizationPlanner = () => {
  const {
    settings,
    setSettings,
    schedule,
    generateSchedule,
    updateDayStatus,
    alreadyMemorized,
    setAlreadyMemorized,
  } = useMemorizationPlanner();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1 space-y-6">
        <PlannerSettings
          settings={settings}
          onSettingsChange={setSettings}
          onGeneratePlan={generateSchedule}
          alreadyMemorized={alreadyMemorized}
          onAlreadyMemorizedChange={setAlreadyMemorized}
        />
      </div>
      <div className="lg:col-span-2">
        <PlannerSchedule schedule={schedule} onDayStatusChange={updateDayStatus} />
      </div>
    </div>
  );
};
