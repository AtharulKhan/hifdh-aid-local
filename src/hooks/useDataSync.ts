
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Sync localStorage data to Supabase when user logs in
  useEffect(() => {
    if (user && session) {
      syncLocalDataToSupabase();
    }
  }, [user, session]);

  const syncLocalDataToSupabase = async () => {
    try {
      console.log('Starting data sync to Supabase...');

      // Sync memorization entries
      const memorizationEntries = localStorage.getItem('murajah-memorization-entries');
      if (memorizationEntries) {
        const entries = JSON.parse(memorizationEntries);
        // Note: These would need to be converted to the juz_memorization table format
        console.log('Found memorization entries:', entries.length);
      }

      // Sync juz memorization
      const juzMemorization = localStorage.getItem('murajah-juz-memorization');
      if (juzMemorization) {
        const juzData = JSON.parse(juzMemorization);
        
        for (const juz of juzData) {
          await supabase
            .from('juz_memorization')
            .upsert({
              user_id: user.id,
              juz_number: juz.juzNumber,
              is_memorized: juz.isMemorized,
              date_memorized: juz.dateMemorized,
              start_page: juz.startPage,
              end_page: juz.endPage,
              memorized_surahs: juz.memorizedSurahs
            });
        }
        console.log('Synced juz memorization data');
      }

      // Sync journal entries
      const journalEntries = localStorage.getItem('journal-entries');
      if (journalEntries) {
        const entries = JSON.parse(journalEntries);
        
        for (const entry of entries) {
          await supabase
            .from('journal_entries')
            .upsert({
              id: entry.id,
              user_id: user.id,
              title: entry.title,
              description: entry.description,
              content: entry.content,
              tags: entry.tags,
              created_at: entry.created_at,
              updated_at: entry.updated_at
            });
        }
        console.log('Synced journal entries');
      }

      toast({
        title: "Data synced successfully",
        description: "Your local data has been synced to the cloud.",
      });

    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Sync error",
        description: "There was an error syncing your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadDataFromSupabase = async () => {
    if (!user) return;

    try {
      // Load juz memorization
      const { data: juzData } = await supabase
        .from('juz_memorization')
        .select('*')
        .eq('user_id', user.id);

      if (juzData && juzData.length > 0) {
        const formattedJuzData = juzData.map(juz => ({
          juzNumber: juz.juz_number,
          isMemorized: juz.is_memorized,
          dateMemorized: juz.date_memorized,
          startPage: juz.start_page,
          endPage: juz.end_page,
          memorizedSurahs: juz.memorized_surahs
        }));
        localStorage.setItem('murajah-juz-memorization', JSON.stringify(formattedJuzData));
      }

      // Load journal entries
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id);

      if (journalData && journalData.length > 0) {
        localStorage.setItem('journal-entries', JSON.stringify(journalData));
      }

      console.log('Data loaded from Supabase');

    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    }
  };

  return {
    syncLocalDataToSupabase,
    loadDataFromSupabase
  };
};
