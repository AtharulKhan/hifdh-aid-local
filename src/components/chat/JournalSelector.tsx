import React, { useEffect } from 'react';
import { useJournalStore } from '@/store/useJournalStore';
import { useJournalContext } from '@/hooks/use-journal-context';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  startOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  subYears,
  isWithinInterval
} from 'date-fns';

type DateFilter = 
  | 'today'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'last-year'
  | 'last-3-months'
  | 'last-6-months'
  | 'all';

export function JournalSelector() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('all');
  const journals = useJournalStore((state) => state.journals);
  const { selectedJournals, addJournalToContext, removeJournalFromContext, clearJournalContext } = useJournalContext();

  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return { start: startOfToday(), end: now };
      case 'this-week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'last-week':
        return {
          start: startOfWeek(subWeeks(now, 1)),
          end: endOfWeek(subWeeks(now, 1))
        };
      case 'this-month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last-month':
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        };
      case 'this-year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'last-year':
        return {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1))
        };
      case 'last-3-months':
        return { start: subMonths(now, 3), end: now };
      case 'last-6-months':
        return { start: subMonths(now, 6), end: now };
      default:
        return null;
    }
  };

  const filteredJournals = React.useMemo(() => {
    let filtered = journals
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((journal) => {
        const searchString = `${journal.title} ${journal.description} ${journal.tags.join(" ")}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      });
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        filtered = filtered.filter((journal) => {
          const journalDate = new Date(journal.updatedAt);
          return isWithinInterval(journalDate, dateRange);
        });
      }
    }

    return filtered;
  }, [journals, searchTerm, dateFilter]);

  const isSelected = (journalId: string) => {
    return selectedJournals.some(j => j.id === journalId);
  };

  const toggleJournal = (journal: typeof journals[0], event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isSelected(journal.id)) {
      removeJournalFromContext(journal.id);
    } else {
      addJournalToContext(journal);
    }
  };

  const handleSelectAll = () => {
    if (selectedJournals.length === filteredJournals.length) {
      clearJournalContext();
    } else {
      clearJournalContext();
      filteredJournals.forEach(journal => addJournalToContext(journal));
    }
  };

  const handleClearSelection = () => {
    clearJournalContext();
  };

  const handleDateFilterChange = (value: DateFilter) => {
    setDateFilter(value);
    clearJournalContext();
    
    // Only auto-select journals if a date filter is selected
    if (value !== 'all') {
      const dateRange = getDateRange(value);
      if (dateRange) {
        journals.forEach(journal => {
          const journalDate = new Date(journal.updatedAt);
          if (isWithinInterval(journalDate, dateRange)) {
            addJournalToContext(journal);
          }
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search journals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={dateFilter} onValueChange={handleDateFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This week</SelectItem>
            <SelectItem value="last-week">Last week</SelectItem>
            <SelectItem value="this-month">This month</SelectItem>
            <SelectItem value="last-month">Last month</SelectItem>
            <SelectItem value="last-3-months">Last 3 months</SelectItem>
            <SelectItem value="last-6-months">Last 6 months</SelectItem>
            <SelectItem value="this-year">This year</SelectItem>
            <SelectItem value="last-year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="flex-1"
        >
          {selectedJournals.length === filteredJournals.length ? "Deselect All" : "Select All"}
        </Button>

        {selectedJournals.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Selection
          </Button>
        )}
      </div>

      <ScrollArea className="h-[200px] w-full rounded-md border">
        <div className="p-4 space-y-4">
          {filteredJournals.map((journal) => (
            <div
              key={journal.id}
              className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <div className="space-y-1">
                <h4 className="font-medium leading-none">{journal.title}</h4>
                <p className="text-sm text-muted-foreground">{journal.description}</p>
                <p className="text-xs text-muted-foreground">
                  Modified: {new Date(journal.updatedAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-1">
                  {journal.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant={isSelected(journal.id) ? "secondary" : "outline"}
                size="sm"
                onClick={(e) => toggleJournal(journal, e)}
              >
                {isSelected(journal.id) ? "Selected" : "Select"}
              </Button>
            </div>
          ))}
          {filteredJournals.length === 0 && (
            <p className="text-center text-muted-foreground">No journals found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}