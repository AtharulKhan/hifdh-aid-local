
import React, { createContext, useContext } from 'react';
import { useWeakSpots } from '@/hooks/useWeakSpots';
import { WeakSpotDisplay, FlaggedVerseIdentifier } from '@/types/features';

interface WeakSpotsContextType {
  weakSpots: WeakSpotDisplay[];
  loading: boolean;
  isVerseFlagged: (surahNumber: number, ayahNumber: number) => boolean;
  refetch: () => void;
}

const WeakSpotsContext = createContext<WeakSpotsContextType | undefined>(undefined);

export const useWeakSpotsContext = () => {
  const context = useContext(WeakSpotsContext);
  if (context === undefined) {
    throw new Error('useWeakSpotsContext must be used within a WeakSpotsProvider');
  }
  return context;
};

export const WeakSpotsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const weakSpotsData = useWeakSpots();

  return (
    <WeakSpotsContext.Provider value={weakSpotsData}>
      {children}
    </WeakSpotsContext.Provider>
  );
};
