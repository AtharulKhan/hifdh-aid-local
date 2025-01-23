import React, { useEffect } from 'react';
import { useJournalStore } from '@/store/useJournalStore';
import { useJournalContext } from '@/hooks/use-journal-context';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function JournalSelector() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const journals = useJournalStore((state) => state.journals);
  const { selectedJournals, addJournalToContext, removeJournalFromContext, clearJournalContext } = useJournalContext();
  const [autoSelectDisabled, setAutoSelectDisabled] = React.useState(false);

  const filteredJournals = React.useMemo(() => {
    return journals
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter((journal) => {
        const searchString = `${journal.title} ${journal.description} ${journal.tags.join(" ")}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      });
  }, [journals, searchTerm]);

  useEffect(() => {
    // Only auto-select if not manually cleared and no journals are selected
    if (!autoSelectDisabled && selectedJournals.length === 0 && filteredJournals.length > 0) {
      const lastThreeJournals = filteredJournals.slice(0, 3);
      lastThreeJournals.forEach(journal => addJournalToContext(journal));
    }
  }, [filteredJournals, selectedJournals.length, addJournalToContext, autoSelectDisabled]);

  const isSelected = (journalId: string) => {
    return selectedJournals.some(j => j.id === journalId);
  };

  const toggleJournal = (journal: typeof journals[0], event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setAutoSelectDisabled(true);
    
    if (isSelected(journal.id)) {
      removeJournalFromContext(journal.id);
    } else {
      addJournalToContext(journal);
    }
  };

  const handleSelectAll = () => {
    setAutoSelectDisabled(true);
    if (selectedJournals.length === filteredJournals.length) {
      clearJournalContext();
    } else {
      clearJournalContext();
      filteredJournals.forEach(journal => addJournalToContext(journal));
    }
  };

  const handleClearSelection = () => {
    setAutoSelectDisabled(true);
    clearJournalContext();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search journals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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