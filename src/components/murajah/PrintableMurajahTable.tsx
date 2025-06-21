
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MurajahScheduleItem {
  date: string;
  rmvPages: string;
  omvJuz: string;
  listeningJuz: string;
  readingJuz: string;
  completed?: boolean;
}

interface PrintableMurajahTableProps {
  schedule: MurajahScheduleItem[];
  title: string;
}

export const PrintableMurajahTable: React.FC<PrintableMurajahTableProps> = ({ schedule, title }) => {
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
            <TableHead className="border border-gray-300 p-2 text-left font-bold">RMV Pages</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">OMV Juz</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Listening</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Reading</TableHead>
            <TableHead className="border border-gray-300 p-2 text-left font-bold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item, index) => (
            <TableRow key={item.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="border border-gray-300 p-2">
                {item.date}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.rmvPages}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.omvJuz}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.listeningJuz}
              </TableCell>
              <TableCell className="border border-gray-300 p-2">
                {item.readingJuz}
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
        <p>Total Days: {schedule.length}</p>
        <p>Completed: {schedule.filter(s => s.completed).length}</p>
        <p>Pending: {schedule.filter(s => !s.completed).length}</p>
      </div>
    </div>
  );
};
