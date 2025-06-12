import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    
    const sortedData = completionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sortedData.forEach(dayData => {
      Object.entries(dayData.completions).forEach(([cycleId, completed]) => {
        const [cycleType, dateStr, carryOverFlag] = cycleId.split('-');
        const isCarryOver = carryOverFlag === 'carryover';
        
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
    const entryIndex = logEntries.findIndex(entry => 
      entry.date === date && entry.cycle.type === cycleType
    );
    
    if (entryIndex >= 0) {
      const updatedEntries = [...logEntries];
      updatedEntries[entryIndex].cycle.completed = completed;
      setLogEntries(updatedEntries);

      const savedData = localStorage.getItem('murajah-daily-completions');
      if (savedData) {
        try {
          const allCompletions: DailyCompletion[] = JSON.parse(savedData);
          const entry = updatedEntries[entryIndex];
          
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
      <Card className="text-center py-8 sm:py-12">
        <CardContent className="px-4">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Log Data</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
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
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Review Cycle Log</h2>
              <p className="text-sm sm:text-base text-gray-600">Track completed cycles and carry-overs by date</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {logEntries.filter(e => e.carryOver).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Carry-overs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Daily Review Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <ScrollArea className="w-full">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="hidden sm:inline">RMV</span>
                        <span className="sm:hidden">R</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                        <span className="hidden sm:inline">OMV</span>
                        <span className="sm:hidden">O</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="hidden sm:inline">Listening</span>
                        <span className="sm:hidden">L</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                        <span className="hidden sm:inline">Reading</span>
                        <span className="sm:hidden">R</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedEntries.map((dayEntry) => (
                    <TableRow key={dayEntry.date}>
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-xs sm:text-sm">
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
                      <TableCell className="text-center py-2">
                        {dayEntry.cycles.RMV ? (
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <div className="text-xs text-gray-600 max-w-16 sm:max-w-24 truncate" title={dayEntry.cycles.RMV.cycle.content}>
                              {dayEntry.cycles.RMV.cycle.content}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {dayEntry.cycles.RMV.carryOver && (
                                <div title="Carry-over">
                                  <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-600" />
                                </div>
                              )}
                              <Checkbox
                                checked={dayEntry.cycles.RMV.cycle.completed}
                                onCheckedChange={(checked) => 
                                  updateCompletionStatus(dayEntry.date, 'RMV', checked as boolean)
                                }
                                className="h-3 w-3 sm:h-4 sm:w-4"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* OMV Column */}
                      <TableCell className="text-center py-2">
                        {dayEntry.cycles.OMV ? (
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <div className="text-xs text-gray-600 max-w-16 sm:max-w-24 truncate" title={dayEntry.cycles.OMV.cycle.content}>
                              {dayEntry.cycles.OMV.cycle.content}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {dayEntry.cycles.OMV.carryOver && (
                                <div title="Carry-over">
                                  <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-600" />
                                </div>
                              )}
                              <Checkbox
                                checked={dayEntry.cycles.OMV.cycle.completed}
                                onCheckedChange={(checked) => 
                                  updateCompletionStatus(dayEntry.date, 'OMV', checked as boolean)
                                }
                                className="h-3 w-3 sm:h-4 sm:w-4"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Listening Column */}
                      <TableCell className="text-center py-2">
                        {dayEntry.cycles.Listening ? (
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <div className="text-xs text-gray-600 max-w-16 sm:max-w-24 truncate" title={dayEntry.cycles.Listening.cycle.content}>
                              {dayEntry.cycles.Listening.cycle.content}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {dayEntry.cycles.Listening.carryOver && (
                                <div title="Carry-over">
                                  <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-600" />
                                </div>
                              )}
                              <Checkbox
                                checked={dayEntry.cycles.Listening.cycle.completed}
                                onCheckedChange={(checked) => 
                                  updateCompletionStatus(dayEntry.date, 'Listening', checked as boolean)
                                }
                                className="h-3 w-3 sm:h-4 sm:w-4"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Reading Column */}
                      <TableCell className="text-center py-2">
                        {dayEntry.cycles.Reading ? (
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <div className="text-xs text-gray-600 max-w-16 sm:max-w-24 truncate" title={dayEntry.cycles.Reading.cycle.content}>
                              {dayEntry.cycles.Reading.cycle.content}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {dayEntry.cycles.Reading.carryOver && (
                                <div title="Carry-over">
                                  <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-600" />
                                </div>
                              )}
                              <Checkbox
                                checked={dayEntry.cycles.Reading.cycle.completed}
                                onCheckedChange={(checked) => 
                                  updateCompletionStatus(dayEntry.date, 'Reading', checked as boolean)
                                }
                                className="h-3 w-3 sm:h-4 sm:w-4"
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
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Legend</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-600" />
              <span>Carry-over from previous day</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={false} className="h-3 w-3 sm:h-4 sm:w-4" />
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
