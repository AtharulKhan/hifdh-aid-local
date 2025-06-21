
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Calendar, TrendingUp, Target, BookOpen, Clock, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";
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

const Stats = () => {
  // Load data from localStorage
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

  // Create time series data for Juz memorization
  const juzTimeSeriesData = useMemo(() => {
    const memorizedJuzWithDates = juzData
      .filter(j => j.isMemorized && j.dateMemorized)
      .map(j => ({
        date: j.dateMemorized!,
        juzNumber: j.juzNumber,
        parsedDate: parseISO(j.dateMemorized!)
      }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    let cumulativeCount = 0;
    return memorizedJuzWithDates.map((item, index) => {
      cumulativeCount = index + 1;
      return {
        date: format(item.parsedDate, 'MMM dd, yyyy'),
        juz: item.juzNumber,
        cumulativeJuz: cumulativeCount,
        parsedDate: item.parsedDate
      };
    });
  }, [juzData]);

  // Calculate basic stats
  const stats = useMemo(() => {
    const memorizedJuz = juzData.filter(j => j.isMemorized).length;
    const totalPages = memorizationEntries.reduce((sum, entry) => sum + (entry.endPage - entry.startPage + 1), 0);
    
    // Count unique surahs from juz data
    const memorizedSurahs = new Set<number>();
    juzData.forEach(juz => {
      if (juz.isMemorized && juz.memorizedSurahs) {
        juz.memorizedSurahs.forEach(surah => memorizedSurahs.add(surah));
      }
    });

    // Calculate verses (approximate - 15 lines per page, ~2 verses per line)
    const approximateVerses = totalPages * 30;

    return {
      memorizedJuz,
      memorizedSurahs: memorizedSurahs.size,
      totalPages,
      approximateVerses,
      totalJuz: 30,
      totalSurahs: 114,
      totalQuranPages: 604,
      totalQuranVerses: 6236
    };
  }, [juzData, memorizationEntries]);

  // Monthly progress data
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthEntries = memorizationEntries.filter(entry => {
        const entryDate = parseISO(entry.dateMemorized);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });

      const juzThisMonth = new Set(monthEntries.map(e => e.juz)).size;
      const pagesThisMonth = monthEntries.reduce((sum, entry) => sum + (entry.endPage - entry.startPage + 1), 0);

      // Count surahs memorized this month
      const surahsThisMonth = new Set<number>();
      monthEntries.forEach(entry => {
        // This is a simplified calculation - you might want to improve this based on your data structure
        surahsThisMonth.add(entry.juz); // Using juz as proxy for now
      });

      return {
        month: format(month, 'MMM yyyy'),
        juz: juzThisMonth,
        pages: pagesThisMonth,
        surahs: surahsThisMonth.size,
        date: month
      };
    });
  }, [memorizationEntries]);

  // Projection calculation
  const projection = useMemo(() => {
    if (memorizationEntries.length < 2) return null;

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

  // Custom tooltip for Juz time series
  const JuzTimeSeriesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">Juz {data.juz}</p>
          <p className="text-sm text-gray-600">{data.date}</p>
          <p className="text-sm text-blue-600">Total: {data.cumulativeJuz} Juz</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold">Memorization Stats</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
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
          {juzTimeSeriesData.length > 0 && (
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
                    <ScatterChart data={juzTimeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="parsedDate"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                      />
                      <YAxis 
                        dataKey="cumulativeJuz"
                        type="number"
                        domain={[0, 30]}
                        label={{ value: 'Cumulative Juz', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<JuzTimeSeriesTooltip />} />
                      <Scatter 
                        dataKey="cumulativeJuz" 
                        fill="#8884d8"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeJuz" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: '#8884d8' }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
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
                {memorizationEntries.slice(-5).reverse().map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Juz {entry.juz}</div>
                      <div className="text-sm text-gray-600">Pages {entry.startPage}-{entry.endPage}</div>
                    </div>
                    <Badge variant="outline">
                      {format(parseISO(entry.dateMemorized), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                ))}
                {memorizationEntries.length === 0 && (
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
