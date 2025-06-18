
import React, { useState } from "react";
import { QuranPageViewer } from "@/components/quran/QuranPageViewer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";

const PageView = () => {
  const isMobile = useIsMobile();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className={`bg-[#F9FAFB] min-h-screen ${isMobile ? 'px-0 py-4' : 'container mx-auto px-4 py-8'} relative`}>
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
              Quran Page Viewer Help & Guide
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6 pr-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📖 Purpose of the Page Viewer
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  The Quran Page Viewer is your comprehensive digital companion for reading, studying, and memorizing the Holy Quran. It provides multiple viewing modes and study tools to enhance your learning experience.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🗂️ Available Tabs & Features
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li><strong>Reader:</strong> Main reading interface with customizable display options</li>
                  <li><strong>Tafsir (Scrollable):</strong> Browse all verses with their commentary in one continuous view</li>
                  <li><strong>Tafsir (Focused):</strong> Study individual verses with detailed explanations</li>
                  <li><strong>Personal Notes:</strong> Add and manage your own notes for each surah</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🎛️ Reader Controls & Options
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">Navigation</h4>
                    <p className="text-sm text-gray-600">Use the surah slider, previous/next buttons, or the horizontal carousel to navigate between surahs quickly.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">Verse Range</h4>
                    <p className="text-sm text-gray-600">Set a specific range of verses to focus on particular sections of a surah.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">Display Options</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                      <li>Toggle verse numbers on/off</li>
                      <li>Show/hide English translation</li>
                      <li>Enable Tajweed coloring for pronunciation guidance</li>
                      <li>Hide verses feature for memorization practice</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🧠 Memorization Features
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">Hide Verses Mode</h4>
                    <p className="text-sm text-gray-600">Perfect for testing your memorization. Hide all verses and use the revelation slider to gradually reveal them as you recite.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">Revelation Progress</h4>
                    <p className="text-sm text-gray-600">Control how much of the text is visible using the progress slider - great for step-by-step memorization.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📚 Study Tools
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li><strong>Tajweed Colors:</strong> Visual cues for proper pronunciation rules</li>
                  <li><strong>Translation:</strong> English translation displayed alongside Arabic text</li>
                  <li><strong>Commentary:</strong> Access Ibn Kathir and Maarif-ul-Quran explanations</li>
                  <li><strong>Search:</strong> Find specific surahs by name or number</li>
                  <li><strong>Personal Notes:</strong> Keep your own study notes for each surah</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  💡 Pro Tips
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li>Use the horizontal carousel for quick surah switching</li>
                  <li>Set verse ranges to focus on memorizing specific sections</li>
                  <li>Enable Tajweed colors when learning proper pronunciation</li>
                  <li>Use the hide verses feature to test your memorization</li>
                  <li>Switch between tafsir modes based on your study needs</li>
                  <li>Take advantage of personal notes to record insights</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📱 Mobile Optimization
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  The page viewer is fully optimized for mobile devices with touch-friendly controls, responsive layout, and swipe gestures for easy navigation.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                  🤲 Remember
                </h3>
                <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                  "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?" (54:17)
                  <br /><br />
                  Use these tools to enhance your connection with the Quran. Whether you're reading for reflection, studying for understanding, or memorizing for preservation, may Allah bless your efforts and make your journey beneficial.
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <QuranPageViewer />
    </div>
  );
};

export default PageView;
