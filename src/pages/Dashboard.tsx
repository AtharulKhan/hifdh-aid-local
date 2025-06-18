
import React, { useState } from "react";
import { MurajahMainDashboard } from "@/components/murajah/MurajahMainDashboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";

const Dashboard = () => {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-hidden">
      <div className="text-center mb-4 sm:mb-8 relative">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-2">
          Your comprehensive overview of memorization progress, review cycles, and achievements
        </p>
        
        {/* Help Button */}
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-0 right-0 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl h-[80vh] p-0 gap-0">
            <DialogHeader className="p-4 sm:p-6 pb-2 border-b">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-green-700">
                Dashboard Help & Guide
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6 pr-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🎯 Purpose of the Dashboard
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    The Dashboard is your central hub for monitoring your Qur'an memorization journey. It provides a comprehensive overview of your progress, review schedules, and achievements all in one place.
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    📊 What You'll Find Here
                  </h3>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                    <li><strong>Progress Overview:</strong> Track your memorization progress across different surahs and juz</li>
                    <li><strong>Review Schedule:</strong> See what needs to be reviewed today and upcoming review sessions</li>
                    <li><strong>Statistics:</strong> View detailed analytics about your memorization journey</li>
                    <li><strong>Recent Activity:</strong> Monitor your latest memorization and review activities</li>
                    <li><strong>Achievement Badges:</strong> Celebrate milestones and accomplishments</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🚀 How to Use the Dashboard
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Quick Navigation</h4>
                      <p className="text-sm text-gray-600">Use the navigation cards to quickly jump to specific features like memorization, review, or testing.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Progress Tracking</h4>
                      <p className="text-sm text-gray-600">Monitor your daily, weekly, and monthly progress through visual charts and progress bars.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Review Management</h4>
                      <p className="text-sm text-gray-600">Check what verses need review today and plan your revision schedule accordingly.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">4. Goal Setting</h4>
                      <p className="text-sm text-gray-600">Set daily and weekly memorization goals and track your consistency.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    💡 Pro Tips
                  </h3>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                    <li>Check your dashboard daily to stay on track with your memorization goals</li>
                    <li>Use the review reminders to maintain what you've already memorized</li>
                    <li>Celebrate small wins by viewing your achievement badges</li>
                    <li>Analyze your progress trends to identify the best times for memorization</li>
                    <li>Set realistic daily goals based on your schedule and capacity</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🔗 Quick Actions
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    From the dashboard, you can quickly navigate to:
                  </p>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-1 list-disc list-inside mt-2">
                    <li>Start a new memorization session</li>
                    <li>Begin daily review</li>
                    <li>Take a memorization test</li>
                    <li>View detailed progress reports</li>
                    <li>Access learning resources and guides</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                    🤲 Remember
                  </h3>
                  <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                    "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?" (54:17)
                    <br /><br />
                    Your journey of memorizing the Qur'an is a blessed endeavor. Use this dashboard to stay organized, motivated, and consistent in your efforts. May Allah make it easy for you!
                  </p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <MurajahMainDashboard />
    </div>
  );
};

export default Dashboard;
