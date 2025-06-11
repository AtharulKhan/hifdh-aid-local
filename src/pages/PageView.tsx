
import React from "react";
import { QuranPageViewer } from "@/components/quran/QuranPageViewer";
import { useIsMobile } from "@/hooks/use-mobile";

const PageView = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'px-0 py-4' : 'container mx-auto px-4 py-8'}`}>
      <QuranPageViewer />
    </div>
  );
};

export default PageView;
