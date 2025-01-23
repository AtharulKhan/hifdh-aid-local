import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalEntry } from '@/store/useJournalStore';

interface JournalContextState {
  selectedJournals: JournalEntry[];
  addJournalToContext: (journal: JournalEntry) => void;
  removeJournalFromContext: (journalId: string) => void;
  clearJournalContext: () => void;
}

export const useJournalContext = create<JournalContextState>()(
  persist(
    (set) => ({
      selectedJournals: [],
      addJournalToContext: (journal) =>
        set((state) => ({
          selectedJournals: [...state.selectedJournals, journal],
        })),
      removeJournalFromContext: (journalId) =>
        set((state) => ({
          selectedJournals: state.selectedJournals.filter((j) => j.id !== journalId),
        })),
      clearJournalContext: () => set({ selectedJournals: [] }),
    }),
    {
      name: 'journal-context-storage',
    }
  )
);