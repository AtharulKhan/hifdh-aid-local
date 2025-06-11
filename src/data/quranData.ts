
import quranJson from './quran.json';
import tajweedJson from './tajweed.json';

export interface QuranVerse {
  id: number;
  verse_key: string;
  surah: number;
  ayah: number;
  text: string;
}

export interface TajweedWord {
  id: number;
  surah: string;
  ayah: string;
  word: string;
  location: string;
  text: string;
}

// Load Quran data from JSON
export const quranData: Record<string, QuranVerse> = quranJson;

// Load Tajweed data from JSON
export const tajweedData: Record<string, TajweedWord> = tajweedJson;

// Helper function to get verses as array
export const getVersesArray = (): QuranVerse[] => {
  return Object.values(quranData).sort((a, b) => a.id - b.id);
};

// Helper function to get verse by ID
export const getVerseById = (id: number): QuranVerse | undefined => {
  return getVersesArray().find(verse => verse.id === id);
};

// Helper function to get surah name (basic implementation)
export const getSurahName = (surahNumber: number): string => {
  const surahNames: Record<number, string> = {
    1: "الفاتحة (Al-Fatihah)",
    2: "البقرة (Al-Baqarah)"
  };
  return surahNames[surahNumber] || `Surah ${surahNumber}`;
};
