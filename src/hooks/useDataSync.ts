
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  // No automatic sync - everything is manual only

  const syncLocalDataToSupabase = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to sync your data to the cloud.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Starting manual data sync to Supabase...');

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
        title: "Data pushed to cloud",
        description: "Your local data has been pushed to the cloud.",
      });

    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Push error",
        description: "There was an error pushing your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadDataFromSupabase = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to pull your data from the cloud.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Loading data from Supabase...');

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

      toast({
        title: "Data pulled from cloud",
        description: "Your cloud data has been pulled to local storage. Page will refresh.",
      });

      // Refresh the page to show the updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      toast({
        title: "Pull error",
        description: "There was an error pulling your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearSupabaseData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to clear your cloud data.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Clearing data from Supabase...');

      // Clear juz memorization
      await supabase
        .from('juz_memorization')
        .delete()
        .eq('user_id', user.id);

      // Clear journal entries
      await supabase
        .from('journal_entries')
        .delete()
        .eq('user_id', user.id);

      // Clear memorization planner settings
      await supabase
        .from('memorization_planner_settings')
        .delete()
        .eq('user_id', user.id);

      // Clear memorization planner schedule
      await supabase
        .from('memorization_planner_schedule')
        .delete()
        .eq('user_id', user.id);

      console.log('Cleared all data from Supabase');

      toast({
        title: "Cloud data cleared",
        description: "All your data has been cleared from the cloud.",
      });

    } catch (error) {
      console.error('Error clearing data from Supabase:', error);
      toast({
        title: "Clear error",
        description: "There was an error clearing your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    syncLocalDataToSupabase,
    loadDataFromSupabase,
    clearSupabaseData
  };
};
