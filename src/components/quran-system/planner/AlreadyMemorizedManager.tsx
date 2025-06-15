
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import juzNumbersData from '@/data/juz-numbers.json';
import surahNamesData from '@/data/surah-names.json';

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

export const AlreadyMemorizedManager = ({ alreadyMemorized, onAlreadyMemorizedChange }: { alreadyMemorized: number[], onAlreadyMemorizedChange: (juz: number[]) => void }) => {
  
  const handleJuzToggle = (juzNumber: number) => {
    const newAlreadyMemorized = alreadyMemorized.includes(juzNumber)
      ? alreadyMemorized.filter(j => j !== juzNumber)
      : [...alreadyMemorized, juzNumber];
    onAlreadyMemorizedChange(newAlreadyMemorized);
  };

  const memorizedInfoByJuz = React.useMemo(() => {
    if (alreadyMemorized.length === 0) {
      return [];
    }

    const sortedMemorizedJuz = [...alreadyMemorized].sort((a, b) => a - b);

    return sortedMemorizedJuz.map(juzNumber => {
      const juzData = typedJuzNumbers[juzNumber];
      if (!juzData || !juzData.verse_mapping) {
        return { juz: juzNumber, surahs: [] };
      }

      const surahIds = Object.keys(juzData.verse_mapping);
      const sortedSurahIds = surahIds.sort((a, b) => parseInt(a) - parseInt(b));

      const surahs = sortedSurahIds.map(surahId => {
        const surahData = typedSurahNames[surahId];
        return {
          id: surahId,
          name: surahData ? surahData.name_simple : `Surah ${surahId}`,
        };
      });

      return { juz: juzNumber, surahs };
    });
  }, [alreadyMemorized]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Already Memorized</CardTitle>
            <CardDescription>Select the Juz you have already memorized.</CardDescription>
          </div>
          {alreadyMemorized.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onAlreadyMemorizedChange([])}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(juzNumber => (
            <div key={juzNumber} className="flex items-center space-x-2">
              <Checkbox
                id={`juz-${juzNumber}`}
                checked={alreadyMemorized.includes(juzNumber)}
                onCheckedChange={() => handleJuzToggle(juzNumber)}
              />
              <Label htmlFor={`juz-${juzNumber}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Juz {juzNumber}
              </Label>
            </div>
          ))}
        </div>
        {memorizedInfoByJuz.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-md font-semibold mb-3">Memorized Surahs Summary</h4>
            <div className="space-y-4">
              {memorizedInfoByJuz.map(({ juz, surahs }) => (
                <div key={juz}>
                  <p className="font-semibold text-sm mb-2 underline">Juz {juz}</p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    {surahs.map(surah => (
                      <li key={`${juz}-${surah.id}`} className="text-sm">
                        Surah {surah.id}: {surah.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
