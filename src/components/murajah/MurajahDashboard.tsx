
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, RotateCcw, PlayCircle, BookOpen, Clock } from "lucide-react";
import { MemorizationEntry } from "./MemorizationTracker";
import { ReviewSettings } from "./ReviewSettings";

interface ReviewCycle {
  type: 'RMV' | 'OMV' | 'Listening' | 'Reading' | 'New';
  title: string;
  content: string;
  startDate: string;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
}

export const MurajahDashboard = () => {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [entries, setEntries] = useState<MemorizationEntry[]>([]);
  const [settings, setSettings] = useState<ReviewSettings>({
    rmvPages: 7,
    omvJuz: 1,
    listeningJuz: 2,
    readingJuz: 1,
    currentJuz: 1,
    startDate: new Date().toISOString().split('T')[0]
  });

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('murajah-memorization-entries');
    const savedSettings = localStorage.getItem('murajah-review-settings');
    const savedCompletions = localStorage.getItem('murajah-daily-completions');

    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Generate daily cycles based on current data
  useEffect(() => {
    if (entries.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const newCycles = generateDailyCycles(entries, settings, today);
    setCycles(newCycles);
  }, [entries, settings]);

  const generateDailyCycles = (entries: MemorizationEntry[], settings: ReviewSettings, date: string): ReviewCycle[] => {
    const cycles: ReviewCycle[] = [];

    // RMV - Recent Memorization (Last X pages)
    const rmvContent = calculateRMV(entries, settings);
    if (rmvContent) {
      cycles.push({
        type: 'RMV',
        title: `RMV (Last ${settings.rmvPages} Pages)`,
        content: rmvContent,
        startDate: date,
        completed: false,
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-green-50 border-green-200'
      });
    }

    // OMV - Old Memorization (Rotating through old Juz)
    const omvContent = calculateOMV(entries, settings, date);
    if (omvContent) {
      cycles.push({
        type: 'OMV',
        title: `OMV (${settings.omvJuz} Juz)`,
        content: omvContent,
        startDate: date,
        completed: false,
        icon: <RotateCcw className="h-4 w-4" />,
        color: 'bg-purple-50 border-purple-200'
      });
    }

    // Listening Cycle
    const listeningContent = calculateListeningCycle(entries, settings, date);
    if (listeningContent) {
      cycles.push({
        type: 'Listening',
        title: `Listening Cycle (${settings.listeningJuz} Juz)`,
        content: listeningContent,
        startDate: date,
        completed: false,
        icon: <PlayCircle className="h-4 w-4" />,
        color: 'bg-blue-50 border-blue-200'
      });
    }

    // Reading Cycle
    const readingContent = calculateReadingCycle(entries, settings, date);
    if (readingContent) {
      cycles.push({
        type: 'Reading',
        title: `Reading Cycle (${settings.readingJuz} Juz)`,
        content: readingContent,
        startDate: date,
        completed: false,
        icon: <BookOpen className="h-4 w-4" />,
        color: 'bg-orange-50 border-orange-200'
      });
    }

    return cycles;
  };

  const calculateRMV = (entries: MemorizationEntry[], settings: ReviewSettings): string => {
    if (entries.length === 0) return '';

    // Find all pages for the current Juz
    const currentJuzEntries = entries.filter(entry => entry.juz === settings.currentJuz);
    if (currentJuzEntries.length === 0) return '';

    const allPages = currentJuzEntries.flatMap(entry => 
      Array.from({ length: entry.endPage - entry.startPage + 1 }, (_, i) => entry.startPage + i)
    );

    const maxPage = Math.max(...allPages);
    const minPage = Math.min(...allPages);
    const startPage = Math.max(maxPage - settings.rmvPages + 1, minPage);

    return `Pgs. (${startPage}-${maxPage})`;
  };

  const calculateOMV = (entries: MemorizationEntry[], settings: ReviewSettings, date: string): string => {
    const completedJuz = [...new Set(entries.map(e => e.juz))].sort((a, b) => a - b);
    if (completedJuz.length === 0) return '';

    // Calculate days since start date for rotation
    const startDate = new Date(settings.startDate);
    const currentDate = new Date(date);
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Ensure we have a positive cycle index even if start date is in the future
    const cycleIndex = Math.max(0, daysSinceStart) % completedJuz.length;
    
    const selectedJuz = [];
    for (let i = 0; i < settings.omvJuz && i < completedJuz.length; i++) {
      const juzIndex = (cycleIndex + i) % completedJuz.length;
      selectedJuz.push(completedJuz[juzIndex]);
    }

    return selectedJuz.map(juz => {
      const juzEntries = entries.filter(e => e.juz === juz);
      if (juzEntries.length === 0) return '';
      
      const minPage = Math.min(...juzEntries.map(e => e.startPage));
      const maxPage = Math.max(...juzEntries.map(e => e.endPage));
      return `Juz ${juz} (Pages ${minPage}-${maxPage})`;
    }).filter(content => content).join(', ');
  };

  const calculateListeningCycle = (entries: MemorizationEntry[], settings: ReviewSettings, date: string): string => {
    return calculateOMV(entries, { ...settings, omvJuz: settings.listeningJuz }, date);
  };

  const calculateReadingCycle = (entries: MemorizationEntry[], settings: ReviewSettings, date: string): string => {
    return calculateOMV(entries, { ...settings, omvJuz: settings.readingJuz }, date);
  };

  const toggleCycleCompletion = (index: number) => {
    const newCycles = [...cycles];
    newCycles[index].completed = !newCycles[index].completed;
    setCycles(newCycles);

    // Save completion status to localStorage
    const completions = cycles.map(c => c.completed);
    localStorage.setItem('murajah-daily-completions', JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      completions
    }));
  };

  if (entries.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Memorization Data</h3>
          <p className="text-gray-500 mb-4">
            Add your memorization entries in the Memorization Tracker tab to generate your daily review cycles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Today's Review Cycles</h2>
              <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p className="text-sm text-gray-500 mt-1">
                Based on start date: {new Date(settings.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {cycles.filter(c => c.completed).length}/{cycles.length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Cycles */}
      <div className="grid gap-4">
        {cycles.map((cycle, index) => (
          <Card key={index} className={`${cycle.color} transition-all duration-200 ${cycle.completed ? 'opacity-75' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cycle.completed ? 'bg-green-100' : 'bg-white'}`}>
                    {cycle.completed ? <CheckCircle className="h-4 w-4 text-green-600" /> : cycle.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cycle.title}</h3>
                    <p className="text-gray-600">{cycle.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cycle.completed ? "default" : "outline"}>
                    {cycle.completed ? "Completed" : "Pending"}
                  </Badge>
                  <Button
                    variant={cycle.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCycleCompletion(index)}
                  >
                    {cycle.completed ? "Undo" : "Complete"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cycles.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500">
              Configure your settings and add memorization entries to generate review cycles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
