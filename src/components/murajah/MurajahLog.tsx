import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CheckCircle, RotateCcw, PlayCircle, BookOpen, Clock, ArrowRight } from "lucide-react";

interface LogEntry {
  date: string;
  cycle: {
    type: 'RMV' | 'OMV' | 'Listening' | 'Reading';
    title: string;
    content: string;
    completed: boolean;
    id: string;
  };
  carryOver: boolean;
}

interface DailyCompletion {
  date: string;
  completions: { [cycleId: string]: boolean };
}

export const MurajahLog = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    loadLogData();
  }, []);

  const loadLogData = () => {
    // Load completion data from localStorage
    const savedCompletions = localStorage.getItem('murajah-daily-completions');
    const entries = localStorage.getItem('murajah-memorization-entries');
    const settings = localStorage.getItem('murajah-review-settings');

    if (!savedCompletions) {
      return;
    }

    try {
      const completionData: DailyCompletion[] = JSON.parse(savedCompletions);
      const memorizationEntries = entries ? JSON.parse(entries) : [];
      const reviewSettings = settings ? JSON.parse(settings) : {};

      const logs = generateLogEntries(completionData, memorizationEntries, reviewSettings);
      setLogEntries(logs);
    } catch (error) {
      console.error('Error loading log data:', error);
    }
  };

  const generateLogEntries = (completionData: DailyCompletion[], entries: any[], settings: any): LogEntry[] => {
    const logs: LogEntry[] = [];
    
    // Sort completion data by date (most recent first)
    const sortedData = completionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sortedData.forEach(dayData => {
      Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
        const [cycleType, dateStr, carryOverFlag] = cycleId.split('-');
        const isCarryOver = carryOverFlag === 'carryover';
        
        // Determine cycle details based on type
        let cycleInfo = getCycleInfo(cycleType, dateStr, entries, settings, completed, cycleId);
        if (cycleInfo) {
          logs.push({
            date: dayData.date,
            cycle: cycleInfo,
            carryOver: isCarryOver
          });
        }
      });
    });

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCycleInfo = (type: string, dateStr: string, entries: any[], settings: any, completed: boolean, id: string) => {
    const upperType = type.toUpperCase() as 'RMV' | 'OMV' | 'LISTENING' | 'READING';
    
    switch (upperType) {
      case 'RMV':
        return {
          type: 'RMV' as const,
          title: `RMV (Last ${settings.rmvPages || 7} Pages)`,
          content: calculateRMVContent(entries, settings),
          completed,
          id
        };
      case 'OMV':
        return {
          type: 'OMV' as const,
          title: `OMV (${settings.omvJuz || 1} Juz)`,
          content: calculateOMVContent(entries, settings, dateStr),
          completed,
          id
        };
      case 'LISTENING':
        return {
          type: 'Listening' as const,
          title: `Listening Cycle (${settings.listeningJuz || 2} Juz)`,
          content: calculateListeningContent(entries, settings, dateStr),
          completed,
          id
        };
      case 'READING':
        return {
          type: 'Reading' as const,
          title: `Reading Cycle (${settings.readingJuz || 1} Juz)`,
          content: calculateReadingContent(entries, settings, dateStr),
          completed,
          id
        };
      default:
        return null;
    }
  };

  const calculateRMVContent = (entries: any[], settings: any): string => {
    if (!entries || entries.length === 0) return 'No data available';
    
    const currentJuzEntries = entries.filter(entry => entry.juz === (settings.currentJuz || 1));
    if (currentJuzEntries.length === 0) return 'No pages available';

    const allPages = currentJuzEntries.flatMap(entry => 
      Array.from({ length: entry.endPage - entry.startPage + 1 }, (_, i) => entry.startPage + i)
    );

    const maxPage = Math.max(...allPages);
    const minPage = Math.min(...allPages);
    const rmvPages = settings.rmvPages || 7;
    const startPage = Math.max(maxPage - rmvPages + 1, minPage);

    return `Pgs. (${startPage}-${maxPage})`;
  };

  const calculateOMVContent = (entries: any[], settings: any, date: string): string => {
    if (!entries || entries.length === 0) return 'No data available';
    
    const completedJuz = [...new Set(entries.map((e: any) => e.juz))].sort((a: number, b: number) => a - b);
    if (completedJuz.length === 0) return 'No Juz available';

    // Calculate rotation based on date
    const startDate = new Date(settings.startDate || new Date().toISOString().split('T')[0]);
    const currentDate = new Date(date);
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleIndex = Math.max(0, daysSinceStart) % completedJuz.length;
    
    const omvJuz = settings.omvJuz || 1;
    const selectedJuz = [];
    for (let i = 0; i < omvJuz && i < completedJuz.length; i++) {
      const juzIndex = (cycleIndex + i) % completedJuz.length;
      selectedJuz.push(completedJuz[juzIndex]);
    }

    return selectedJuz.map(juz => {
      const juzEntries = entries.filter((e: any) => e.juz === juz);
      if (juzEntries.length === 0) return '';
      
      const minPage = Math.min(...juzEntries.map((e: any) => e.startPage));
      const maxPage = Math.max(...juzEntries.map((e: any) => e.endPage));
      return `Juz ${juz} (Pages ${minPage}-${maxPage})`;
    }).filter(content => content).join(', ');
  };

  const calculateListeningContent = (entries: any[], settings: any, date: string): string => {
    return calculateOMVContent(entries, { ...settings, omvJuz: settings.listeningJuz || 2 }, date);
  };

  const calculateReadingContent = (entries: any[], settings: any, date: string): string => {
    return calculateOMVContent(entries, { ...settings, omvJuz: settings.readingJuz || 1 }, date);
  };

  const getCycleIcon = (type: string) => {
    switch (type) {
      case 'RMV': return <Clock className="h-4 w-4" />;
      case 'OMV': return <RotateCcw className="h-4 w-4" />;
      case 'Listening': return <PlayCircle className="h-4 w-4" />;
      case 'Reading': return <BookOpen className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCycleColor = (type: string) => {
    switch (type) {
      case 'RMV': return 'text-green-600';
      case 'OMV': return 'text-purple-600';
      case 'Listening': return 'text-blue-600';
      case 'Reading': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const updateCompletionStatus = (entryIndex: number, completed: boolean) => {
    const updatedEntries = [...logEntries];
    updatedEntries[entryIndex].cycle.completed = completed;
    setLogEntries(updatedEntries);

    // Update localStorage
    const savedData = localStorage.getItem('murajah-daily-completions');
    if (savedData) {
      try {
        const allCompletions: DailyCompletion[] = JSON.parse(savedData);
        const entry = updatedEntries[entryIndex];
        
        // Find the correct day's data and update the specific cycle
        const dayDataIndex = allCompletions.findIndex(d => d.date === entry.date);
        if (dayDataIndex >= 0) {
          allCompletions[dayDataIndex].completions[entry.cycle.id] = completed;
          localStorage.setItem('murajah-daily-completions', JSON.stringify(allCompletions));
        }
      } catch (error) {
        console.error('Error updating completion status:', error);
      }
    }
  };

  if (logEntries.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Log Data</h3>
          <p className="text-gray-500 mb-4">
            Complete some review cycles to start tracking your progress and carry-overs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-400">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Review Cycle Log</h2>
              <p className="text-gray-600">Track completed cycles and carry-overs</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {logEntries.filter(e => e.carryOver).length}
              </div>
              <div className="text-sm text-gray-600">Carry-overs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Review Cycle History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Cycle Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logEntries.map((entry, index) => (
                <TableRow key={entry.cycle.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          year: 'numeric' 
                        })}
                      </span>
                      {entry.date === new Date().toISOString().split('T')[0] && (
                        <Badge variant="default" className="text-xs mt-1 w-fit">Today</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={getCycleColor(entry.cycle.type)}>
                        {getCycleIcon(entry.cycle.type)}
                      </span>
                      <div>
                        <div className="font-medium">{entry.cycle.type}</div>
                        <div className="text-xs text-gray-500">{entry.cycle.title}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{entry.cycle.content}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.carryOver && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Carry-over
                        </Badge>
                      )}
                      <Badge variant={entry.cycle.completed ? "default" : "outline"} className="text-xs">
                        {entry.cycle.completed ? "Completed" : "Incomplete"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={entry.cycle.completed}
                      onCheckedChange={(checked) => updateCompletionStatus(index, checked as boolean)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <ArrowRight className="h-3 w-3 mr-1" />
                Carry-over
              </Badge>
              <span>Incomplete cycle from previous day</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Incomplete</Badge>
              <span>Not completed yet</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Completed</Badge>
              <span>Successfully completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Click checkbox to update status</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
