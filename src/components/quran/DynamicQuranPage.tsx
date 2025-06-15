
import React from 'react';
import { ProcessedLine } from '@/lib/quran-data-utils'; // Import the type
import { cn } from '@/lib/utils';

interface DynamicQuranPageProps {
  pageNumber: number;
  lines: ProcessedLine[] | undefined; // Lines for the current page
  isLoading: boolean;
  error: string | null;
}

const DynamicQuranPage: React.FC<DynamicQuranPageProps> = ({
  pageNumber,
  lines,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return <div className="text-center p-8">Loading page data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!lines || lines.length === 0) {
    return <div className="text-center p-8">Page data not available or page is empty.</div>;
  }

  return (
    <div className="flex flex-col gap-1 text-2xl leading-[2.3rem] p-4 bg-white rounded-lg shadow-sm border border-gray-100 font-[Scheherazade_New,Amiri,serif]">
      <div className="text-sm text-gray-500 self-end mb-1">
        صفحة&nbsp;{pageNumber}
      </div>

      {lines.map((line, idx) => (
        <React.Fragment key={`${pageNumber}-${line.lineNumber}`}>
          <div
            className={cn(
              'whitespace-pre-wrap text-right py-2', // font-serif was here, moved to parent for consistency
              line.centered && 'text-center',
              // Add specific styling for surah headers or bismillah if needed based on line.lineType
              line.lineType === 'surah_header' && 'text-center text-3xl font-bold my-4',
              line.lineType === 'bismillah' && 'text-center text-xl my-2'
            )}
          >
            {/* Render surah name for surah_header if not part of line.text */}
            {line.lineType === 'surah_header' && line.text.length === 0 && (
              <span>سورة {/* We'll need to get surah name here later if possible */}</span>
            )}
            {line.text}
          </div>
          {idx < lines.length - 1 && (
            <hr className="border-gray-200 my-1" /> // Added my-1 for a bit of spacing
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DynamicQuranPage;
