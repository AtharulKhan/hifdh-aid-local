
import quranJson from './quran.json';
import tajweedJson from './tajweed.json';
import surahNamesJson from './surah-names.json';
import juzNumbersJson from './juz-numbers.json';
import tafsirIbnKathirJson from './tafsir-ibn-kathir.json';
import tafsirMaarifJson from './tafsir-maarif.json';
import quranTranslationJson from './quran-translation.json';

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

export interface SurahInfo {
  id: number;
  name: number;
  name_simple: string;
  name_arabic: string;
  revelation_order: number;
  revelation_place: string;
  verses_count: number;
  bismillah_pre: boolean;
}

export interface JuzInfo {
  juz_number: number;
  verses_count: number;
  first_verse_key: string;
  last_verse_key: string;
  verse_mapping: Record<string, string>;
}

export interface TafsirData {
  text: string;
}

export interface TranslationData {
  t: string;
}

// Load Quran data from JSON
export const quranData: Record<string, QuranVerse> = quranJson;

// Load Tajweed data from JSON
export const tajweedData: Record<string, TajweedWord> = tajweedJson;

// Load Surah names data from JSON
export const surahNamesData: Record<string, SurahInfo> = surahNamesJson;

// Load Juz numbers data from JSON
export const juzNumbersData: Record<string, JuzInfo> = juzNumbersJson;

// Load Translation data from JSON
export const quranTranslationData: Record<string, TranslationData> = quranTranslationJson;

// Load Tafsir data from JSON with proper type handling
export const tafsirIbnKathirData: Record<string, TafsirData> = Object.fromEntries(
  Object.entries(tafsirIbnKathirJson as Record<string, string | TafsirData>).map(([key, value]) => [
    key,
    typeof value === 'string' ? { text: value } : value
  ])
);

export const tafsirMaarifData: Record<string, TafsirData> = Object.fromEntries(
  Object.entries(tafsirMaarifJson as Record<string, string | TafsirData>).map(([key, value]) => [
    key,
    typeof value === 'string' ? { text: value } : value
  ])
);

// Helper function to get verses as array
export const getVersesArray = (): QuranVerse[] => {
  return Object.values(quranData).sort((a, b) => a.id - b.id);
};

// Helper function to get verse by ID
export const getVerseById = (id: number): QuranVerse | undefined => {
  return getVersesArray().find(verse => verse.id === id);
};

// Helper function to get surah name with improved formatting
export const getSurahName = (surahNumber: number): string => {
  const surahInfo = surahNamesData[surahNumber.toString()];
  if (surahInfo) {
    return `${surahInfo.name_arabic} (${surahInfo.name_simple})`;
  }
  return `Surah ${surahNumber}`;
};

// Helper function to get translation for a verse
export const getTranslationForVerse = (surah: number, ayah: number): string | undefined => {
  const verseKey = `${surah}:${ayah}`;
  const translation = quranTranslationData[verseKey];
  return translation?.t;
};

// Helper function to get juz info
export const getJuzInfo = (juzNumber: number): JuzInfo | undefined => {
  return juzNumbersData[juzNumber.toString()];
};

// Helper function to get juz number for a verse
export const getJuzForVerse = (surahNumber: number, ayahNumber: number): number | undefined => {
  for (const [juzNum, juzInfo] of Object.entries(juzNumbersData)) {
    const verseMapping = juzInfo.verse_mapping;
    const surahKey = surahNumber.toString();
    
    if (verseMapping[surahKey]) {
      const range = verseMapping[surahKey];
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (ayahNumber >= start && ayahNumber <= end) {
          return parseInt(juzNum);
        }
      } else {
        if (ayahNumber === parseInt(range)) {
          return parseInt(juzNum);
        }
      }
    }
  }
  return undefined;
};

// Helper function to get first verse of a juz
export const getFirstVerseOfJuz = (juzNumber: number): QuranVerse | undefined => {
  const juzInfo = getJuzInfo(juzNumber);
  if (!juzInfo) return undefined;
  
  const [surah, ayah] = juzInfo.first_verse_key.split(':').map(Number);
  return getVersesArray().find(verse => verse.surah === surah && verse.ayah === ayah);
};

// Helper function to get Ibn Kathir tafsir for a verse
export const getTafsirIbnKathirForVerse = (surah: number, ayah: number): TafsirData | undefined => {
  const verseKey = `${surah}:${ayah}`;
  return tafsirIbnKathirData[verseKey];
};

// Helper function to get Maarif-ul-Qur'an tafsir for a verse
export const getTafsirMaarifForVerse = (surah: number, ayah: number): TafsirData | undefined => {
  const verseKey = `${surah}:${ayah}`;
  return tafsirMaarifData[verseKey];
};

// Legacy function for backward compatibility
export const getTafsirForVerse = (surah: number, ayah: number): TafsirData | undefined => {
  return getTafsirIbnKathirForVerse(surah, ayah);
};
