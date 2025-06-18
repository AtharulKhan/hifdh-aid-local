
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWeakSpots } from '@/hooks/useWeakSpots';

export const WeakSpotsHub: React.FC = () => {
  const { user } = useAuth();
  const { weakSpots, loading } = useWeakSpots();

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading weak spots...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">Please log in to see your weak spots.</div>;
  }

  if (weakSpots.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Weak Spots</h1>
        <div className="text-center">
          <p className="text-gray-600 mb-4">No weak spots flagged yet.</p>
          <p className="text-sm text-gray-500">
            Look for the flag icon 🚩 next to verses throughout the app to mark them as weak spots!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Weak Spots</h1>
      <p className="text-center text-gray-600 mb-6">
        {weakSpots.length} verse{weakSpots.length !== 1 ? 's' : ''} flagged for review
      </p>
      
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {weakSpots.map(spot => (
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
