
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navigation, BookOpen } from "lucide-react";
import { getSurahName } from "@/data/quranData";

interface QuranNavigationModalProps {
  onNavigate: (verseId: number, versesPerPage?: number) => void;
  currentVerseId: number;
  maxVerseId: number;
}

export const QuranNavigationModal: React.FC<QuranNavigationModalProps> = ({
  onNavigate,
  currentVerseId,
  maxVerseId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navigationMode, setNavigationMode] = useState<'verse' | 'surah' | 'range'>('verse');
  const [targetVerse, setTargetVerse] = useState('');
  const [targetSurah, setTargetSurah] = useState('');
  const [targetAyah, setTargetAyah] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const handleNavigate = () => {
    if (navigationMode === 'verse') {
      const verseId = parseInt(targetVerse);
      if (verseId >= 1 && verseId <= maxVerseId) {
        onNavigate(verseId);
        setIsOpen(false);
      }
    } else if (navigationMode === 'surah') {
      const surah = parseInt(targetSurah);
      const ayah = parseInt(targetAyah) || 1;
      
      // Simple mapping for the first few verses (this could be expanded)
      if (surah === 1 && ayah >= 1 && ayah <= 7) {
        onNavigate(ayah);
        setIsOpen(false);
      } else if (surah === 2 && ayah >= 1 && ayah <= 13) {
        onNavigate(7 + ayah);
        setIsOpen(false);
      }
    } else if (navigationMode === 'range') {
      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);
      if (start >= 1 && start <= maxVerseId && end >= start && end <= maxVerseId) {
        const rangeSize = end - start + 1;
        onNavigate(start, rangeSize);
        setIsOpen(false);
      }
    }
  };

  const resetForm = () => {
    setTargetVerse('');
    setTargetSurah('');
    setTargetAyah('');
    setRangeStart('');
    setRangeEnd('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-100 bg-blue-50"
          onClick={resetForm}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Navigate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Navigate Quran
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Navigation Mode Selector */}
          <div className="flex gap-2">
            <Button
              variant={navigationMode === 'verse' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNavigationMode('verse')}
              className={navigationMode === 'verse' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100"}
            >
              By Verse ID
            </Button>
            <Button
              variant={navigationMode === 'surah' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNavigationMode('surah')}
              className={navigationMode === 'surah' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100"}
            >
              By Surah
            </Button>
            <Button
              variant={navigationMode === 'range' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNavigationMode('range')}
              className={navigationMode === 'range' ? "bg-blue-300 text-white hover:bg-blue-400" : "border-blue-200 text-blue-700 hover:bg-blue-100"}
            >
              Range
            </Button>
          </div>

          {/* Current Position */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              Currently at verse <Badge variant="outline" className="border-blue-200 text-blue-600">{currentVerseId}</Badge>
            </p>
          </div>

          {/* Navigation Forms */}
          {navigationMode === 'verse' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="verse-id">Verse ID (1-{maxVerseId})</Label>
                <Input
                  id="verse-id"
                  type="number"
                  min="1"
                  max={maxVerseId}
                  value={targetVerse}
                  onChange={(e) => setTargetVerse(e.target.value)}
                  placeholder="Enter verse ID"
                />
              </div>
            </div>
          )}

          {navigationMode === 'surah' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="surah">Surah Number</Label>
                <Input
                  id="surah"
                  type="number"
                  min="1"
                  max="2"
                  value={targetSurah}
                  onChange={(e) => setTargetSurah(e.target.value)}
                  placeholder="1 or 2"
                />
              </div>
              <div>
                <Label htmlFor="ayah">Ayah Number</Label>
                <Input
                  id="ayah"
                  type="number"
                  min="1"
                  value={targetAyah}
                  onChange={(e) => setTargetAyah(e.target.value)}
                  placeholder="Ayah number"
                />
              </div>
              {targetSurah && (
                <p className="text-sm text-gray-600">
                  {getSurahName(parseInt(targetSurah))}
                </p>
              )}
            </div>
          )}

          {navigationMode === 'range' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="range-start">Start Verse ID</Label>
                <Input
                  id="range-start"
                  type="number"
                  min="1"
                  max={maxVerseId}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  placeholder="Start verse"
                />
              </div>
              <div>
                <Label htmlFor="range-end">End Verse ID</Label>
                <Input
                  id="range-end"
                  type="number"
                  min="1"
                  max={maxVerseId}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  placeholder="End verse"
                />
              </div>
              {rangeStart && rangeEnd && (
                <p className="text-sm text-gray-600">
                  Range: {parseInt(rangeEnd) - parseInt(rangeStart) + 1} verses
                </p>
              )}
            </div>
          )}

          {/* Navigation Button */}
          <Button
            onClick={handleNavigate}
            className="w-full bg-blue-300 text-white hover:bg-blue-400"
          >
            Navigate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
