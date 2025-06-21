
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      acc[item.date] = {
        date: item.date,
        RMV: null,
        OMV: null,
        Listening: null,
        Reading: null
      };
    }
    acc[item.date][item.type as keyof typeof acc[string]] = item;
    return acc;
  }, {} as { [date: string]: { 
    date: string; 
    RMV: ScheduleItem | null; 
    OMV: ScheduleItem | null; 
    Listening: ScheduleItem | null; 
    Reading: ScheduleItem | null; 
  } });

  const sortedDates = Object.keys(groupedByDate).sort();

  const renderTaskCell = (task: ScheduleItem | null) => {
    if (!task) {
      return <span className="text-gray-400">-</span>;
    }
    
    return (
      <div>
        <div className="font-medium text-sm">{task.title}</div>
        <div className="text-xs text-gray-600 mt-1">{task.content}</div>
        <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
          task.completed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {task.completed ? 'Completed' : 'Pending'}
        </span>
      </div>
    );
  };

  return (
    <div className="print-container">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">Generated on {format(new Date(), 'MMMM do, yyyy')}</p>
      </div>

      <Table className="w-full border-collapse border border-gray-300">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Date</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">RMV</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">OMV</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Listening</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Reading</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDates.map((date, index) => {
            const dayData = groupedByDate[date];
            return (
              <TableRow key={date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="border border-gray-300 p-2 font-medium">
                  {format(new Date(date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="border border-gray-300 p-2">
                  {renderTaskCell(dayData.RMV)}
                </TableCell>
                <TableCell className="border border-gray-300 p-2">
                  {renderTaskCell(dayData.OMV)}
                </TableCell>
                <TableCell className="border border-gray-300 p-2">
                  {renderTaskCell(dayData.Listening)}
                </TableCell>
                <TableCell className="border border-gray-300 p-2">
                  {renderTaskCell(dayData.Reading)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-6 text-sm text-gray-600">
        <p>Total Days: {sortedDates.length}</p>
        <p>Total Tasks: {schedule.length}</p>
        <p>Completed: {schedule.filter(s => s.completed).length}</p>
        <p>Pending: {schedule.filter(s => !s.completed).length}</p>
      </div>
    </div>
  );
};
