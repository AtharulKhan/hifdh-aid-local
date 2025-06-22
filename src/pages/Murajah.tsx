
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";
import { MurajahDashboard } from "@/components/murajah/MurajahDashboard";
import { JuzMemorizationTracker } from "@/components/murajah/JuzMemorizationTracker";
import { ReviewSettings } from "@/components/murajah/ReviewSettings";
import { MurajahLog } from "@/components/murajah/MurajahLog";
import { MurajahMainDashboard } from "@/components/murajah/MurajahMainDashboard";
import { MemorizationPlanner } from "@/components/quran-system/MemorizationPlanner";
import { ImportExport } from "@/components/murajah/ImportExport";
import { CompletionCalculator } from "@/components/murajah/CompletionCalculator";
import { useSearchParams } from "react-router-dom";

const Murajah = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 relative">
      {/* Help Button */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 right-2 sm:absolute sm:top-0 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 hover:bg-green-50 hover:border-green-300 transition-all duration-200 z-50 sm:z-10"
          >
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-2xl h-[80vh] p-0 gap-0">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-green-700">
              Muraja'ah System Help & Guide
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6 pr-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🎯 Purpose of Muraja'ah System
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  The Muraja'ah (Review) System is designed to help you maintain and strengthen your Qur'an memorization through intelligent spaced repetition. It ensures that what you've memorized stays fresh in your memory through systematic daily reviews.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📊 What You'll Find Here
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li><strong>Dashboard:</strong> Your daily overview with review cycles and memorization goals</li>
                  <li><strong>Today's Muraja'ah:</strong> Daily review tasks for RMV, OMV, Listening, and Reading</li>
                  <li><strong>Memorization Planner:</strong> Create and manage your memorization schedule</li>
                  <li><strong>Muraja'ah Log:</strong> Track your review history and progress</li>
                  <li><strong>Hifdh Progress:</strong> Monitor your memorization progress by Juz and Surah</li>
                  <li><strong>Settings:</strong> Customize your review cycles and preferences</li>
                  <li><strong>Import/Export:</strong> Backup and restore your memorization data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🔄 Review Cycle Types
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">📖 RMV (Recent Memorization Review)</h4>
                    <p className="text-sm text-gray-600">Review the last few pages you've memorized to reinforce recent learning.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">🔄 OMV (Old Memorization Review)</h4>
                    <p className="text-sm text-gray-600">Systematic review of previously memorized Juz to prevent forgetting.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">🎧 Listening Review</h4>
                    <p className="text-sm text-gray-600">Listen to recitation of memorized portions to strengthen auditory memory.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">📚 Reading Review</h4>
                    <p className="text-sm text-gray-600">Read through memorized sections to maintain visual recognition.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🚀 How to Use the System
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Set Up Your Progress</h4>
                    <p className="text-sm text-gray-600">Go to "Hifdh Progress" tab and mark the Juz/Surahs you've memorized.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Configure Settings</h4>
                    <p className="text-sm text-gray-600">Adjust review cycles, page counts, and schedules in the "Settings" tab.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Create Memorization Plan</h4>
                    <p className="text-sm text-gray-600">Use "Memorization Planner" to schedule your new memorization tasks.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">4. Daily Reviews</h4>
                    <p className="text-sm text-gray-600">Complete your daily review cycles shown in "Dashboard" and "Today's Muraja'ah".</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">5. Track Progress</h4>
                    <p className="text-sm text-gray-600">Monitor your consistency and streaks in the "Muraja'ah Log".</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  💡 Pro Tips for Effective Review
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li>Complete your review cycles daily to maintain consistency</li>
                  <li>Start with RMV (recent pages) when your memory is fresh</li>
                  <li>Use listening reviews during commutes or light activities</li>
                  <li>Adjust review settings based on your memorization pace</li>
                  <li>Mark weak spots during reviews for focused practice</li>
                  <li>Take advantage of random verse practice for surprise reinforcement</li>
                  <li>Regular backup of your data using Import/Export feature</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📱 Features Overview
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li><strong>Intelligent Scheduling:</strong> Automatic daily review cycle generation</li>
                  <li><strong>Progress Tracking:</strong> Visual progress bars and completion statistics</li>
                  <li><strong>Streak Counter:</strong> Motivation through daily completion streaks</li>
                  <li><strong>Achievement System:</strong> Unlock badges for memorization milestones</li>
                  <li><strong>Random Practice:</strong> Surprise verse testing for memory reinforcement</li>
                  <li><strong>Flexible Settings:</strong> Customizable review preferences and schedules</li>
                  <li><strong>Data Management:</strong> Backup, restore, and sync capabilities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📚 Getting Started Checklist
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <ol className="text-sm sm:text-base text-blue-700 space-y-2 list-decimal list-inside">
                    <li>Mark your memorized Juz/Surahs in "Hifdh Progress"</li>
                    <li>Set your current memorization Juz in "Settings"</li>
                    <li>Adjust RMV page count and OMV Juz count as needed</li>
                    <li>Create your memorization schedule in "Memorization Planner"</li>
                    <li>Start completing daily review cycles from "Dashboard"</li>
                    <li>Track your progress and maintain consistency</li>
                  </ol>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                  🤲 Islamic Reminder
                </h3>
                <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                  "And recite the Qur'an with measured recitation." (73:4)
                  <br /><br />
                  Consistent review (Muraja'ah) is essential for maintaining your Qur'an memorization. The Prophet (ﷺ) said: "Keep on reciting the Qur'an, for by Him in Whose Hand my soul is, Qur'an runs away faster than camels that are released from their tying ropes."
                  <br /><br />
                  May Allah make your memorization and review efforts a source of blessing and guidance. Remember, consistency is more valuable than intensity.
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="text-center mb-6 sm:mb-8 mt-12 sm:mt-0">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Your Schedule
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
          Intelligent spaced repetition system for Quran memorization. Track your progress and get automated daily review cycles.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto md:h-10">
          <TabsTrigger value="dashboard" className="text-xs md:text-sm px-1 md:px-3 py-2 md:py-1.5">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs md:text-sm px-1 md:px-3 py-2 md:py-1.5">
            Today's Muraja'ah
          </TabsTrigger>
          <TabsTrigger value="planner" className="text-xs md:text-sm px-1 md:px-3 py-2 md:py-1.5">
            Memorization Planner
          </TabsTrigger>
          <TabsTrigger value="log" className="text-xs md:text-sm px-1 md:px-3 py-2 md:py-1.5">
            Muraja'ah Log
          </TabsTrigger>
          <TabsTrigger value="hifdh-settings" className="text-xs md:text-sm px-1 md:px-3 py-2 md:py-1.5">
            Set Hifdh Settings
          </TabsTrigger>
          <TabsTrigger value="import-export" className="text-xs md:text-sm px-1 md:px-3 py-2 md:py-1.5">
            Import/Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <MurajahMainDashboard />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <MurajahDashboard />
        </TabsContent>

        <TabsContent value="planner" className="space-y-6">
          <MemorizationPlanner />
        </TabsContent>

        <TabsContent value="log" className="space-y-6">
          <MurajahLog />
        </TabsContent>

        <TabsContent value="hifdh-settings" className="space-y-6">
          <Tabs defaultValue="hifdh-progress" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hifdh-progress">
                Hifdh Progress
              </TabsTrigger>
              <TabsTrigger value="review-settings">
                Review Cycle Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="hifdh-progress">
              <JuzMemorizationTracker />
            </TabsContent>
            <TabsContent value="review-settings">
              <ReviewSettings />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <ImportExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Murajah;
