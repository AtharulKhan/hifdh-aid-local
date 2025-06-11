
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuranPageViewerMobile } from "./QuranPageViewerMobile";
import { QuranPageViewerDesktop } from "./QuranPageViewerDesktop";

interface QuranPageViewerProps {
  startingVerseId?: number;
}

export const QuranPageViewer: React.FC<QuranPageViewerProps> = ({ startingVerseId = 1 }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <QuranPageViewerMobile startingVerseId={startingVerseId} />;
  }

  return <QuranPageViewerDesktop startingVerseId={startingVerseId} />;
};
