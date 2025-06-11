
import React from "react";
import { QuranViewer } from "@/components/quran/QuranViewer";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-green-200 w-full">
        <div className={`w-full max-w-7xl mx-auto ${isMobile ? 'px-3 py-3' : 'px-6 py-6'}`}>
          <h1 className={`font-bold text-gray-700 text-center break-words ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            Quran Review & Memorization Aid
          </h1>
          <p className={`text-center text-gray-500 mt-2 break-words ${isMobile ? 'text-xs px-2' : ''}`}>
            Strengthen your memorization through systematic review and practice
          </p>
        </div>
      </header>
      
      <main className={`w-full max-w-6xl mx-auto overflow-x-hidden ${isMobile ? 'px-1 py-2' : 'px-6 py-8'}`}>
        <QuranViewer startingVerseId={1} />
      </main>
    </div>
  );
};

export default Index;
