import React from "react";
import { Calendar } from "@/components/Calendar";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { useJournalStore } from "@/store/useJournalStore";
import { Card } from "@/components/ui/card";
import { MindfulMomentGenerator } from "@/components/mindfulness/MindfulMomentGenerator";
import { AmbientSoundStudio } from "@/components/mindfulness/AmbientSoundStudio";
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "@/components/ui/scroll-area";
import { JournalCard } from "@/components/journal/JournalCard";
import { format, isEqual, startOfDay } from "date-fns";

const Index = () => {
  const journals = useJournalStore((state) => state.journals);
  const lastReflection = localStorage.getItem('lastAIReflection');
  const recentJournals = journals.slice(-3).reverse();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  // Filter journals for selected date
  const selectedDateJournals = journals.filter((journal) => {
    const journalDate = startOfDay(new Date(journal.createdAt));
    const selectedDay = startOfDay(selectedDate);
    return isEqual(journalDate, selectedDay);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Home
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Latest AI Reflection */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-secondary">Latest Reflection</h2>
              {lastReflection ? (
                <Card className="p-6 bg-secondary/5 border-none">
                  <ScrollArea className="h-[200px]">
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-4 [&>h1]:mb-6 [&>h2]:mb-4 [&>h3]:mb-3 [&>ul]:mb-4 [&>ol]:mb-4 [&>blockquote]:mb-4 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{lastReflection}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </Card>
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  No reflection generated yet. Visit the Mindfulness page to generate one.
                </Card>
              )}
            </section>

            {/* Selected Date Journals */}
            {selectedDateJournals.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary">
                  Journals for {format(selectedDate, 'MMMM d, yyyy')}
                </h2>
                <div className="space-y-4">
                  {selectedDateJournals.map((journal) => (
                    <JournalCard
                      key={journal.id}
                      journal={journal}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Journal Entries */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-secondary">Recent Journals</h2>
              <div className="space-y-4">
                {recentJournals.length > 0 ? (
                  recentJournals.map((journal) => (
                    <JournalCard
                      key={journal.id}
                      journal={journal}
                      onClick={() => {}}
                    />
                  ))
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    No journal entries yet. Start writing to see them here.
                  </Card>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Calendar />
            
            {/* Ambient Sound Player */}
            <Card className="p-6">
              <AmbientSoundStudio />
            </Card>

            {/* Mindful Moment */}
            <Card className="p-6">
              <MindfulMomentGenerator />
            </Card>
          </div>
        </div>
      </main>
      <FloatingChatButton />
    </div>
  );
};

export default Index;