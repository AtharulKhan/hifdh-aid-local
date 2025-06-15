
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const AlreadyMemorizedManager = ({ alreadyMemorized, onAlreadyMemorizedChange }: { alreadyMemorized: number[], onAlreadyMemorizedChange: (juz: number[]) => void }) => {
  
  const handleJuzToggle = (juzNumber: number) => {
    const newAlreadyMemorized = alreadyMemorized.includes(juzNumber)
      ? alreadyMemorized.filter(j => j !== juzNumber)
      : [...alreadyMemorized, juzNumber];
    onAlreadyMemorizedChange(newAlreadyMemorized);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Already Memorized</CardTitle>
        <CardDescription>Select the Juz you have already memorized.</CardDescription>
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
      </CardContent>
    </Card>
  );
};
