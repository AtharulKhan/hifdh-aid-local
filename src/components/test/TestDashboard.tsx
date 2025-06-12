
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardCheck, ArrowRight, BookOpen, Shuffle, Edit3 } from "lucide-react";
import { BeforeAfterTest } from "./BeforeAfterTest";
import { FirstVerseTest } from "./FirstVerseTest";
import { RandomSpotTest } from "./RandomSpotTest";
import { FillInBlankTest } from "./FillInBlankTest";
import juzData from "@/data/juz-numbers.json";

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
}

// Updated interface to match the one expected by test components
interface MemorizationEntry {
  id: string;
  type: 'surah' | 'juz' | 'page';
  name: string;
  reference: string;
  dateMemorized: string;
  isMemorized: boolean;
  juz: number;
  startPage?: number;
  endPage?: number;
}

export const TestDashboard = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [memorizedEntries, setMemorizedEntries] = useState<MemorizationEntry[]>([]);

  // Load memorized juz from localStorage and convert to test format
  useEffect(() => {
    const savedJuz = localStorage.getItem('murajah-juz-memorization');
    if (savedJuz) {
      try {
        const juzMemorization: JuzMemorization[] = JSON.parse(savedJuz);
        const memorizedJuz = juzMemorization.filter(juz => juz.isMemorized);
        
        // Convert to format expected by test components
        const testEntries: MemorizationEntry[] = memorizedJuz.map(juz => {
          const juzInfo = juzData[juz.juzNumber.toString() as keyof typeof juzData];
          
          return {
            id: `juz-${juz.juzNumber}`,
            type: 'juz' as const,
            name: `Juz ${juz.juzNumber}`,
            reference: juz.startPage && juz.endPage 
              ? `Pages ${juz.startPage}-${juz.endPage}`
              : juzInfo 
                ? `${juzInfo.first_verse_key} - ${juzInfo.last_verse_key}`
                : `Juz ${juz.juzNumber}`,
            dateMemorized: juz.dateMemorized || new Date().toISOString().split('T')[0],
            isMemorized: true,
            juz: juz.juzNumber,
            startPage: juz.startPage,
            endPage: juz.endPage
          };
        });
        
        setMemorizedEntries(testEntries);
      } catch (error) {
        console.error('Error loading juz memorization data:', error);
      }
    }
  }, []);

  if (activeTest) {
    switch (activeTest) {
      case "before-after":
        return <BeforeAfterTest onBack={() => setActiveTest(null)} memorizedEntries={memorizedEntries} />;
      case "first-verse":
        return <FirstVerseTest onBack={() => setActiveTest(null)} memorizedEntries={memorizedEntries} />;
      case "random-spot":
        return <RandomSpotTest onBack={() => setActiveTest(null)} memorizedEntries={memorizedEntries} />;
      case "fill-blank":
        return <FillInBlankTest onBack={() => setActiveTest(null)} memorizedEntries={memorizedEntries} />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto px-2 md:px-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <ClipboardCheck className="h-6 md:h-8 w-6 md:w-8 text-green-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Memorization Test</h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
          Test and strengthen your Quran memorization with various challenging exercises designed to help you master your Hifz.
        </p>
      </div>

      {/* Your Memorization Summary */}
      {memorizedEntries.length > 0 && (
        <Card className="p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">📚 Your Memorization</h4>
            <p className="text-xs md:text-sm text-gray-600">
              You have memorized {memorizedEntries.length} Juz. Ready to test your knowledge!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {memorizedEntries.slice(0, 5).map((entry) => (
                <Badge key={entry.id} variant="secondary" className="text-xs">
                  {entry.name}
                </Badge>
              ))}
              {memorizedEntries.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{memorizedEntries.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Test Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Before & After Test */}
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-yellow-200"
              onClick={() => setActiveTest("before-after")}>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg flex-shrink-0">
                <ArrowRight className="h-5 md:h-6 w-5 md:w-6 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">Before & After Test</h3>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 text-xs mt-1">Classic Hifz</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm">
              Given a random verse, recite the verse immediately before and after it. Perfect for testing verse connections.
            </p>
            <Button variant="outline" className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50 text-xs md:text-sm">
              Start Test
              <ArrowRight className="h-3 md:h-4 w-3 md:w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* First Verse Test */}
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
              onClick={() => setActiveTest("first-verse")}>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <BookOpen className="h-5 md:h-6 w-5 md:w-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">First Verse Test</h3>
                <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs mt-1">Surah Openings</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm">
              Given a Surah name, recite the first verse(s). Essential for mastering Surah beginnings.
            </p>
            <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 text-xs md:text-sm">
              Start Test
              <ArrowRight className="h-3 md:h-4 w-3 md:w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Random Spot Test */}
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500"
              onClick={() => setActiveTest("random-spot")}>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Shuffle className="h-5 md:h-6 w-5 md:w-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">Random Spot Test</h3>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs mt-1">Customizable</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm">
              Test yourself on random verses from a Surah, Juz, page, or the entire Quran. Highly customizable scope.
            </p>
            <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 text-xs md:text-sm">
              Start Test
              <ArrowRight className="h-3 md:h-4 w-3 md:w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Fill in the Blank Test */}
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500"
              onClick={() => setActiveTest("fill-blank")}>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <Edit3 className="h-5 md:h-6 w-5 md:w-6 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">Fill in the Blank</h3>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 text-xs mt-1">Word Perfect</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-xs md:text-sm">
              Complete verses with missing words. Perfect for ensuring you know every word precisely.
            </p>
            <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 text-xs md:text-sm">
              Start Test
              <ArrowRight className="h-3 md:h-4 w-3 md:w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Tips or No Memorization Message */}
      {memorizedEntries.length === 0 ? (
        <Card className="p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">📖 No Memorization Data</h4>
            <p className="text-xs md:text-sm text-gray-600">
              Mark your memorized Juz in the "Muraja'ah - Smart Review" → "Juz" tab to enable testing features.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-3 md:p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">💡 Test Tips</h4>
            <p className="text-xs md:text-sm text-gray-600">
              Start with easier tests and gradually increase difficulty. Regular testing strengthens long-term retention.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
