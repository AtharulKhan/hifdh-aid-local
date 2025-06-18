
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WeakSpotDisplay, FlaggedVerseIdentifier } from '@/types/features';
import { getSurahName, getVersesArray, getVerseBySurahAyah } from '@/data/quranData';
import { getVerseSnippet } from '@/lib/utils';

export const useWeakSpots = () => {
  const { user } = useAuth();
  const [weakSpots, setWeakSpots] = useState<WeakSpotDisplay[]>([]);
  const [flaggedVerses, setFlaggedVerses] = useState<FlaggedVerseIdentifier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWeakSpots = async () => {
    if (!user) {
      setWeakSpots([]);
      setFlaggedVerses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: rawWeakSpots, error } = await supabase
        .from('weak_spots')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'weak')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching weak spots:', error);
        setWeakSpots([]);
        setFlaggedVerses([]);
      } else if (rawWeakSpots) {
        const allVerses = getVersesArray();
        
        const displayData: WeakSpotDisplay[] = rawWeakSpots.map(spot => {
          const verseData = getVerseBySurahAyah(spot.surah_number, spot.ayah_number, allVerses);
          
          let textSnippet = "Snippet not available.";
          let verseKey = `${spot.surah_number}:${spot.ayah_number}`;

          if (verseData) {
            verseKey = verseData.verse_key;
            textSnippet = getVerseSnippet(verseData.text);
          }

          return {
            ...spot,
            status: spot.status as 'weak' | 'mastered', // Type assertion to fix TypeScript error
            verse_key: verseKey,
            text_snippet: textSnippet,
            surah_name: getSurahName(spot.surah_number),
          };
        });

        setWeakSpots(displayData);
        
        // Create flagged verses list for quick lookup
        const flagged: FlaggedVerseIdentifier[] = rawWeakSpots.map(spot => ({
          surah_number: spot.surah_number,
          ayah_number: spot.ayah_number
        }));
        setFlaggedVerses(flagged);
      }
    } catch (e) {
      console.error('Exception fetching weak spots:', e);
      setWeakSpots([]);
      setFlaggedVerses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeakSpots();
  }, [user]);

  const isVerseFlagged = (surahNumber: number, ayahNumber: number): boolean => {
    return flaggedVerses.some(
      verse => verse.surah_number === surahNumber && verse.ayah_number === ayahNumber
    );
  };

  const refetch = () => {
    fetchWeakSpots();
  };

  return {
    weakSpots,
    loading,
    isVerseFlagged,
    refetch
  };
};
