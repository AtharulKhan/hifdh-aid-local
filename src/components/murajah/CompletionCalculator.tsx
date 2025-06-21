
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target } from 'lucide-react';
import { addDays, format } from 'date-fns';

const TOTAL_JUZ = 30;
const PAGES_PER_JUZ = 20;
const LINES_PER_PAGE = 15;
const TOTAL_LINES = TOTAL_JUZ * PAGES_PER_JUZ * LINES_PER_PAGE; // 9000 lines

interface CompletionCalculatorProps {
  memorizedJuz: number[]; // Array of memorized Juz numbers
}

export const CompletionCalculator: React.FC<CompletionCalculatorProps> = ({ memorizedJuz }) => {
  const [linesPerDay, setLinesPerDay] = useState(15);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const calculation = useMemo(() => {
    const memorizedLines = memorizedJuz.length * PAGES_PER_JUZ * LINES_PER_PAGE;
    const remainingLines = TOTAL_LINES - memorizedLines;
    const daysPerWeek = selectedDays.length;
    
    if (daysPerWeek === 0 || linesPerDay <= 0) {
      return null;
    }

    const linesPerWeek = linesPerDay * daysPerWeek;
    const weeksNeeded = Math.ceil(remainingLines / linesPerWeek);
    const totalDays = weeksNeeded * 7;
    
    const completionDate = addDays(new Date(), totalDays);
    
    return {
      memorizedLines,
      remainingLines,
      weeksNeeded,
      completionDate,
      progressPercentage: ((memorizedLines / TOTAL_LINES) * 100).toFixed(1)
    };
  }, [memorizedJuz, linesPerDay, selectedDays]);

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setSelectedDays(prev => [...prev, day]);
    } else {
      setSelectedDays(prev => prev.filter(d => d !== day));
    }
  };

  if (!calculation) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
          <Target className="h-5 w-5" />
          Completion Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lines-per-day" className="text-sm font-medium text-gray-700">
              Lines per Day
            </Label>
            <Input
              id="lines-per-day"
              type="number"
              min="1"
              max="50"
              value={linesPerDay}
              onChange={(e) => setLinesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-gray-700">
              Memorization Days
            </Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                  />
                  <Label htmlFor={day} className="text-xs font-normal cursor-pointer">
                    {day.slice(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{calculation.progressPercentage}%</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{memorizedJuz.length}/{TOTAL_JUZ}</div>
            <div className="text-xs text-gray-600">Juz Done</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{calculation.weeksNeeded}</div>
            <div className="text-xs text-gray-600">Weeks Left</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-purple-600">
              <Calendar className="h-4 w-4" />
              {format(calculation.completionDate, 'MMM dd, yyyy')}
            </div>
            <div className="text-xs text-gray-600">Est. Completion</div>
          </div>
        </div>

        {calculation.remainingLines > 0 && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {calculation.remainingLines.toLocaleString()} lines remaining
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
