import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface JournalState {
  journals: JournalEntry[];
  addJournal: (journal: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournal: (id: string, journal: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => void;
  getJournal: (id: string) => JournalEntry | undefined;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      journals: [],
      addJournal: (journal) => {
        const newJournal = {
          ...journal,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          journals: [...state.journals, newJournal],
        }));
      },
      updateJournal: (id, journal) => {
        set((state) => ({
          journals: state.journals.map((j) =>
            j.id === id
              ? { ...j, ...journal, updatedAt: new Date() }
              : j
          ),
        }));
      },
      deleteJournal: (id) => {
        set((state) => ({
          journals: state.journals.filter((j) => j.id !== id),
        }));
      },
      getJournal: (id) => {
        return get().journals.find((j) => j.id === id);
      },
    }),
    {
      name: 'journal-storage',
    }
  )
);