import React, { useState, useEffect, useCallback } from 'react';
import DynamicQuranPage from '@/components/quran/DynamicQuranPage';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProcessedPages, ProcessedLine, processQuranData, clearQuranDataCache } from '@/lib/quran-data-utils';

const TOTAL_PAGES = 604; // As per the 15-line Mushaf standard

const DynamicMushafView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allPagesData, setAllPagesData] = useState<ProcessedPages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Paths are relative to the public folder
        const data = await processQuranData('/qpc-hafs-15-lines.db', '/quran.json');
        setAllPagesData(data);
      } catch (e) {
        console.error("Error processing Quran data:", e);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Optional: Clear cache if component unmounts, depending on desired behavior
    return () => {
      // clearQuranDataCache(); // Uncomment if you want to clear cache on unmount
    };
  }, []); // Empty dependency array means this runs once on mount

  const handlePreviousPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1));
  };

  const currentLines: ProcessedLine[] | undefined = allPagesData ? allPagesData[currentPage] : undefined;

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      <main className={`w-full max-w-4xl mx-auto overflow-x-hidden ${isMobile ? 'px-2 py-4' : 'px-6 py-8'}`}>
        <DynamicQuranPage
          pageNumber={currentPage}
          lines={currentLines}
          isLoading={isLoading && !allPagesData} // Show loading only if data isn't there yet
          error={error}
        />

        <div className="mt-6 flex justify-between items-center">
          <Button onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading}>
            ← Previous
          </Button>
          <span className="text-gray-700 font-medium">
            Page {currentPage}
          </span>
          <Button onClick={handleNextPage} disabled={currentPage === TOTAL_PAGES || isLoading}>
            Next →
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DynamicMushafView;
