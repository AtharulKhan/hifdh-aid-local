import React from "react";
import { QuranViewer } from "@/components/quran/QuranViewer";
import { useIsMobile } from "@/hooks/use-mobile";
const Index = () => {
  const isMobile = useIsMobile();
  return <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-green-200 w-full max-w-full">
        
      </header>
      
      <main className={`w-full max-w-6xl mx-auto overflow-x-hidden ${isMobile ? 'px-1 py-2' : 'px-6 py-8'}`}>
        <div className="w-full max-w-full overflow-x-hidden">
          <QuranViewer startingVerseId={1} />
        </div>
      </main>
    </div>;
};
export default Index;