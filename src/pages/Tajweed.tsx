
import React from "react";
import { TajweedDashboard } from "@/components/tajweed/TajweedDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Tajweed = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`bg-[#F9FAFB] min-h-screen ${isMobile ? 'px-2 py-4' : 'container mx-auto px-4 py-8'}`}>
      <TajweedDashboard />
    </div>
  );
};

export default Tajweed;
