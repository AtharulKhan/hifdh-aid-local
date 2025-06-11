
import React from "react";
import { QuranViewer } from "@/components/quran/QuranViewer";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-green-200">
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
          <h1 className={`font-bold text-gray-700 text-center ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Quran Review & Memorization Aid
          </h1>
          <p className={`text-center text-gray-500 mt-2 ${isMobile ? 'text-sm' : ''}`}>
            Strengthen your memorization through systematic review and practice
          </p>
        </div>
      </header>
      
      <main className={`max-w-6xl mx-auto ${isMobile ? 'px-2 py-4' : 'px-6 py-8'}`}>
        <QuranViewer startingVerseId={1} />
      </main>
    </div>
  );
};

export default Index;
