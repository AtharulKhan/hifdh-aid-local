
import React, { useState, useEffect } from 'react';
import { QuranVerse, getVersesArray, getTranslationForVerse } from '@/data/quranData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { WeakSpotFlag } from '@/components/weak-spots/WeakSpotFlag';

interface PracticeVerseCardProps {
  startVerse: QuranVerse;
}

export const PracticeVerseCard: React.FC<PracticeVerseCardProps> = ({ startVerse }) => {
  const [currentlyDisplayedVerse, setCurrentlyDisplayedVerse] = useState<QuranVerse>(startVerse);
  const [versesShownCount, setVersesShownCount] = useState<number>(1);
  const [isLastVerseInSequence, setIsLastVerseInSequence] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  useEffect(() => {
    setCurrentlyDisplayedVerse(startVerse);
    setVersesShownCount(1);
    setIsLastVerseInSequence(false);

    // Initial check if the startVerse itself is at a sequence boundary
    const allVerses = getVersesArray();
    const startIndex = allVerses.findIndex(v => v.id === startVerse.id);

    if (startIndex === -1) {
        setIsLastVerseInSequence(true); // Should not happen if startVerse is valid
        return;
    }
    if (versesShownCount >= 15) { // versesShownCount is 1 here
        setIsLastVerseInSequence(true);
        return;
    }

    const nextVersePreCheck = allVerses[startIndex + 1];
    if (!nextVersePreCheck || nextVersePreCheck.surah !== startVerse.surah) {
        setIsLastVerseInSequence(true);
    }

  }, [startVerse]); // Removed versesShownCount from dependency array as it's always 1 here

  const handleShowNextAyah = () => {
    if (versesShownCount >= 15) {
      setIsLastVerseInSequence(true);
      return;
    }

    const allVerses = getVersesArray();
    const currentIndex = allVerses.findIndex(v => v.id === currentlyDisplayedVerse.id);

    if (currentIndex === -1) {
      // Should not happen if currentlyDisplayedVerse is always valid
      setIsLastVerseInSequence(true);
      return;
    }

    const nextVerse = allVerses[currentIndex + 1];

    if (!nextVerse || nextVerse.surah !== currentlyDisplayedVerse.surah) {
      setIsLastVerseInSequence(true);
      return;
    }

    setCurrentlyDisplayedVerse(nextVerse);
    const newVersesShownCount = versesShownCount + 1;
    setVersesShownCount(newVersesShownCount);

    if (newVersesShownCount >= 15) {
      setIsLastVerseInSequence(true);
    }
  };

  if (!currentlyDisplayedVerse) {
    return <div className="p-4 rounded-lg bg-gray-50 border">Error: Verse data not available.</div>;
  }

  const translation = getTranslationForVerse(currentlyDisplayedVerse.surah, currentlyDisplayedVerse.ayah);

  return (
    <div className="p-4 rounded-lg bg-gray-50 border">
      <div className="flex justify-between items-start mb-2">
        <Badge variant="secondary">
          Surah {currentlyDisplayedVerse.surah}, Ayah {currentlyDisplayedVerse.ayah}
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Verse Key: {currentlyDisplayedVerse.verse_key}</span>
          <WeakSpotFlag 
            surahNumber={currentlyDisplayedVerse.surah}
            ayahNumber={currentlyDisplayedVerse.ayah}
            size="sm"
          />
        </div>
      </div>
      
      {/* Translation Toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">Show Translation:</span>
        <Switch
          checked={showTranslation}
          onCheckedChange={setShowTranslation}
        />
      </div>
      
      <p className="text-right text-xl leading-loose font-arabic mb-2" dir="rtl">
        {currentlyDisplayedVerse.text}
      </p>
      
      {/* Translation Display */}
      {showTranslation && translation && (
        <div className="mb-4">
          <p className="text-right text-gray-700 text-sm leading-relaxed italic">
            {translation}
          </p>
        </div>
      )}
      
      <Button
        onClick={handleShowNextAyah}
        disabled={isLastVerseInSequence}
        className="w-full"
      >
        Show Next Ayah ({versesShownCount}/15)
      </Button>
    </div>
  );
};
