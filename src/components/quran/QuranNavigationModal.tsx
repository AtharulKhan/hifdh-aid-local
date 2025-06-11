import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // Generate verse options for dropdown
  const verseOptions = Array.from({
    length: Math.min(50, maxVerseId)
  }, (_, i) => i + 1);

  // Generate surah options for dropdown (first 2 surahs available)
  const surahOptions = [{
    value: "1",
    label: "1 - Al-Fatihah"
  }, {
    value: "2",
    label: "2 - Al-Baqarah"
  }];

  // Generate ayah options based on selected surah
  const getAyahOptions = (surah: string) => {
    if (surah === "1") {
      return Array.from({
        length: 7
      }, (_, i) => i + 1);
    } else if (surah === "2") {
      return Array.from({
        length: 13
      }, (_, i) => i + 1);
    }
    return [];
  };
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
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-blue-50 border-blue-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-800">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Navigate Quran
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Navigation Mode Selector */}
          <div className="flex gap-2">
            <Button variant={navigationMode === 'verse' ? 'default' : 'outline'} size="sm" onClick={() => setNavigationMode('verse')} className={navigationMode === 'verse' ? "bg-blue-200 text-blue-800 hover:bg-blue-300" : "border-blue-200 text-blue-700 hover:bg-blue-100"}>
              By Verse ID
            </Button>
            <Button variant={navigationMode === 'surah' ? 'default' : 'outline'} size="sm" onClick={() => setNavigationMode('surah')} className={navigationMode === 'surah' ? "bg-green-200 text-green-800 hover:bg-green-300" : "border-green-200 text-green-700 hover:bg-green-100"}>
              By Surah
            </Button>
            <Button variant={navigationMode === 'range' ? 'default' : 'outline'} size="sm" onClick={() => setNavigationMode('range')} className={navigationMode === 'range' ? "bg-orange-200 text-orange-800 hover:bg-orange-300" : "border-orange-200 text-orange-700 hover:bg-orange-100"}>
              Range
            </Button>
          </div>

          {/* Current Position */}
          <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Currently at verse <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">{currentVerseId}</Badge>
            </p>
          </div>

          {/* Navigation Forms */}
          {navigationMode === 'verse' && <div className="space-y-3">
              <div>
                <Label htmlFor="verse-select" className="text-blue-800">Select Verse (1-{maxVerseId})</Label>
                <Select value={targetVerse} onValueChange={setTargetVerse}>
                  <SelectTrigger className="border-blue-200 bg-white">
                    <SelectValue placeholder="Choose a verse..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                    {verseOptions.map(verse => <SelectItem key={verse} value={verse.toString()}>
                        Verse {verse}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="verse-id" className="text-blue-800">Or type verse ID</Label>
                <Input id="verse-id" type="number" min="1" max={maxVerseId} value={targetVerse} onChange={e => setTargetVerse(e.target.value)} placeholder="Enter verse ID" className="border-blue-200 bg-white" />
              </div>
            </div>}

          {navigationMode === 'surah' && <div className="space-y-3">
              <div>
                <Label htmlFor="surah-select" className="text-green-800">Select Surah</Label>
                <Select value={targetSurah} onValueChange={setTargetSurah}>
                  <SelectTrigger className="border-green-200 bg-white">
                    <SelectValue placeholder="Choose a surah..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-green-200">
                    {surahOptions.map(surah => <SelectItem key={surah.value} value={surah.value}>
                        {surah.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="surah" className="text-green-800">Or type Surah Number</Label>
                <Input id="surah" type="number" min="1" max="2" value={targetSurah} onChange={e => setTargetSurah(e.target.value)} placeholder="1 or 2" className="border-green-200 bg-white" />
              </div>
              {targetSurah && <div>
                  <Label htmlFor="ayah-select" className="text-green-800">Select Ayah</Label>
                  <Select value={targetAyah} onValueChange={setTargetAyah}>
                    <SelectTrigger className="border-green-200 bg-white">
                      <SelectValue placeholder="Choose an ayah..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-green-200">
                      {getAyahOptions(targetSurah).map(ayah => <SelectItem key={ayah} value={ayah.toString()}>
                          Ayah {ayah}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>}
              <div>
                <Label htmlFor="ayah" className="text-green-800">Or type Ayah Number</Label>
                <Input id="ayah" type="number" min="1" value={targetAyah} onChange={e => setTargetAyah(e.target.value)} placeholder="Ayah number" className="border-green-200 bg-white" />
              </div>
              {targetSurah && <p className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  {getSurahName(parseInt(targetSurah))}
                </p>}
            </div>}

          {navigationMode === 'range' && <div className="space-y-3">
              <div>
                <Label htmlFor="range-start" className="text-orange-800">Start Verse ID</Label>
                <Input id="range-start" type="number" min="1" max={maxVerseId} value={rangeStart} onChange={e => setRangeStart(e.target.value)} placeholder="Start verse" className="border-orange-200 bg-white" />
              </div>
              <div>
                <Label htmlFor="range-end" className="text-orange-800">End Verse ID</Label>
                <Input id="range-end" type="number" min="1" max={maxVerseId} value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} placeholder="End verse" className="border-orange-200 bg-white" />
              </div>
              {rangeStart && rangeEnd && <p className="text-sm text-orange-700 bg-orange-50 p-2 rounded border border-orange-200">
                  Range: {parseInt(rangeEnd) - parseInt(rangeStart) + 1} verses
                </p>}
            </div>}

          {/* Navigation Button */}
          <Button onClick={handleNavigate} className="w-full bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-300">
            Navigate
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};