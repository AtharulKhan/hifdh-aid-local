import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Calendar, TrendingUp, Target, BookOpen, Clock, Award, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, LabelList, Cell } from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addDays } from "date-fns";
import { juzPageMapData } from "@/data/juz-page-map";
import surahNamesData from '@/data/surah-names.json';

type SurahNames = {
  [key: string]: {
    name_simple: string;
  }
}
const typedSurahNames: SurahNames = surahNamesData;

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
  startPage?: number;
  endPage?: number;
  memorizedSurahs?: number[];
}

interface MemorizationEntry {
  id: string;
  juz: number;
  startPage: number;
  endPage: number;
  dateMemorized: string;
}

interface ScheduleItem {
  date: string;
  task: string;
  completed: boolean;
  page: number;
  startLine: number;
  endLine: number;
  surah: string;
  isOverdue?: boolean;
}

const Stats = () => {
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all');

  // Load Juz data from the correct localStorage key
  const juzData = useMemo(() => {
    const saved = localStorage.getItem('murajah-juz-memorization');
    if (saved) {
      try {
        return JSON.parse(saved) as JuzMemorization[];
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  const memorizationEntries = useMemo(() => {
    const saved = localStorage.getItem('murajah-memorization-entries');
    if (saved) {
      try {
        return JSON.parse(saved) as MemorizationEntry[];
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  // Load memorization planner schedule
  const plannerSchedule = useMemo(() => {
    const saved = localStorage.getItem('memorizationPlannerSchedule');
    if (saved) {
      try {
        return JSON.parse(saved) as ScheduleItem[];
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  // Create time series data for Juz memorization
  const juzTimeSeriesData = useMemo(() => {
    console.log('Raw juz data:', juzData);
    
    // Get all Juz with memorization dates (both fully memorized and with date)
    const memorizedJuzWithDates = juzData
      .filter(j => j.dateMemorized) // Only include Juz with dates
      .map(j => ({
        date: j.dateMemorized!,
        juzNumber: j.juzNumber,
        isFullyMemorized: j.isMemorized,
        parsedDate: parseISO(j.dateMemorized!)
      }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    console.log('Filtered juz with dates:', memorizedJuzWithDates);

    let cumulativeCount = 0;
    const timeSeriesData = memorizedJuzWithDates.map((item, index) => {
      // Only count fully memorized Juz for cumulative count
      if (item.isFullyMemorized) {
        cumulativeCount++;
      }
      
      return {
        date: format(item.parsedDate, 'MMM dd, yyyy'),
        juz: item.juzNumber,
        cumulativeJuz: cumulativeCount,
        parsedDate: item.parsedDate,
        isFullyMemorized: item.isFullyMemorized
      };
    });

    console.log('Time series data:', timeSeriesData);
    return timeSeriesData;
  }, [juzData]);

  // Create time series data for hifdh schedule
  const scheduleTimeSeriesData = useMemo(() => {
    if (plannerSchedule.length === 0) return [];

    const filteredSchedule = plannerSchedule.filter(item => {
      if (scheduleFilter === 'all') return true;
      if (scheduleFilter === 'completed') return item.completed;
      if (scheduleFilter === 'pending') return !item.completed && !item.isOverdue;
      if (scheduleFilter === 'overdue') return item.isOverdue;
      return true;
    });

    return filteredSchedule
      .map(item => ({
        date: format(parseISO(item.date), 'MMM dd, yyyy'),
        page: item.page,
        surah: item.surah,
        lines: item.endLine - item.startLine + 1,
        completed: item.completed,
        isOverdue: item.isOverdue,
        parsedDate: parseISO(item.date),
        task: item.task
      }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
  }, [plannerSchedule, scheduleFilter]);

  // Calculate basic stats
  const stats = useMemo(() => {
    const memorizedJuz = juzData.filter(j => j.isMemorized).length;
    
    // Calculate total pages from memorized juz using juz-page-map
    let totalPages = 0;
    const memorizedJuzNumbers = juzData.filter(j => j.isMemorized).map(j => j.juzNumber);
    
    memorizedJuzNumbers.forEach(juzNumber => {
      const juzPageInfo = juzPageMapData.find(juz => juz.juz === juzNumber);
      if (juzPageInfo) {
        totalPages += juzPageInfo.totalPages;
      }
    });

    // Also count partial pages from page ranges if they exist
    juzData.forEach(juz => {
      if (!juz.isMemorized && juz.startPage && juz.endPage) {
        totalPages += (juz.endPage - juz.startPage + 1);
      }
    });
    
    // Count unique surahs from juz data
    const memorizedSurahs = new Set<number>();
    juzData.forEach(juz => {
      if (juz.isMemorized && juz.memorizedSurahs) {
        juz.memorizedSurahs.forEach(surah => memorizedSurahs.add(surah));
      }
    });

    // For fully memorized juz, we need to get all surahs in those juz
    // This is a simplified calculation - in a real app you'd want to use the actual juz-surah mapping
    const fullyMemorizedJuzCount = memorizedJuz;
    // Approximate: each juz contains about 3-4 surahs on average
    const approximateSurahsFromJuz = fullyMemorizedJuzCount * 3.5;
    const totalMemorizedSurahs = Math.max(memorizedSurahs.size, Math.floor(approximateSurahsFromJuz));

    // Calculate verses (approximate - 15 lines per page, ~2 verses per line)
    const approximateVerses = totalPages * 30;

    return {
      memorizedJuz,
      memorizedSurahs: totalMemorizedSurahs,
      totalPages,
      approximateVerses,
      totalJuz: 30,
      totalSurahs: 114,
      totalQuranPages: 604,
      totalQuranVerses: 6236
    };
  }, [juzData]);

  // Monthly progress data - updated to use juz data
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Count juz memorized this month from juz data
      const juzMemorizedThisMonth = juzData.filter(juz => {
        if (!juz.dateMemorized || !juz.isMemorized) return false;
        const memDate = parseISO(juz.dateMemorized);
        return memDate >= monthStart && memDate <= monthEnd;
      }).length;

      // Calculate pages from memorized juz this month
      let pagesThisMonth = 0;
      juzData.forEach(juz => {
        if (!juz.dateMemorized || !juz.isMemorized) return;
        const memDate = parseISO(juz.dateMemorized);
        if (memDate >= monthStart && memDate <= monthEnd) {
          const juzPageInfo = juzPageMapData.find(j => j.juz === juz.juzNumber);
          if (juzPageInfo) {
            pagesThisMonth += juzPageInfo.totalPages;
          }
        }
      });

      // Count surahs memorized this month (simplified calculation)
      const surahsThisMonth = Math.floor(juzMemorizedThisMonth * 3.5);

      return {
        month: format(month, 'MMM yyyy'),
        juz: juzMemorizedThisMonth,
        pages: pagesThisMonth,
        surahs: surahsThisMonth,
        date: month
      };
    });
  }, [juzData]);

  // Projection calculation
  const projection = useMemo(() => {
    if (juzData.length < 2) return null;

    // Calculate average pages per month over last 3 months
    const recentMonths = monthlyData.slice(-3);
    const avgPagesPerMonth = recentMonths.reduce((sum, month) => sum + month.pages, 0) / recentMonths.length;
    
    if (avgPagesPerMonth === 0) return null;

    const remainingPages = stats.totalQuranPages - stats.totalPages;
    const monthsToComplete = Math.ceil(remainingPages / avgPagesPerMonth);
    const projectedCompletionDate = addDays(new Date(), monthsToComplete * 30);

    return {
      avgPagesPerMonth: Math.round(avgPagesPerMonth),
      monthsToComplete,
      projectedCompletionDate: format(projectedCompletionDate, 'MMMM yyyy'),
      remainingPages
    };
  }, [monthlyData, stats]);

  // Custom label component for showing Juz numbers above points
  const renderJuzLabel = (props: any) => {
    const { x, y, payload } = props;
    
    if (!payload || typeof payload.juz === 'undefined') {
      return null;
    }
    
    return (
      <text 
        x={x} 
        y={y - 15} 
        textAnchor="middle" 
        fill="#4F46E5" 
        fontSize="12"
        fontWeight="600"
      >
        J{payload.juz}
      </text>
    );
  };

  // Custom tooltip for Juz time series
  const JuzTimeSeriesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">Juz {data.juz}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          <p className="text-sm text-blue-600">Total Completed: {data.cumulativeJuz} Juz</p>
          {!data.isFullyMemorized && (
            <p className="text-xs text-orange-600">Partial progress</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for schedule time series
  const ScheduleTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.surah}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          <p className="text-sm text-blue-600">Page {data.page}</p>
          <p className="text-sm text-green-600">{data.lines} lines</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={data.completed ? "default" : data.isOverdue ? "destructive" : "outline"}>
              {data.completed ? "Completed" : data.isOverdue ? "Overdue" : "Pending"}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  // Separate schedule data by status for different colored scatter plots
  const scheduleDataByStatus = useMemo(() => {
    const completed = scheduleTimeSeriesData.filter(item => item.completed);
    const overdue = scheduleTimeSeriesData.filter(item => item.isOverdue);
    const pending = scheduleTimeSeriesData.filter(item => !item.completed && !item.isOverdue);
    
    return { completed, overdue, pending };
  }, [scheduleTimeSeriesData]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold">Memorization Stats</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{stats.memorizedJuz}</div>
                <div className="text-sm text-gray-600">Juz Memorized</div>
                <div className="text-xs text-gray-500">of {stats.totalJuz}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{stats.memorizedSurahs}</div>
                <div className="text-sm text-gray-600">Surahs Memorized</div>
                <div className="text-xs text-gray-500">of {stats.totalSurahs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{stats.totalPages}</div>
                <div className="text-sm text-gray-600">Pages Memorized</div>
                <div className="text-xs text-gray-500">of {stats.totalQuranPages}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{stats.approximateVerses}</div>
                <div className="text-sm text-gray-600">Verses (Est.)</div>
                <div className="text-xs text-gray-500">of {stats.totalQuranVerses}</div>
              </CardContent>
            </Card>
          </div>

          {/* Juz Memorization Timeline */}
          {juzTimeSeriesData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Juz Memorization Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={juzTimeSeriesData} margin={{ top: 40, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 30]}
                        label={{ value: 'Cumulative Juz', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<JuzTimeSeriesTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeJuz" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: '#8884d8' }}
                      />
                      <LabelList 
                        dataKey="juz" 
                        content={renderJuzLabel}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Juz Memorization Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="text-gray-500 mb-2">No memorization dates recorded yet</div>
                <div className="text-sm text-gray-400">
                  Add dates to your memorized Juz to see your progress timeline
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Memorization Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {juzData.filter(j => j.isMemorized && j.dateMemorized).slice(-5).reverse().map((juz) => (
                  <div key={juz.juzNumber} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Juz {juz.juzNumber}</div>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          const juzPageInfo = juzPageMapData.find(j => j.juz === juz.juzNumber);
                          return juzPageInfo ? `Pages ${juzPageInfo.startPage}-${juzPageInfo.endPage}` : 'Complete Juz';
                        })()}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {format(parseISO(juz.dateMemorized!), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                ))}
                {juzData.filter(j => j.isMemorized && j.dateMemorized).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No memorization entries yet. Start tracking your progress!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Juz Progress</span>
                    <span>{stats.memorizedJuz}/{stats.totalJuz}</span>
                  </div>
                  <Progress value={(stats.memorizedJuz / stats.totalJuz) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Surahs Progress</span>
                    <span>{stats.memorizedSurahs}/{stats.totalSurahs}</span>
                  </div>
                  <Progress value={(stats.memorizedSurahs / stats.totalSurahs) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Pages Progress</span>
                    <span>{stats.totalPages}/{stats.totalQuranPages}</span>
                  </div>
                  <Progress value={(stats.totalPages / stats.totalQuranPages) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Percentages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Juz Completion</span>
                    <Badge variant="secondary">
                      {Math.round((stats.memorizedJuz / stats.totalJuz) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Surah Completion</span>
                    <Badge variant="secondary">
                      {Math.round((stats.memorizedSurahs / stats.totalSurahs) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Page Completion</span>
                    <Badge variant="secondary">
                      {Math.round((stats.totalPages / stats.totalQuranPages) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Verse Completion (Est.)</span>
                    <Badge variant="secondary">
                      {Math.round((stats.approximateVerses / stats.totalQuranVerses) * 100)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Memorization Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pages" stroke="#8884d8" name="Pages" />
                    <Line type="monotone" dataKey="juz" stroke="#82ca9d" name="Juz" />
                    <Line type="monotone" dataKey="surahs" stroke="#ffc658" name="Surahs" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pages" fill="#8884d8" name="Pages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Hifdh Schedule Timeline
              </CardTitle>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <Filter className="h-4 w-4" />
                  <Select value={scheduleFilter} onValueChange={(value: any) => setScheduleFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline">
                    {scheduleTimeSeriesData.length} tasks
                  </Badge>
                </div>
              </CardContent>
            </CardHeader>
            <CardContent>
              {scheduleTimeSeriesData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        type="category"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        dataKey="page"
                        type="number"
                        label={{ value: 'Page Number', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<ScheduleTooltip />} />
                      
                      {/* Completed tasks - Green */}
                      <Scatter 
                        name="Completed"
                        data={scheduleDataByStatus.completed}
                        fill="#22c55e"
                      />
                      
                      {/* Overdue tasks - Red */}
                      <Scatter 
                        name="Overdue"
                        data={scheduleDataByStatus.overdue}
                        fill="#ef4444"
                      />
                      
                      {/* Pending tasks - Blue */}
                      <Scatter 
                        name="Pending"
                        data={scheduleDataByStatus.pending}
                        fill="#3b82f6"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 mb-2">No schedule data available</div>
                  <div className="text-sm text-gray-400">
                    Create a memorization plan to see your schedule timeline
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {scheduleTimeSeriesData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {scheduleTimeSeriesData.filter(s => s.completed).length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {scheduleTimeSeriesData.filter(s => !s.completed && !s.isOverdue).length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {scheduleTimeSeriesData.filter(s => s.isOverdue).length}
                    </div>
                    <div className="text-sm text-gray-600">Overdue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {scheduleTimeSeriesData.reduce((sum, s) => sum + s.lines, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Lines</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projection" className="space-y-4">
          {projection ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Completion Projection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {projection.projectedCompletionDate}
                    </div>
                    <div className="text-gray-600">Projected Completion</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Average pages/month:</span>
                      <Badge>{projection.avgPagesPerMonth}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Months to complete:</span>
                      <Badge>{projection.monthsToComplete}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining pages:</span>
                      <Badge>{projection.remainingPages}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800 mb-2">Current Pace</div>
                    <div className="text-sm text-blue-600">
                      At your current rate of {projection.avgPagesPerMonth} pages per month, 
                      you're on track to complete the Quran in {projection.monthsToComplete} months.
                    </div>
                  </div>

                  {projection.avgPagesPerMonth < 20 && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="font-medium text-yellow-800 mb-2">Suggestion</div>
                      <div className="text-sm text-yellow-600">
                        Consider increasing your daily memorization to complete faster. 
                        Aim for 20-25 pages per month for steady progress.
                      </div>
                    </div>
                  )}

                  {projection.avgPagesPerMonth >= 20 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800 mb-2">Excellent Pace!</div>
                      <div className="text-sm text-green-600">
                        You're maintaining a great memorization pace. Keep up the excellent work!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-2">Not enough data for projection</div>
                <div className="text-sm text-gray-400">
                  Add more memorization entries to see completion projections
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stats;
