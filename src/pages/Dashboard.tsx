
import React from "react";
import { MurajahMainDashboard } from "@/components/murajah/MurajahMainDashboard";

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

      <MurajahMainDashboard />
    </div>
  );
};

export default Dashboard;
