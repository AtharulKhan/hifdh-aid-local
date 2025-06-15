
import initSqlJs from 'sql.js';
import { quranData, QuranVerse } from '@/data/quranData';

// --- Type Definitions ---
export interface QuranJson {
  [key: string]: QuranVerse;
}

export interface PageLineFromDb {
  page: number;
  line: number;
  lineType: string;
  isCentered: number;
  first_word_id: number;
  last_word_id: number;
  surah: number;
}

export interface WordInfoFromDb {
  id: number;
  surah_number: number;
  ayah_number: number;
}

export interface ProcessedLine {
  lineType: string;
  centered: boolean;
  verseKeys: string[];
  text: string;
  lineNumber: number;
}

export interface ProcessedPages {
  [pageNumber: number]: ProcessedLine[];
}

let dbInstance: initSqlJs.Database | null = null;
let wordIdToVerseKeyMapInstance: Map<number, string> | null = null;
let wordIdToWordTextMapInstance: Map<number, string> | null = null;

// --- Helper to fetch and initialize the database ---
async function getDb(dbPath: string): Promise<initSqlJs.Database> {
  if (dbInstance) {
    return dbInstance;
  }
  const SQL = await initSqlJs({
    locateFile: file => `/${file}` // Assuming sql-wasm.wasm is in public root
  });
  const dbBuffer = await fetch(dbPath).then(res => res.arrayBuffer());
  dbInstance = new SQL.Database(new Uint8Array(dbBuffer));
  return dbInstance;
}

// --- Helper to build wordId to verseKey map from quranData ---
function getWordIdToVerseKeyMap(): Map<number, string> {
  if (wordIdToVerseKeyMapInstance) {
    return wordIdToVerseKeyMapInstance;
  }
  
  const newMap = new Map<number, string>();
  // Sort verses to ensure words are counted in Quranic order
  const verses = Object.values(quranData as QuranJson).sort((a, b) => a.id - b.id);
  
  let wordIdCounter = 1;

  for (const verse of verses) {
    // The verse number is a word, so we don't remove it.
    const words = verse.text.trim().split(/\s+/).filter(w => w.length > 0);

    for (let i = 0; i < words.length; i++) {
      newMap.set(wordIdCounter, verse.verse_key);
      wordIdCounter++;
    }
  }

  wordIdToVerseKeyMapInstance = newMap;
  return newMap;
}

// --- Helper to build wordId to word text map ---
function getWordIdToWordTextMap(): Map<number, string> {
    if (wordIdToWordTextMapInstance) {
        return wordIdToWordTextMapInstance;
    }

    const newMap = new Map<number, string>();
    const verses = Object.values(quranData as QuranJson).sort((a, b) => a.id - b.id);
    let wordIdCounter = 1;

    for (const verse of verses) {
        const words = verse.text.trim().split(/\s+/).filter(w => w.length > 0);
        for (const word of words) {
            newMap.set(wordIdCounter, word);
            wordIdCounter++;
        }
    }

    wordIdToWordTextMapInstance = newMap;
    return newMap;
}


// --- Main processing function ---
export async function processQuranData(
  dbPath: string
): Promise<ProcessedPages> {
  const database = await getDb(dbPath);
  const quran: QuranJson = quranData;
  const wordIdToVerseKey = getWordIdToVerseKeyMap();
  const wordIdToWordText = getWordIdToWordTextMap();

  const pageLineRows: PageLineFromDb[] = database.exec(`
    SELECT
      page_number  AS page,
      line_number  AS line,
      line_type    AS lineType,
      is_centered  AS isCentered,
      first_word_id,
      last_word_id,
      surah_number AS surah
    FROM pages
    ORDER BY page_number, line_number;
  `)[0]?.values.map((row: any) => ({
    page: row[0] as number,
    line: row[1] as number,
    lineType: row[2] as string,
    isCentered: row[3] as number,
    first_word_id: row[4] as number,
    last_word_id: row[5] as number,
    surah: row[6] as number,
  })) || [];

  const processedPages: ProcessedPages = {};

  for (const r of pageLineRows) {
    const firstKey = wordIdToVerseKey.get(r.first_word_id);
    const lastKey = wordIdToVerseKey.get(r.last_word_id);

    const verseKeys: string[] = [];
    if (firstKey && lastKey) {
      if (firstKey === lastKey) {
        verseKeys.push(firstKey);
      } else {
        const [s1, a1] = firstKey.split(':').map(Number);
        const [s2, a2] = lastKey.split(':').map(Number);

        if (s1 !== s2) {
          verseKeys.push(firstKey);
          if (firstKey !== lastKey) verseKeys.push(lastKey);
           console.warn(`Line spans surahs: ${firstKey} to ${lastKey}. Page ${r.page}, Line ${r.line}.`);
        } else {
          for (let ayahNum = a1; ayahNum <= a2; ayahNum++) {
            const currentKey = `${s1}:${ayahNum}`;
            if (quran[currentKey]) { // Check if the verse key exists in quran.json
              verseKeys.push(currentKey);
            }
          }
          if (verseKeys.length === 0) {
              verseKeys.push(firstKey);
              if (firstKey !== lastKey) verseKeys.push(lastKey);
          }
        }
      }
    }

    const uniqueVerseKeys = [...new Set(verseKeys)];

    let lineText = '';
    if (r.first_word_id && r.last_word_id && r.last_word_id >= r.first_word_id) {
        const wordsInLine = [];
        for (let wordId = r.first_word_id; wordId <= r.last_word_id; wordId++) {
            const wordText = wordIdToWordText.get(wordId);
            if (wordText) {
                wordsInLine.push(wordText);
            } else {
                console.warn(`Word text not found for word_id: ${wordId} on page ${r.page}, line ${r.line}`);
            }
        }
        lineText = wordsInLine.join(' ');
    }
    
    const line: ProcessedLine = {
      lineType: r.lineType,
      centered: !!r.isCentered,
      verseKeys: uniqueVerseKeys,
      text: lineText || (r.lineType === 'bismillah' && r.surah !== 1 && r.surah !== 9 ? (quran[`${r.surah}:0`]?.text || 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ') : (r.lineType === 'surah_header' ? '' : '')),
      lineNumber: r.line,
    };

    (processedPages[r.page] ??= []).push(line);
  }

  return processedPages;
}

// Optional: Function to clear cached instances if re-processing is needed with different files
export function clearQuranDataCache(): void {
  dbInstance = null;
  wordIdToVerseKeyMapInstance = null;
  wordIdToWordTextMapInstance = null;
}
