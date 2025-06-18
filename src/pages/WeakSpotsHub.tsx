import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { getSurahName, QuranVerse, getVersesArray, getVerseBySurahAyah } from '@/data/quranData';
import { getVerseSnippet } from '@/lib/utils';
import { WeakSpotDisplay } from '@/types/features';
import { Tables } from '@/integrations/supabase/types';

export const WeakSpotsHub: React.FC = () => {
  const { user } = useAuth();
  // Supabase data will conform to Tables<'weak_spots'> which is WeakSpotRow
  // We then map it to WeakSpotDisplay for our UI
  const [weakSpotsList, setWeakSpotsList] = useState<WeakSpotDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeakSpots = async () => {
      if (!user) {
        setLoading(false);
        setWeakSpotsList([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch all columns needed for WeakSpotDisplay that come directly from the DB
        const { data: rawWeakSpots, error } = await supabase
          .from('weak_spots')
          .select('id, user_id, surah_number, ayah_number, status, created_at, updated_at')
          .eq('user_id', user.id)
          .eq('status', 'weak')
          .returns<Tables<'weak_spots'>[]>(); // Ensure Supabase client returns the correct type

        if (error) {
          console.error('Error fetching weak spots:', error);
          setWeakSpotsList([]);
        } else if (rawWeakSpots) {
          const allVerses = getVersesArray(); // Get all verses once for efficiency

          const displayDataList: WeakSpotDisplay[] = rawWeakSpots.map(spot => {
            const verseData = getVerseBySurahAyah(spot.surah_number, spot.ayah_number, allVerses);

            let textSnippet = "Snippet not available.";
            let verseKey = `${spot.surah_number}:${spot.ayah_number}`;

            if (verseData) {
              verseKey = verseData.verse_key;
              textSnippet = getVerseSnippet(verseData.text); // Use utility function
            }

            return {
              ...spot, // Spread all fields from the raw weak spot
              verse_key: verseKey,
              text_snippet: textSnippet,
              surah_name: getSurahName(spot.surah_number),
            };
          });
          setWeakSpotsList(displayDataList);
        }
      } catch (e) {
        console.error('Exception fetching weak spots:', e);
        setWeakSpotsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeakSpots();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading weak spots...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">Please log in to see your weak spots.</div>;
  }

  if (weakSpotsList.length === 0) {
    return <div className="container mx-auto p-4 text-center">No weak spots flagged yet. Start reviewing to identify them!</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Weak Spots</h1>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {weakSpotsList.map(spot => (
          <Card key={spot.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {spot.surah_name} ({spot.verse_key})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3 font-arabic text-right" dir="rtl">
                {spot.text_snippet}
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">Surah {spot.surah_number}, Ayah {spot.ayah_number}</Badge>
                <Button asChild size="sm">
                  <Link to={`/consolidation-view/${spot.surah_number}/${spot.ayah_number}`}>
                    Review Verse
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeakSpotsHub;
