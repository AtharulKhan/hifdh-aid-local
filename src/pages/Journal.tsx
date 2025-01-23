import React, { useState } from "react";
import { JournalCard } from "@/components/journal/JournalCard";
import { JournalSearch } from "@/components/journal/JournalSearch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewJournalForm } from "@/components/journal/NewJournalForm";

export default function Journal() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<JournalEntry[]>([]);

  const handleSearch = (query: string) => {
    const filtered = journals.filter((journal) => {
      const searchString = `${journal.title} ${journal.description} ${journal.tags.join(" ")}`.toLowerCase();
      return searchString.includes(query.toLowerCase());
    });
    setFilteredJournals(filtered);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Journal</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Journal Entry</DialogTitle>
            </DialogHeader>
            <NewJournalForm />
          </DialogContent>
        </Dialog>
      </div>

      <JournalSearch onSearch={handleSearch} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJournals.map((journal) => (
          <JournalCard
            key={journal.id}
            journal={journal}
          />
        ))}
        {filteredJournals.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No journal entries found.
          </div>
        )}
      </div>
    </div>
  );
}

interface JournalEntry {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}