import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useJournalStore } from "@/store/useJournalStore";

export const Calendar = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const journals = useJournalStore((state) => state.journals);

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  return (
    <Card className="p-6 h-[calc(100vh-2rem)] flex flex-col bg-white/80 backdrop-blur-xl shadow-xl animate-slideIn">
      <div className="flex items-center space-x-2 mb-6">
        <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Calendar
        </h2>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="rounded-md border shadow-sm"
        />
      </div>
    </Card>
  );
};