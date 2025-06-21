
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
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Type</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Title</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Content</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item, index) => (
            <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="border border-gray-300 p-2">
                {format(new Date(item.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                  {item.type}
                </span>
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.title}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.content}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  item.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.completed ? 'Completed' : 'Pending'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 text-sm text-gray-600">
        <p>Total Tasks: {schedule.length}</p>
        <p>Completed: {schedule.filter(s => s.completed).length}</p>
        <p>Pending: {schedule.filter(s => !s.completed).length}</p>
      </div>
    </div>
  );
};
