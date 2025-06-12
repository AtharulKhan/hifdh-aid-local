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

interface GroupedLogEntry {
  date: string;
  cycles: {
    RMV?: LogEntry;
    OMV?: LogEntry;
    Listening?: LogEntry;
    Reading?: LogEntry;
  };
}

export const MurajahLog = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<GroupedLogEntry[]>([]);

  useEffect(() => {
    loadLogData();
  }, []);

  useEffect(() => {
    // Group entries by date
    const grouped = groupLogEntriesByDate(logEntries);
    setGroupedEntries(grouped);
  }, [logEntries]);

  const groupLogEntriesByDate = (entries: LogEntry[]): GroupedLogEntry[] => {
    const grouped: { [date: string]: GroupedLogEntry } = {};

    entries.forEach(entry => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = {
          date: entry.date,
          cycles: {}
        };
      }
      grouped[entry.date].cycles[entry.cycle.type] = entry;
    });

    return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

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

  const updateCompletionStatus = (date: string, cycleType: 'RMV' | 'OMV' | 'Listening' | 'Reading', completed: boolean) => {
    // Find the specific entry to update
    const entryIndex = logEntries.findIndex(entry => 
      entry.date === date && entry.cycle.type === cycleType
    );
    
    if (entryIndex >= 0) {
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
              <p className="text-gray-600">Track completed cycles and carry-overs by date</p>
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
          <CardTitle>Daily Review Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    RMV
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <RotateCcw className="h-4 w-4 text-purple-600" />
                    OMV
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    Listening
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                    Reading
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedEntries.map((dayEntry) => (
                <TableRow key={dayEntry.date}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(dayEntry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(dayEntry.date).toLocaleDateString('en-US', { 
                          year: 'numeric' 
                        })}
                      </span>
                      {dayEntry.date === new Date().toISOString().split('T')[0] && (
                        <Badge variant="default" className="text-xs mt-1 w-fit">Today</Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* RMV Column */}
                  <TableCell className="text-center">
                    {dayEntry.cycles.RMV ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-600 max-w-24 truncate" title={dayEntry.cycles.RMV.cycle.content}>
                          {dayEntry.cycles.RMV.cycle.content}
                        </div>
                        <div className="flex items-center gap-2">
                          {dayEntry.cycles.RMV.carryOver && (
                            <ArrowRight className="h-3 w-3 text-yellow-600" title="Carry-over" />
                          )}
                          <Checkbox
                            checked={dayEntry.cycles.RMV.cycle.completed}
                            onCheckedChange={(checked) => 
                              updateCompletionStatus(dayEntry.date, 'RMV', checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  {/* OMV Column */}
                  <TableCell className="text-center">
                    {dayEntry.cycles.OMV ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-600 max-w-24 truncate" title={dayEntry.cycles.OMV.cycle.content}>
                          {dayEntry.cycles.OMV.cycle.content}
                        </div>
                        <div className="flex items-center gap-2">
                          {dayEntry.cycles.OMV.carryOver && (
                            <ArrowRight className="h-3 w-3 text-yellow-600" title="Carry-over" />
                          )}
                          <Checkbox
                            checked={dayEntry.cycles.OMV.cycle.completed}
                            onCheckedChange={(checked) => 
                              updateCompletionStatus(dayEntry.date, 'OMV', checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  {/* Listening Column */}
                  <TableCell className="text-center">
                    {dayEntry.cycles.Listening ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-600 max-w-24 truncate" title={dayEntry.cycles.Listening.cycle.content}>
                          {dayEntry.cycles.Listening.cycle.content}
                        </div>
                        <div className="flex items-center gap-2">
                          {dayEntry.cycles.Listening.carryOver && (
                            <ArrowRight className="h-3 w-3 text-yellow-600" title="Carry-over" />
                          )}
                          <Checkbox
                            checked={dayEntry.cycles.Listening.cycle.completed}
                            onCheckedChange={(checked) => 
                              updateCompletionStatus(dayEntry.date, 'Listening', checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  {/* Reading Column */}
                  <TableCell className="text-center">
                    {dayEntry.cycles.Reading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-600 max-w-24 truncate" title={dayEntry.cycles.Reading.cycle.content}>
                          {dayEntry.cycles.Reading.cycle.content}
                        </div>
                        <div className="flex items-center gap-2">
                          {dayEntry.cycles.Reading.carryOver && (
                            <ArrowRight className="h-3 w-3 text-yellow-600" title="Carry-over" />
                          )}
                          <Checkbox
                            checked={dayEntry.cycles.Reading.cycle.completed}
                            onCheckedChange={(checked) => 
                              updateCompletionStatus(dayEntry.date, 'Reading', checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
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
              <ArrowRight className="h-3 w-3 text-yellow-600" />
              <span>Carry-over from previous day</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={false} />
              <span>Click checkbox to mark complete</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">Today</Badge>
              <span>Current date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">-</span>
              <span>No cycle for this date</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
