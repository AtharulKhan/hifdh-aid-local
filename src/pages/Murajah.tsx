
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MurajahDashboard } from "@/components/murajah/MurajahDashboard";
import { MemorizationTracker } from "@/components/murajah/MemorizationTracker";
import { ReviewSettings } from "@/components/murajah/ReviewSettings";

const Murajah = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Muraja'ah - Smart Review
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Intelligent spaced repetition system for Quran memorization. Track your progress and get automated daily review cycles.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Today's Review</TabsTrigger>
          <TabsTrigger value="tracker">Memorization Tracker</TabsTrigger>
          <TabsTrigger value="settings">Review Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <MurajahDashboard />
        </TabsContent>

        <TabsContent value="tracker" className="space-y-6">
          <MemorizationTracker />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ReviewSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Murajah;
