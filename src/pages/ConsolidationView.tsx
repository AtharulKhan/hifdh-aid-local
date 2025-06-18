
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getVerseById, getSurahName, getVersesArray, QuranVerse, getVerseBySurahAyah as getQuranVerseBySurahAyah } from '@/data/quranData';
import { VerseDisplay } from '@/types/features';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ConsolidationView: React.FC = () => {
  const { surah_number: surahParam, ayah_number: ayahParam } = useParams<{ surah_number: string; ayah_number: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [weakVerse, setWeakVerse] = useState<VerseDisplay | null>(null);
  const [precedingVerses, setPrecedingVerses] = useState<VerseDisplay[]>([]);
  const [followingVerses, setFollowingVerses] = useState<VerseDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mastering, setMastering] = useState<boolean>(false);

  const surahNumber = parseInt(surahParam || '0');
  const ayahNumber = parseInt(ayahParam || '0');

  // Memoize allVerses to prevent re-fetching unless quranData changes
  const allVerses = useMemo(() => getVersesArray(), []);

  useEffect(() => {
    if (!surahNumber || !ayahNumber || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const rawCurrentVerse = getQuranVerseBySurahAyah(surahNumber, ayahNumber, allVerses);

    let currentVerseDisplay: VerseDisplay | null = null;
    if (rawCurrentVerse) {
      currentVerseDisplay = {
        id: rawCurrentVerse.id,
        surah_number: rawCurrentVerse.surah,
        ayah_number: rawCurrentVerse.ayah,
        text: rawCurrentVerse.text,
        verse_key: rawCurrentVerse.verse_key,
      };
    }
    setWeakVerse(currentVerseDisplay);

    if (currentVerseDisplay) {
      const currentGlobalId = currentVerseDisplay.id;

      // Preceding verses
      const preceding: VerseDisplay[] = [];
      for (let i = 1; i <= 5; i++) {
        const prevGlobalId = currentGlobalId - i;
        if (prevGlobalId < 1) break; // Start of Quran
        const prevVerseData = getVerseById(prevGlobalId);
        if (prevVerseData && prevVerseData.surah === surahNumber) {
          preceding.unshift({
            id: prevVerseData.id,
            surah_number: prevVerseData.surah,
            ayah_number: prevVerseData.ayah,
            text: prevVerseData.text,
            verse_key: prevVerseData.verse_key,
          });
        } else if (prevVerseData && prevVerseData.surah !== surahNumber) {
            break; // Crossed Surah boundary
        } else {
            break; // No verse found or other issue
        }
      }
      setPrecedingVerses(preceding);

      // Following verses
      const following: VerseDisplay[] = [];
      const maxQuranVerseId = allVerses[allVerses.length - 1].id;
      for (let i = 1; i <= 5; i++) {
        const nextGlobalId = currentGlobalId + i;
        if (nextGlobalId > maxQuranVerseId) break; // End of Quran
        const nextVerseData = getVerseById(nextGlobalId);
        if (nextVerseData && nextVerseData.surah === surahNumber) {
          following.push({
            id: nextVerseData.id,
            surah_number: nextVerseData.surah,
            ayah_number: nextVerseData.ayah,
            text: nextVerseData.text,
            verse_key: nextVerseData.verse_key,
          });
        } else if (nextVerseData && nextVerseData.surah !== surahNumber) {
            break; // Crossed Surah boundary
        } else {
            break; // No verse found
        }
      }
      setFollowingVerses(following);
    }

    setLoading(false);
  }, [surahNumber, ayahNumber, user, allVerses]);

  const markAsMastered = async () => {
    if (!user || !weakVerse || mastering) return;
    
    setMastering(true);
    try {
      const { error } = await supabase
        .from('weak_spots')
        .update({ status: 'mastered' })
        .match({
          user_id: user.id,
          surah_number: weakVerse.surah_number,
          ayah_number: weakVerse.ayah_number
        });

      if (error) {
        console.error('Error marking as mastered:', error);
        toast({
          title: "Error",
          description: "Failed to mark verse as mastered. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Verse marked as mastered and removed from weak spots.",
        });
        navigate('/weak-spots');
      }
    } catch (e) {
      console.error('Exception marking as mastered:', e);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMastering(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading verse context...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">Please log in to manage your weak spots.</div>;
  }

  if (!weakVerse) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="mb-4">Verse not found. Please check the parameters.</p>
        <Button onClick={() => navigate('/weak-spots')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Weak Spots
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => navigate('/weak-spots')} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Weak Spots
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Consolidating: {getSurahName(weakVerse.surah_number)} - Ayah {weakVerse.ayah_number} ({weakVerse.verse_key})
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-3 text-right font-arabic text-lg leading-relaxed">
        {precedingVerses.map(verse => (
          <Card key={verse.id} className="p-4 bg-gray-50 opacity-70">
            <p className="text-sm text-gray-500 mb-1 text-left">{verse.verse_key}</p>
            <p dir="rtl">{verse.text}</p>
          </Card>
        ))}

        <Card key={weakVerse.id} className="p-6 bg-green-50 border-2 border-green-500 shadow-lg my-6">
          <p className="text-sm text-green-700 mb-2 text-left font-sans">
            <Badge variant="default">{weakVerse.verse_key}</Badge> - Focus Verse
          </p>
          <p dir="rtl" className="text-2xl text-green-800">{weakVerse.text}</p>
        </Card>

        {followingVerses.map(verse => (
          <Card key={verse.id} className="p-4 bg-gray-50 opacity-70">
            <p className="text-sm text-gray-500 mb-1 text-left">{verse.verse_key}</p>
            <p dir="rtl">{verse.text}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button 
          onClick={markAsMastered} 
          size="lg" 
          className="bg-green-600 hover:bg-green-700"
          disabled={mastering}
        >
          {mastering ? (
            "Marking as Mastered..."
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Mark as Mastered
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConsolidationView;
