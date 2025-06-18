
import React, { useState } from "react";
import { MurajahMainDashboard } from "@/components/murajah/MurajahMainDashboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, BookOpen, RotateCcw, Clock, PlayCircle } from "lucide-react";

const Dashboard = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-0 right-0 hover:scale-105 transition-transform duration-200"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl animate-scale-in">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-green-600 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Dashboard Guide
              </DialogTitle>
              <DialogDescription className="text-left">
                Welcome to your Hifdh (Quran Memorization) Dashboard! This is your central hub for managing and tracking your Quran memorization journey.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">What is this page for?</h3>
                <p className="text-gray-600 leading-relaxed">
                  The Dashboard provides a comprehensive overview of your daily review cycles, memorization progress, and achievements. 
                  It's designed to help you maintain consistent practice and track your Hifdh journey effectively.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Review Cycle Types</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">RMV (Recent Memorization)</h4>
                      <p className="text-sm text-green-700">Review the most recently memorized pages to strengthen retention</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <RotateCcw className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800">OMV (Old Memorization)</h4>
                      <p className="text-sm text-purple-700">Rotating review of previously memorized content to maintain long-term retention</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <PlayCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Listening Cycle</h4>
                      <p className="text-sm text-blue-700">Listen to recitations to improve pronunciation and rhythm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800">Reading Cycle</h4>
                      <p className="text-sm text-orange-700">Read through memorized portions to maintain fluency</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">How to use this page</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-start gap-2">
                    <span className="font-medium text-green-600">1.</span>
                    Start by marking your memorized content in the Juz or Surah tabs
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-medium text-green-600">2.</span>
                    Configure your review settings to customize cycle lengths
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-medium text-green-600">3.</span>
                    Complete your daily review cycles by clicking the "Complete" button
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-medium text-green-600">4.</span>
                    Track your progress and maintain consistency in your practice
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-400">
                <p className="text-emerald-800 font-medium">💡 Tip</p>
                <p className="text-emerald-700 text-sm mt-1">
                  Consistency is key in Hifdh. Try to complete all your daily cycles to maintain strong memorization retention.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <MurajahMainDashboard />
    </div>
  );
};

export default Dashboard;
