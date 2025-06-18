
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Calendar, BookOpen, Target, Clock, TrendingUp, Award } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addMonths } from "date-fns";

interface JuzMemorization {
  juzNumber: number;
  isMemorized: boolean;
  dateMemorized?: string;
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
  const [juzData, setJuzData] = useState<JuzMemorization[]>([]);
  const [memorizationEntries, setMemorizationEntries] = useState<MemorizationEntry[]>([]);

  useEffect(() => {
    // Load Juz memorization data
    const savedJuzData = localStorage.getItem('murajah-juz-memorization');
    if (savedJuzData) {
      setJuzData(JSON.parse(savedJuzData));
    }

    // Load memorization entries
    const savedEntries = localStorage.getItem('murajah-memorization-entries');
    if (savedEntries) {
      setMemorizationEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Calculate basic statistics
  const stats = useMemo(() => {
    const totalJuz = 30;
    const totalSurahs = 114;
    const totalVerses = 6236;
    const totalPages = 604;

    const memorizedJuz = juzData.filter(j => j.isMemorized).length;
    const partiallyMemorizedJuz = juzData.filter(j => !j.isMemorized && j.memorizedSurahs && j.memorizedSurahs.length > 0).length;
    
    const memorizedSurahs = new Set<number>();
    juzData.forEach(juz => {
      if (juz.isMemorized) {
        // Add all surahs from this juz (simplified calculation)
        for (let i = 1; i <= 114; i++) {
          memorizedSurahs.add(i);
        }
      } else if (juz.memorizedSurahs) {
        juz.memorizedSurahs.forEach(surah => memorizedSurahs.add(surah));
      }
    });

    const memorizedPages = memorizationEntries.reduce((total, entry) => 
      total + (entry.endPage - entry.startPage + 1), 0);

    const progress = {
      juz: (memorizedJuz / totalJuz) * 100,
      surahs: (memorizedSurahs.size / totalSurahs) * 100,
      pages: (memorizedPages / totalPages) * 100,
      verses: ((memorizedPages / totalPages) * totalVerses / totalVerses) * 100 // Approximation
    };

    return {
      total: { juz: totalJuz, surahs: totalSurahs, verses: totalVerses, pages: totalPages },
      memorized: { 
        juz: memorizedJuz, 
        surahs: memorizedSurahs.size, 
        verses: Math.round((memorizedPages / totalPages) * totalVerses),
        pages: memorizedPages 
      },
      partial: { juz: partiallyMemorizedJuz },
      progress
    };
  }, [juzData, memorizationEntries]);

  // Monthly memorization data
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const juzThisMonth = juzData.filter(j => 
        j.dateMemorized && 
        parseISO(j.dateMemorized) >= monthStart && 
        parseISO(j.dateMemorized) <= monthEnd
      ).length;

      const entriesThisMonth = memorizationEntries.filter(entry =>
        parseISO(entry.dateMemorized) >= monthStart && 
        parseISO(entry.dateMemorized) <= monthEnd
      );

      const pagesThisMonth = entriesThisMonth.reduce((total, entry) => 
        total + (entry.endPage - entry.startPage + 1), 0);

      return {
        month: format(month, 'MMM yyyy'),
        juz: juzThisMonth,
        pages: pagesThisMonth,
        entries: entriesThisMonth.length
      };
    });
  }, [juzData, memorizationEntries]);

  // Projection calculation
  const projection = useMemo(() => {
    const recentMonths = monthlyData.slice(-3);
    const avgPagesPerMonth = recentMonths.reduce((sum, month) => sum + month.pages, 0) / 3;
    
    if (avgPagesPerMonth === 0) return null;

    const remainingPages = stats.total.pages - stats.memorized.pages;
    const monthsToComplete = Math.ceil(remainingPages / avgPagesPerMonth);
    const completionDate = addMonths(new Date(), monthsToComplete);

    return {
      avgPagesPerMonth: Math.round(avgPagesPerMonth),
      monthsToComplete,
      completionDate: format(completionDate, 'MMMM yyyy'),
      remainingPages
    };
  }, [monthlyData, stats]);

  const chartConfig = {
    juz: { label: "Juz", color: "hsl(var(--chart-1))" },
    pages: { label: "Pages", color: "hsl(var(--chart-2))" },
    entries: { label: "Sessions", color: "hsl(var(--chart-3))" }
  };

  const pieData = [
    { name: 'Memorized', value: stats.memorized.juz, color: '#22c55e' },
    { name: 'Partial', value: stats.partial.juz, color: '#f59e0b' },
    { name: 'Not Started', value: stats.total.juz - stats.memorized.juz - stats.partial.juz, color: '#e5e7eb' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Memorization Statistics
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track your Quran memorization progress with detailed analytics and projections
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.memorized.juz}</div>
                <div className="text-sm text-gray-600">Juz Memorized</div>
                <div className="text-xs text-gray-500">of {stats.total.juz} total</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{stats.memorized.surahs}</div>
                <div className="text-sm text-gray-600">Surahs Memorized</div>
                <div className="text-xs text-gray-500">of {stats.total.surahs} total</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.memorized.pages}</div>
                <div className="text-sm text-gray-600">Pages Memorized</div>
                <div className="text-xs text-gray-500">of {stats.total.pages} total</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{stats.memorized.verses}</div>
                <div className="text-sm text-gray-600">Verses Memorized</div>
                <div className="text-xs text-gray-500">of {stats.total.verses} total</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Juz Progress</span>
                    <span>{Math.round(stats.progress.juz)}%</span>
                  </div>
                  <Progress value={stats.progress.juz} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Surah Progress</span>
                    <span>{Math.round(stats.progress.surahs)}%</span>
                  </div>
                  <Progress value={stats.progress.surahs} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Page Progress</span>
                    <span>{Math.round(stats.progress.pages)}%</span>
                  </div>
                  <Progress value={stats.progress.pages} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Juz Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Progress Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-green-600">Completed Juz</h3>
                  <div className="space-y-1">
                    {juzData.filter(j => j.isMemorized).map(juz => (
                      <Badge key={juz.juzNumber} variant="default" className="mr-1">
                        Juz {juz.juzNumber}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-yellow-600">Partially Completed</h3>
                  <div className="space-y-1">
                    {juzData.filter(j => !j.isMemorized && j.memorizedSurahs && j.memorizedSurahs.length > 0).map(juz => (
                      <Badge key={juz.juzNumber} variant="outline" className="mr-1">
                        Juz {juz.juzNumber} ({juz.memorizedSurahs?.length} surahs)
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-600">Not Started</h3>
                  <div className="text-sm text-gray-500">
                    {stats.total.juz - stats.memorized.juz - stats.partial.juz} Juz remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Memorization Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="juz" stroke="var(--color-juz)" strokeWidth={2} />
                    <Line type="monotone" dataKey="pages" stroke="var(--color-pages)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="entries" fill="var(--color-entries)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection" className="space-y-6">
          {projection ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">{projection.avgPagesPerMonth}</div>
                    <div className="text-sm text-gray-600">Avg Pages/Month</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">{projection.monthsToComplete}</div>
                    <div className="text-sm text-gray-600">Months to Complete</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-lg font-bold text-green-600">{projection.completionDate}</div>
                    <div className="text-sm text-gray-600">Expected Completion</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress to Completion</span>
                        <span>{Math.round(stats.progress.pages)}% Complete</span>
                      </div>
                      <Progress value={stats.progress.pages} className="h-3" />
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>• {projection.remainingPages} pages remaining</p>
                      <p>• At current pace ({projection.avgPagesPerMonth} pages/month), completion expected by {projection.completionDate}</p>
                      <p>• To complete by end of this year, you need {Math.ceil(projection.remainingPages / 12)} pages per month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  Start memorizing to see your completion projections!
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
