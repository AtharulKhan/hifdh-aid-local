
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemorizationSystem } from "@/components/quran-system/MemorizationSystem";
import { ReviewSystem } from "@/components/quran-system/ReviewSystem";

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="memorization">Qur'an Memorization System</TabsTrigger>
          <TabsTrigger value="review">Qur'an Review System</TabsTrigger>
        </TabsList>

        <TabsContent value="memorization" className="space-y-6">
          <MemorizationSystem />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <ReviewSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuranSystem;
