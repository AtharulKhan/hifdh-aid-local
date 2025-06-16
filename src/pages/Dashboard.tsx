
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MurajahMainDashboard } from "@/components/murajah/MurajahMainDashboard";
import { MushafViewer } from "@/components/mushaf/MushafViewer";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your comprehensive overview of memorization progress, review cycles, and achievements
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="overview" className="text-sm px-3 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="mushaf" className="text-sm px-3 py-2">
            Mushaf
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MurajahMainDashboard />
        </TabsContent>

        <TabsContent value="mushaf" className="space-y-6">
          <MushafViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
