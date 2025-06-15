
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemorizationSystem } from "@/components/quran-system/MemorizationSystem";
import { ReviewSystem } from "@/components/quran-system/ReviewSystem";
import { MemorizationPlanner } from "@/components/quran-system/MemorizationPlanner";

const QuranSystem = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Qur'an System
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive memorization and review methods for mastering the Holy Qur'an
        </p>
      </div>

      <Tabs defaultValue="memorization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-12">
          <TabsTrigger value="memorization" className="text-xs md:text-sm px-2 md:px-3 py-2 md:py-1.5">
            Qur'an Memorization System
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs md:text-sm px-2 md:px-3 py-2 md:py-1.5">
            Qur'an Review System
          </TabsTrigger>
          <TabsTrigger value="planner" className="text-xs md:text-sm px-2 md:px-3 py-2 md:py-1.5">
            Memorization Planner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memorization" className="space-y-6">
          <MemorizationSystem />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <ReviewSystem />
        </TabsContent>
        
        <TabsContent value="planner" className="space-y-6">
          <MemorizationPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuranSystem;
