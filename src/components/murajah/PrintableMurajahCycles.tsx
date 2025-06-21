
import React from 'react';
import { format } from 'date-fns';

interface ReviewCycle {
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading' | 'New';
  title: string;
  content: string;
  startDate: string;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
  id: string;
  isOverdue?: boolean;
}

interface PrintableMurajahCyclesProps {
  data: ReviewCycle[];
  title: string;
}

export const PrintableMurajahCycles: React.FC<PrintableMurajahCyclesProps> = ({ data, title }) => {
  return (
    <div className="print-container">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">Generated on {format(new Date(), 'MMMM do, yyyy')}</p>
      </div>

      <div className="space-y-4">
        {data.map((cycle) => (
          <div key={cycle.id} className="border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{cycle.title}</h3>
              <div className="flex gap-2">
                {cycle.isOverdue && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded border-red-300">
                    Overdue
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded ${
                  cycle.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {cycle.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{cycle.content}</p>
            <p className="text-sm text-gray-500">
              Type: {cycle.type}
              {cycle.startDate !== new Date().toISOString().split('T')[0] && (
                <span className="ml-2">
                  • {cycle.isOverdue ? 'Overdue from' : 'Carried over from'} {format(new Date(cycle.startDate), 'MMM d, yyyy')}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Total Cycles: {data.length}</p>
        <p>Completed: {data.filter(c => c.completed).length}</p>
        <p>Pending: {data.filter(c => !c.completed && !c.isOverdue).length}</p>
        <p>Overdue: {data.filter(c => c.isOverdue).length}</p>
      </div>
    </div>
  );
};
