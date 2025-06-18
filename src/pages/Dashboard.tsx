
import React from "react";
import { MurajahMainDashboard } from "@/components/murajah/MurajahMainDashboard";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-hidden">
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-2">
          Your comprehensive overview of memorization progress, review cycles, and achievements
        </p>
      </div>

      <MurajahMainDashboard />
    </div>
  );
};

export default Dashboard;
