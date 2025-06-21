
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ScheduleItem } from '@/hooks/use-memorization-planner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PrintableScheduleTableProps {
  schedule: ScheduleItem[];
  title: string;
}

export const PrintableScheduleTable: React.FC<PrintableScheduleTableProps> = ({ schedule, title }) => {
  return (
    <div className="print-container">
      <style jsx>{`
        @media print {
          .print-container {
            font-size: 12px;
          }
          .page-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">Generated on {format(new Date(), 'MMMM do, yyyy')}</p>
      </div>

      <Table className="w-full border-collapse border border-gray-300">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Date</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Task</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Page</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Lines</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item, index) => (
            <TableRow key={item.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="border border-gray-300 p-2">
                {format(parseISO(item.date), "EEE, MMM d, yyyy")}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.surah}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.page}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.startLine}-{item.endLine}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  item.completed 
                    ? 'bg-green-100 text-green-800' 
                    : item.isOverdue 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.completed ? 'Completed' : item.isOverdue ? 'Overdue' : 'Pending'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 text-sm text-gray-600">
        <p>Total Tasks: {schedule.length}</p>
        <p>Completed: {schedule.filter(s => s.completed).length}</p>
        <p>Pending: {schedule.filter(s => !s.completed && !s.isOverdue).length}</p>
        <p>Overdue: {schedule.filter(s => s.isOverdue).length}</p>
      </div>
    </div>
  );
};
