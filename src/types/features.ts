import { Tables } from "@/integrations/supabase/types";

// Base WeakSpot type from Supabase, making id non-optional for display purposes
// and status also non-optional as we'd expect it to be set.
export interface BaseWeakSpot extends Omit<Tables<'weak_spots'>, 'id' | 'status'> {
  id: string; // Ensure id is string, matching Supabase Row type
  status: 'weak' | 'mastered';
}

export interface WeakSpotDisplay extends BaseWeakSpot {
  verse_key: string;
  text_snippet: string;
  surah_name: string; // Added for display convenience in the Hub
}

export interface VerseDisplay {
  id: number; // Global Quran verse ID from quranData
  surah_number: number;
  ayah_number: number;
  text: string;
  verse_key: string;
}

// Specific type for identifying flagged verses in QuranViewer's state
export interface FlaggedVerseIdentifier {
  surah_number: number;
  ayah_number: number;
}
