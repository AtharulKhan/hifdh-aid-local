
import React from "react";
import { QuranViewer } from "@/components/quran/QuranViewer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-700 text-center">
            مصحف المراجعة والحفظ
          </h1>
          <p className="text-center text-gray-500 mt-2">
            قوّي حفظك من خلال المراجعة المنهجية والممارسة
          </p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <QuranViewer startingVerseId={1} />
      </main>
    </div>
  );
};

export default Index;
