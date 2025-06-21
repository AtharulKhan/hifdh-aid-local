
import React from 'react';
import { format } from 'date-fns';

interface ScheduleItem {
  date: string;
  task: string;
  type: string;
  completed: boolean;
  title: string;
  content: string;
}

interface PrintableMurajahScheduleProps {
  schedule: ScheduleItem[];
  title: string;
}

export const PrintableMurajahSchedule: React.FC<PrintableMurajahScheduleProps> = ({ schedule, title }) => {
  // Group schedule by date
  const groupedByDate = schedule.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as { [date: string]: ScheduleItem[] });

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="print-container">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">Generated on {format(new Date(), 'MMMM do, yyyy')}</p>
      </div>

      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-green-700">
              {format(new Date(date), 'EEEE, MMMM do, yyyy')}
            </h2>
            <div className="space-y-3">
              {groupedByDate[date].map((item, index) => (
                <div key={index} className="border-l-4 border-green-200 bg-green-50 p-3 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Total Days: {sortedDates.length}</p>
        <p>Total Tasks: {schedule.length}</p>
        <p>Average Tasks per Day: {(schedule.length / sortedDates.length).toFixed(1)}</p>
      </div>
    </div>
  );
};
