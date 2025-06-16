
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookText, ArrowRight, BookOpen, ClipboardCheck } from "lucide-react";
import { TajweedLearning } from "./TajweedLearning";
import { TajweedTest } from "./TajweedTest";
import { ExpandableSection } from "@/components/ui/ExpandableSection";

export const TajweedDashboard = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <BookText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Tajweed Refresher</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Master the art of beautiful Quranic recitation through comprehensive Tajweed rules and interactive testing.
        </p>
      </div>

      {/* Tabs for Learn and Test */}
      <Tabs defaultValue="learn" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="learn" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Learn Tajweed</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center space-x-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Test Tajweed</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learn">
          <ExpandableSection initialHeight="200px" title="Tajweed Learning Content">
            <TajweedLearning />
          </ExpandableSection>
        </TabsContent>

        <TabsContent value="test">
          <ExpandableSection initialHeight="200px" title="Tajweed Test Content">
            <TajweedTest />
          </ExpandableSection>
        </TabsContent>
      </Tabs>
    </div>
  );
};
