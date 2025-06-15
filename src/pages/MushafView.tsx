
import React, { useState } from "react";
import QuranPage from "@/components/quran/QuranPage";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const MushafView = () => {
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      <main className={`w-full max-w-4xl mx-auto overflow-x-hidden ${isMobile ? 'px-2 py-4' : 'px-6 py-8'}`}>
        <QuranPage pageNumber={page} />

        <div className="mt-6 flex justify-between items-center">
          <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            ← Previous
          </Button>
          <span className="text-gray-700 font-medium">Page {page}</span>
          <Button onClick={() => setPage(p => Math.min(604, p + 1))} disabled={page === 604}>
            Next →
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MushafView;
