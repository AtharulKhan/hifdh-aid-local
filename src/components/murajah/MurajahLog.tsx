
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, RotateCcw, PlayCircle, BookOpen, Clock, ArrowRight } from "lucide-react";

interface LogEntry {
  date: string;
  cycle: {
    type: 'RMV' | 'OMV' | 'Listening' | 'Reading';
    title: string;
    content: string;
    completed: boolean;
  };
  carryOver: boolean;
}

export const MurajahLog = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    loadLogData();
  }, []);

  const loadLogData = () => {
    // Load completion data and generate log entries
    const savedCompletions = localStorage.getItem('murajah-daily-completions');
    const entries = localStorage.getItem('murajah-memorization-entries');
    const settings = localStorage.getItem('murajah-review-settings');

    if (!savedCompletions || !entries || !settings) {
      return;
    }

    try {
      const completionData = JSON.parse(savedCompletions);
      const memorizationEntries = JSON.parse(entries);
      const reviewSettings = JSON.parse(settings);

      // Generate log entries based on completion history
      const logs = generateLogEntries(completionData, memorizationEntries, reviewSettings);
      setLogEntries(logs);
    } catch (error) {
      console.error('Error loading log data:', error);
    }
  };

  const generateLogEntries = (completionData: any, entries: any[], settings: any): LogEntry[] => {
    const logs: LogEntry[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // For demo purposes, let's create some sample log entries
    // In a real implementation, this would track actual completion history
    
    // Yesterday's incomplete cycles
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Sample incomplete cycles from yesterday
    logs.push(
      {
        date: yesterdayStr,
        cycle: {
          type: 'RMV',
          title: 'RMV (Last 7 Pages)',
          content: 'Pgs. (15-21)',
          completed: false
        },
        carryOver: true
      },
      {
        date: yesterdayStr,
        cycle: {
          type: 'OMV',
          title: 'OMV (1 Juz)',
          content: 'Juz 1 (Pages 1-21)',
          completed: true
        },
        carryOver: false
      }
    );

    // Today's cycles
    logs.push(
      {
        date: today,
        cycle: {
          type: 'RMV',
          title: 'RMV (Last 7 Pages)',
          content: 'Pgs. (15-21)', // Carried over
          completed: false
        },
        carryOver: true
      },
      {
        date: today,
        cycle: {
          type: 'OMV',
          title: 'OMV (1 Juz)',
          content: 'Juz 2 (Pages 22-41)', // New cycle
          completed: false
        },
        carryOver: false
      }
    );

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      case 'RMV': return 'bg-green-50 border-green-200 text-green-800';
      case 'OMV': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'Listening': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Reading': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const groupedEntries = logEntries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, LogEntry[]>);

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

      {/* Log Entries by Date */}
      <div className="space-y-6">
        {Object.entries(groupedEntries).map(([date, entries]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {date === new Date().toISOString().split('T')[0] && (
                  <Badge variant="default" className="ml-2">Today</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entries.map((entry, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${getCycleColor(entry.cycle.type)} transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white">
                        {entry.cycle.completed ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> : 
                          getCycleIcon(entry.cycle.type)
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.cycle.title}</h3>
                        <p className="text-sm opacity-80">{entry.cycle.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.carryOver && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Carry-over
                        </Badge>
                      )}
                      <Badge variant={entry.cycle.completed ? "default" : "outline"}>
                        {entry.cycle.completed ? "Completed" : "Incomplete"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

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
              <span className="text-gray-600">Cycles continue to next day if incomplete</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
