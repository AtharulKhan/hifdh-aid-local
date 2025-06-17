
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

// Updated props: removed onAlreadyMemorizedChange
export const AlreadyMemorizedManager = ({ alreadyMemorized }: { alreadyMemorized: AlreadyMemorizedData }) => {
  
  // Helper function to check if a surah is memorized (either individually or as part of a memorized Juz)
  const isSurahMemorized = React.useMemo(() => {
    return (surahNumber: number): boolean => {
      // First check if it's individually memorized
      if (alreadyMemorized.surahs.includes(surahNumber)) {
        return true;
      }
      
      // Then check if it's part of a fully memorized Juz
      for (const juzNumber of alreadyMemorized.juz) {
        const juzData = typedJuzNumbers[juzNumber];
        if (juzData && juzData.verse_mapping[surahNumber]) {
          return true;
        }
      }
      
      return false;
    };
  }, [alreadyMemorized]);

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
      const surahsFromSelection = selectedSurahsInJuz[i] || [];

      let surahsForDisplay: { id: string; name: string }[] = [];

      if (isJuzMemorized) {
        const juzData = typedJuzNumbers[i];
        if (juzData && juzData.verse_mapping) {
          const surahIds = Object.keys(juzData.verse_mapping);
          surahsForDisplay = surahIds.map(surahId => ({
            id: surahId,
            name: typedSurahNames[surahId]?.name_simple || `Surah ${surahId}`
          }));
        }
      } else {
        surahsForDisplay = surahsFromSelection;
      }

      if (isJuzMemorized || surahsFromSelection.length > 0) {
        summary.push({
          juz: i,
          isFullyMemorized: isJuzMemorized,
          surahs: surahsForDisplay.sort((a, b) => parseInt(a.id) - parseInt(b.id))
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
            {/* Updated CardDescription */}
            <CardDescription>
              This reflects what you've marked as memorized in the 'Juz' tracking tab.
              This content will be excluded from new plans.
            </CardDescription>
          </div>
          {/* Removed Clear button */}
        </div>
      </CardHeader>
      <CardContent>
        <div>
          {/* Updated h4 text */}
          <h4 className="text-md font-semibold mb-3">Already Memorized Juz (Read-only)</h4>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(juzNumber => (
              <div key={juzNumber} className="flex items-center space-x-2">
                <Checkbox
                  id={`juz-${juzNumber}`}
                  checked={alreadyMemorized.juz.includes(juzNumber)}
                  disabled={true} // Made checkbox disabled
                  // onCheckedChange removed
                />
                <Label htmlFor={`juz-${juzNumber}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Juz {juzNumber}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          {/* Updated h4 text */}
          <h4 className="text-md font-semibold mb-3">Already Memorized Surahs (Read-only)</h4>
          {/* Removed descriptive p tag */}
          <div className="max-h-60 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            {Object.entries(typedSurahNames).map(([surahId, surahData]) => (
              <div key={surahId} className="flex items-center space-x-2">
                <Checkbox
                  id={`surah-${surahId}`}
                  checked={isSurahMemorized(parseInt(surahId))}
                  disabled={true} // Made checkbox disabled
                  // onCheckedChange removed
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
            <Accordion type="multiple" className="w-full">
              {memorizedSummary.map(({ juz, isFullyMemorized, surahs }) => (
                <AccordionItem value={`juz-${juz}`} key={juz}>
                  <AccordionTrigger>
                    <div className="flex items-center font-semibold text-sm">
                      <p>Juz {juz}</p>
                      {isFullyMemorized && (
                        <span className="ml-2 flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Fully Memorized
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {surahs.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        {surahs.map(surah => (
                          <li key={`${juz}-${surah.id}`} className="text-sm">
                            Surah {surah.id}: {surah.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
