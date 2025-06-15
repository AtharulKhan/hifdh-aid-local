import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

import juzNumbersData from '@/data/juz-numbers.json';
import surahNamesData from '@/data/surah-names.json';
import { AlreadyMemorizedData } from '@/hooks/use-memorization-planner';

// Define types for our JSON data to avoid using 'any'
type SurahNames = {
  [key: string]: {
    name_simple: string;
  }
}

type JuzNumbers = {
  [key: string]: {
    verse_mapping: {
      [key: string]: string;
    }
  }
}

const typedSurahNames: SurahNames = surahNamesData;
const typedJuzNumbers: JuzNumbers = juzNumbersData;

export const AlreadyMemorizedManager = ({ alreadyMemorized, onAlreadyMemorizedChange }: { alreadyMemorized: AlreadyMemorizedData, onAlreadyMemorizedChange: (data: AlreadyMemorizedData) => void }) => {
  
  const handleJuzToggle = (juzNumber: number) => {
    const newJuz = alreadyMemorized.juz.includes(juzNumber)
      ? alreadyMemorized.juz.filter(j => j !== juzNumber)
      : [...alreadyMemorized.juz, juzNumber];
    onAlreadyMemorizedChange({ ...alreadyMemorized, juz: newJuz.sort((a,b) => a - b) });
  };

  const handleSurahToggle = (surahNumber: number) => {
    const newSurahs = alreadyMemorized.surahs.includes(surahNumber)
      ? alreadyMemorized.surahs.filter(s => s !== surahNumber)
      : [...alreadyMemorized.surahs, surahNumber];
    onAlreadyMemorizedChange({ ...alreadyMemorized, surahs: newSurahs.sort((a,b) => a - b) });
  };

  const memorizedSummary = React.useMemo(() => {
    const summary: { juz: number; isFullyMemorized: boolean; surahs: { id: string; name: string }[] }[] = [];
    if (!alreadyMemorized.juz.length && !alreadyMemorized.surahs.length) {
      return [];
    }
    
    const selectedSurahsInJuz: { [key: number]: { id: string; name: string }[] } = {};

    alreadyMemorized.surahs.forEach(surahNumber => {
      for (const juzNumberStr in typedJuzNumbers) {
        const juzData = typedJuzNumbers[juzNumberStr];
        if (juzData.verse_mapping[surahNumber]) {
          const juzNum = parseInt(juzNumberStr);
          if (!selectedSurahsInJuz[juzNum]) {
            selectedSurahsInJuz[juzNum] = [];
          }
          if (!selectedSurahsInJuz[juzNum].some(s => s.id === String(surahNumber))) {
            selectedSurahsInJuz[juzNum].push({
              id: String(surahNumber),
              name: typedSurahNames[surahNumber].name_simple
            });
          }
        }
      }
    });

    for (let i = 1; i <= 30; i++) {
      const isJuzMemorized = alreadyMemorized.juz.includes(i);
      const surahsInThisJuz = selectedSurahsInJuz[i] || [];

      if (isJuzMemorized || surahsInThisJuz.length > 0) {
        summary.push({
          juz: i,
          isFullyMemorized: isJuzMemorized,
          surahs: surahsInThisJuz.sort((a, b) => parseInt(a.id) - parseInt(b.id))
        });
      }
    }
    return summary;
  }, [alreadyMemorized]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Already Memorized</CardTitle>
            <CardDescription>Select the Juz or Surahs you have already memorized.</CardDescription>
          </div>
          {(alreadyMemorized.juz.length > 0 || alreadyMemorized.surahs.length > 0) && (
            <Button variant="outline" size="sm" onClick={() => onAlreadyMemorizedChange({juz: [], surahs: []})}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <h4 className="text-md font-semibold mb-3">Memorized Juz</h4>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(juzNumber => (
              <div key={juzNumber} className="flex items-center space-x-2">
                <Checkbox
                  id={`juz-${juzNumber}`}
                  checked={alreadyMemorized.juz.includes(juzNumber)}
                  onCheckedChange={() => handleJuzToggle(juzNumber)}
                />
                <Label htmlFor={`juz-${juzNumber}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Juz {juzNumber}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="text-md font-semibold mb-3">Memorized Surahs</h4>
          <p className="text-sm text-muted-foreground mb-4">Select individual surahs you have memorized.</p>
          <div className="max-h-60 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            {Object.entries(typedSurahNames).map(([surahId, surahData]) => (
              <div key={surahId} className="flex items-center space-x-2">
                <Checkbox
                  id={`surah-${surahId}`}
                  checked={alreadyMemorized.surahs.includes(parseInt(surahId))}
                  onCheckedChange={() => handleSurahToggle(parseInt(surahId))}
                />
                <Label htmlFor={`surah-${surahId}`} className="text-sm font-medium">
                  {surahId}. {surahData.name_simple}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {memorizedSummary.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-md font-semibold mb-3">Memorized Summary</h4>
            <div className="space-y-4">
              {memorizedSummary.map(({ juz, isFullyMemorized, surahs }) => (
                <div key={juz}>
                  <div className="flex items-center font-semibold text-sm mb-2">
                    <p className='underline'>Juz {juz}</p>
                    {isFullyMemorized && (
                      <span className="ml-2 flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Fully Memorized
                      </span>
                    )}
                  </div>
                  {!isFullyMemorized && surahs.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      {surahs.map(surah => (
                        <li key={`${juz}-${surah.id}`} className="text-sm">
                          Surah {surah.id}: {surah.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
