import initSqlJs from 'sql.js';

// --- Type Definitions ---
export interface QuranVerse {
  id: number;
  verse_key: string;
  surah: number;
  ayah: number;
  text: string;
}

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
}

export interface ProcessedPages {
  [pageNumber: number]: ProcessedLine[];
}

let dbInstance: initSqlJs.Database | null = null;
let quranDataInstance: QuranJson | null = null;
let wordIdToVerseKeyMapInstance: Map<number, string> | null = null;

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

// --- Helper to fetch and parse quran.json ---
async function getQuranData(quranJsonPath: string): Promise<QuranJson> {
  if (quranDataInstance) {
    return quranDataInstance;
  }
  quranDataInstance = await fetch(quranJsonPath).then(res => res.json());
  return quranDataInstance;
}

// --- Helper to build wordId to verseKey map ---
async function getWordIdToVerseKeyMap(database: initSqlJs.Database): Promise<Map<number, string>> {
  if (wordIdToVerseKeyMapInstance) {
    return wordIdToVerseKeyMapInstance;
  }
  const wordRows: WordInfoFromDb[] = database.exec(
    'SELECT id, surah_number, ayah_number FROM words'
  )[0]?.values.map((row: any) => ({
    id: row[0] as number,
    surah_number: row[1] as number,
    ayah_number: row[2] as number,
  })) || [];

  wordIdToVerseKeyMapInstance = new Map<number, string>();
  for (const w of wordRows) {
    wordIdToVerseKeyMapInstance.set(w.id, `${w.surah_number}:${w.ayah_number}`);
  }
  return wordIdToVerseKeyMapInstance;
}

// --- Main processing function ---
export async function processQuranData(
  dbPath: string = '/qpc-hafs-15-lines.db', // Path relative to public folder
  quranJsonPath: string = '/quran.json'    // Path relative to public folder
): Promise<ProcessedPages> {
  const database = await getDb(dbPath);
  const quran = await getQuranData(quranJsonPath);
  const wordIdToVerseKey = await getWordIdToVerseKeyMap(database);

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

    if (!firstKey || !lastKey) {
      console.warn(`Could not find verse keys for line: page ${r.page}, line ${r.line}. Word IDs: ${r.first_word_id}, ${r.last_word_id}`);
      // Fallback or skip this line
      // For now, we'll create a line with a placeholder text if keys are missing.
      const line: ProcessedLine = {
        lineType: r.lineType,
        centered: !!r.isCentered,
        verseKeys: [],
        text: 'Error: Verse keys not found for this line.',
      };
      (processedPages[r.page] ??= []).push(line);
      continue;
    }

    const verseKeys: string[] = [];
    if (firstKey === lastKey) {
      verseKeys.push(firstKey);
    } else {
      // This is a simplified logic. A more robust solution would iterate through
      // all verse numbers between firstKey and lastKey if a line can span multiple verses.
      // For the 15-line mushaf, lines usually don't span widely separated verses.
      // We will parse surah and ayah numbers to determine the range if needed.
      const [s1, a1] = firstKey.split(':').map(Number);
      const [s2, a2] = lastKey.split(':').map(Number);

      if (s1 !== s2) {
        // Line spans surahs - this is complex and rare in 15-line mushaf lines.
        // Sticking to simple first/last for now.
        verseKeys.push(firstKey);
        if (firstKey !== lastKey) verseKeys.push(lastKey);
         console.warn(`Line spans surahs: ${firstKey} to ${lastKey}. Page ${r.page}, Line ${r.line}. Text might be incomplete.`);
      } else {
         // Line is within the same surah
        for (let ayahNum = a1; ayahNum <= a2; ayahNum++) {
          const currentKey = `${s1}:${ayahNum}`;
          if (quran[currentKey]) { // Check if the verse key exists in quran.json
            verseKeys.push(currentKey);
          } else {
            // This case might happen if last_word_id points to a verse that doesn't exist (e.g. end of surah)
            // or if the wordIdToVerseKey map is somehow incomplete for this range.
            console.warn(`Verse key ${currentKey} not found in quran.json for page ${r.page}, line ${r.line}`);
          }
        }
        // Ensure unique keys, though the loop should naturally produce them if quran.json is consistent.
        // And if no keys were added (e.g. a1 > a2), use first and last.
        if (verseKeys.length === 0) {
            verseKeys.push(firstKey);
            if (firstKey !== lastKey) verseKeys.push(lastKey); // Should not happen if a1 > a2
        }
      }
    }

    // Remove duplicates just in case (e.g. if firstKey and lastKey were the same and added twice)
    const uniqueVerseKeys = [...new Set(verseKeys)];

    const text = uniqueVerseKeys
      .map(k => quran[k]?.text || '') // Add null check for quran[k]
      .join(' ')
      .trim();

    const line: ProcessedLine = {
      lineType: r.lineType,
      centered: !!r.isCentered,
      verseKeys: uniqueVerseKeys,
      text: text || (r.lineType === 'bismillah' && r.surah !== 1 && r.surah !== 9 ? (quran[`${r.surah}:0`]?.text || 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ') : (r.lineType === 'surah_header' ? '' : 'Error: Text not found')),
    };

    (processedPages[r.page] ??= []).push(line);
  }

  return processedPages;
}

// Optional: Function to clear cached instances if re-processing is needed with different files
export function clearQuranDataCache(): void {
  dbInstance = null;
  quranDataInstance = null;
  wordIdToVerseKeyMapInstance = null;
}
