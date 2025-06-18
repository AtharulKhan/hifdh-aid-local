
import React, { useState } from "react";
import { TestDashboard } from "@/components/test/TestDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";

const Test = () => {
  const isMobile = useIsMobile();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className={`bg-[#F9FAFB] min-h-screen ${isMobile ? 'px-2 py-4' : 'container mx-auto px-4 py-8'} relative`}>
      {/* Help Button */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-10 h-8 w-8 sm:h-10 sm:w-10 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-2xl h-[80vh] p-0 gap-0">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-green-700">
              Memorization Test Help & Guide
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6 pr-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🎯 Purpose of Memorization Tests
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  The Memorization Test page is designed to strengthen and verify your Quran memorization through various challenging exercises. These tests help identify weak spots and reinforce your memory retention.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📚 Available Test Types
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li><strong>First Word Test:</strong> Only the first word is shown, hover to reveal more gradually</li>
                  <li><strong>Before & After Test:</strong> Given a verse, recite the verses immediately before and after it</li>
                  <li><strong>First Verse Test:</strong> Given a Surah name, recite the opening verse(s)</li>
                  <li><strong>Random Spot Test:</strong> Test yourself on random verses with customizable scope</li>
                  <li><strong>Fill in the Blank:</strong> Complete verses with missing words for precision</li>
                  <li><strong>Word Recall Gap Fill:</strong> Read passages with missing words and hover to reveal</li>
                  <li><strong>Out-of-Order Line Shuffle:</strong> Drag and rearrange verses in correct order</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🚀 How to Use the Tests
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Select Your Test Type</h4>
                    <p className="text-sm text-gray-600">Choose from the available test cards based on what aspect of memorization you want to strengthen.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Configure Test Settings</h4>
                    <p className="text-sm text-gray-600">Many tests allow you to customize scope (Surah, Juz, or entire Quran) and difficulty level.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Complete the Test</h4>
                    <p className="text-sm text-gray-600">Follow the test instructions and test your memorization. Some tests are interactive with hover effects.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">4. Review Results</h4>
                    <p className="text-sm text-gray-600">After completing tests, review any mistakes to identify areas needing more practice.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📈 Test Categories by Difficulty
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-green-700">Beginner Level</h4>
                    <p className="text-sm text-gray-600">First Verse Test, First Word Test - Great for starting your testing journey</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-yellow-700">Intermediate Level</h4>
                    <p className="text-sm text-gray-600">Random Spot Test, Fill in the Blank - Test specific verses and word accuracy</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-red-700">Advanced Level</h4>
                    <p className="text-sm text-gray-600">Before & After Test, Out-of-Order Test - Challenge your sequence memory and connections</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  💡 Testing Strategies
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li>Start with easier tests and gradually increase difficulty</li>
                  <li>Focus on your memorized sections first before testing new areas</li>
                  <li>Use the Before & After test to strengthen verse connections</li>
                  <li>Practice Fill in the Blank tests to ensure word-perfect memorization</li>
                  <li>Regular testing helps maintain and strengthen existing memorization</li>
                  <li>Use Random Spot tests to identify weak areas that need more review</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🎯 Getting Started
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  If you haven't marked any Juz as memorized yet, visit the "Muraja'ah - Smart Review" section and mark your memorized Juz in the "Juz" tab. This will enable all testing features with your specific memorization data.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📱 Mobile Features
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  All tests are fully optimized for mobile devices with touch-friendly interfaces, responsive layouts, and appropriate text sizing for easy reading and interaction.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                  🤲 Remember
                </h3>
                <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                  "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?" (54:17)
                  <br /><br />
                  Testing is not just about verification—it's about strengthening your connection with the Quran. Use these tools regularly to maintain and improve your memorization. May Allah bless your efforts and make your journey successful!
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <TestDashboard />
    </div>
  );
};

export default Test;
