
import React from "react";
import { TestDashboard } from "@/components/test/TestDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Test = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`bg-[#F9FAFB] min-h-screen ${isMobile ? 'px-2 py-4' : 'container mx-auto px-4 py-8'}`}>
      <TestDashboard />
    </div>
  );
};

export default Test;
