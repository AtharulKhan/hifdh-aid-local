
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWeakSpots } from '@/hooks/useWeakSpots';
import { HelpCircle } from 'lucide-react';

export const WeakSpotsHub: React.FC = () => {
  const { user } = useAuth();
  const { weakSpots, loading } = useWeakSpots();
  const [helpOpen, setHelpOpen] = useState(false);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading weak spots...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">Please log in to see your weak spots.</div>;
  }

  if (weakSpots.length === 0) {
    return (
      <div className="container mx-auto p-4 relative">
        {/* Help Button */}
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 h-8 w-8 sm:h-10 sm:w-10 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl h-[80vh] p-0 gap-0">
            <DialogHeader className="p-4 sm:p-6 pb-2 border-b">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-green-700">
                Weak Spots Hub Help & Guide
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6 pr-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🎯 Purpose of Weak Spots Hub
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    The Weak Spots Hub is your central place to track and review verses that need extra attention during your Quran memorization journey. It helps you identify, organize, and systematically review challenging verses.
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🚩 What Are Weak Spots?
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Weak spots are verses that you've flagged as needing extra practice and review. These might be verses you find difficult to memorize, tend to forget, or struggle with pronunciation or meaning.
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    📝 How to Flag Weak Spots
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Throughout the App</h4>
                      <p className="text-sm text-gray-600">Look for the flag icon 🚩 next to verses in the Page Viewer, Test pages, and other sections.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Click to Flag</h4>
                      <p className="text-sm text-gray-600">Simply click the flag icon to mark a verse as a weak spot that needs review.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Automatic Collection</h4>
                      <p className="text-sm text-gray-600">All flagged verses automatically appear here in your Weak Spots Hub for easy access.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🔍 What You'll Find Here
                  </h3>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                    <li><strong>Verse List:</strong> All your flagged verses organized by surah and ayah</li>
                    <li><strong>Quick Reference:</strong> Arabic text snippet for each verse</li>
                    <li><strong>Verse Details:</strong> Surah name and verse location (surah:ayah)</li>
                    <li><strong>Review Button:</strong> Direct link to study each verse in detail</li>
                    <li><strong>Progress Tracking:</strong> See how many verses need your attention</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🚀 How to Use This Hub
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Review Regularly</h4>
                      <p className="text-sm text-gray-600">Visit this hub daily to see which verses need your attention and practice.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Click 'Review Verse'</h4>
                      <p className="text-sm text-gray-600">Use the Review Verse button to go directly to the verse with full context and tools.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Systematic Practice</h4>
                      <p className="text-sm text-gray-600">Work through your weak spots systematically, focusing on a few at a time.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-700">4. Track Progress</h4>
                      <p className="text-sm text-gray-600">As you master verses, you can unflag them to keep your list focused.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    💡 Study Strategies
                  </h3>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                    <li>Focus on 3-5 weak spots per study session to avoid overwhelm</li>
                    <li>Review weak spots at the beginning and end of each study session</li>
                    <li>Practice weak spots with different methods (audio, writing, recitation)</li>
                    <li>Connect weak spots to surrounding verses for better context</li>
                    <li>Set aside dedicated time weekly for weak spot review</li>
                    <li>Use the consolidation view to see verses in their full surah context</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    🎯 Getting Started
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    If you don't see any weak spots yet, start exploring the Page Viewer and other sections of the app. Look for the flag icon 🚩 next to verses and click it when you encounter challenging verses during your memorization or review sessions.
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    📱 Mobile Features
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    The Weak Spots Hub is fully optimized for mobile devices with touch-friendly interfaces, easy scrolling, and quick access to review functions wherever you are.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                    🤲 Remember
                  </h3>
                  <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                    "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?" (54:17)
                    <br /><br />
                    Identifying weak spots is not about pointing out failures—it's about strategic improvement. Every hafiz has verses that need extra attention. Use this tool to strengthen your memorization systematically. May Allah make your path to memorization easy and blessed!
                  </p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

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
    <div className="container mx-auto p-4 relative">
      {/* Help Button */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-10 h-8 w-8 sm:h-10 sm:w-10 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-2xl h-[80vh] p-0 gap-0">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-green-700">
              Weak Spots Hub Help & Guide
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6 pr-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🎯 Purpose of Weak Spots Hub
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  The Weak Spots Hub is your central place to track and review verses that need extra attention during your Quran memorization journey. It helps you identify, organize, and systematically review challenging verses.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🚩 What Are Weak Spots?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Weak spots are verses that you've flagged as needing extra practice and review. These might be verses you find difficult to memorize, tend to forget, or struggle with pronunciation or meaning.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📝 How to Flag Weak Spots
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Throughout the App</h4>
                    <p className="text-sm text-gray-600">Look for the flag icon 🚩 next to verses in the Page Viewer, Test pages, and other sections.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Click to Flag</h4>
                    <p className="text-sm text-gray-600">Simply click the flag icon to mark a verse as a weak spot that needs review.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Automatic Collection</h4>
                    <p className="text-sm text-gray-600">All flagged verses automatically appear here in your Weak Spots Hub for easy access.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🔍 What You'll Find Here
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li><strong>Verse List:</strong> All your flagged verses organized by surah and ayah</li>
                  <li><strong>Quick Reference:</strong> Arabic text snippet for each verse</li>
                  <li><strong>Verse Details:</strong> Surah name and verse location (surah:ayah)</li>
                  <li><strong>Review Button:</strong> Direct link to study each verse in detail</li>
                  <li><strong>Progress Tracking:</strong> See how many verses need your attention</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🚀 How to Use This Hub
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Review Regularly</h4>
                    <p className="text-sm text-gray-600">Visit this hub daily to see which verses need your attention and practice.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Click 'Review Verse'</h4>
                    <p className="text-sm text-gray-600">Use the Review Verse button to go directly to the verse with full context and tools.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Systematic Practice</h4>
                    <p className="text-sm text-gray-600">Work through your weak spots systematically, focusing on a few at a time.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700">4. Track Progress</h4>
                    <p className="text-sm text-gray-600">As you master verses, you can unflag them to keep your list focused.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  💡 Study Strategies
                </h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li>Focus on 3-5 weak spots per study session to avoid overwhelm</li>
                  <li>Review weak spots at the beginning and end of each study session</li>
                  <li>Practice weak spots with different methods (audio, writing, recitation)</li>
                  <li>Connect weak spots to surrounding verses for better context</li>
                  <li>Set aside dedicated time weekly for weak spot review</li>
                  <li>Use the consolidation view to see verses in their full surah context</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  🎯 Getting Started
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  If you don't see any weak spots yet, start exploring the Page Viewer and other sections of the app. Look for the flag icon 🚩 next to verses and click it when you encounter challenging verses during your memorization or review sessions.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  📱 Mobile Features
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  The Weak Spots Hub is fully optimized for mobile devices with touch-friendly interfaces, easy scrolling, and quick access to review functions wherever you are.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                  🤲 Remember
                </h3>
                <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                  "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?" (54:17)
                  <br /><br />
                  Identifying weak spots is not about pointing out failures—it's about strategic improvement. Every hafiz has verses that need extra attention. Use this tool to strengthen your memorization systematically. May Allah make your path to memorization easy and blessed!
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
