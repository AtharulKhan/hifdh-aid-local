
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardCheck, ArrowRight, BookOpen, Shuffle, Edit3 } from "lucide-react";
import { BeforeAfterTest } from "./BeforeAfterTest";
import { FirstVerseTest } from "./FirstVerseTest";
import { RandomSpotTest } from "./RandomSpotTest";
import { FillInBlankTest } from "./FillInBlankTest";

export const TestDashboard = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);

  if (activeTest) {
    switch (activeTest) {
      case "before-after":
        return <BeforeAfterTest onBack={() => setActiveTest(null)} />;
      case "first-verse":
        return <FirstVerseTest onBack={() => setActiveTest(null)} />;
      case "random-spot":
        return <RandomSpotTest onBack={() => setActiveTest(null)} />;
      case "fill-blank":
        return <FillInBlankTest onBack={() => setActiveTest(null)} />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <ClipboardCheck className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">Memorization Test</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Test and strengthen your Quran memorization with various challenging exercises designed to help you master your Hifz.
        </p>
      </div>

      {/* Test Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before & After Test */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-yellow-200"
              onClick={() => setActiveTest("before-after")}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <ArrowRight className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Before & After Test</h3>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Classic Hifz</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Given a random verse, recite the verse immediately before and after it. Perfect for testing verse connections.
            </p>
            <Button variant="outline" className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50">
              Start Test
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* First Verse Test */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
              onClick={() => setActiveTest("first-verse")}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">First Verse Test</h3>
                <Badge variant="secondary" className="bg-green-50 text-green-700">Surah Openings</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Given a Surah name, recite the first verse(s). Essential for mastering Surah beginnings.
            </p>
            <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
              Start Test
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Random Spot Test */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500"
              onClick={() => setActiveTest("random-spot")}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shuffle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Random Spot Test</h3>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">Customizable</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Test yourself on random verses from a Surah, Juz, page, or the entire Quran. Highly customizable scope.
            </p>
            <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
              Start Test
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Fill in the Blank Test */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500"
              onClick={() => setActiveTest("fill-blank")}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Edit3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Fill in the Blank</h3>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">Word Perfect</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Complete verses with missing words. Perfect for ensuring you know every word precisely.
            </p>
            <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
              Start Test
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Stats or Tips */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="text-center space-y-2">
          <h4 className="font-semibold text-gray-800">💡 Test Tips</h4>
          <p className="text-sm text-gray-600">
            Start with easier tests and gradually increase difficulty. Regular testing strengthens long-term retention.
          </p>
        </div>
      </Card>
    </div>
  );
};
