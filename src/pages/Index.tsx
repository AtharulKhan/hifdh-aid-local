
import React from "react";
import { QuranViewer } from "@/components/quran/QuranViewer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-center">
            Quran Memorization & Review Aid
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Strengthen your Hifz through systematic review and practice
          </p>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <QuranViewer startingVerseId={1} />
      </main>
    </div>
  );
};

export default Index;
