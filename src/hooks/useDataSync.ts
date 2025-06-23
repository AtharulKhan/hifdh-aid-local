
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Removed automatic sync - data will only be synced manually

  const syncLocalDataToSupabase = async () => {
    try {
      console.log('Starting data sync to Supabase...');

      // Sync memorization planner settings
      const plannerSettings = localStorage.getItem('memorizationPlannerSettings');
      if (plannerSettings) {
        const settings = JSON.parse(plannerSettings);
        
        await supabase
          .from('memorization_planner_settings')
          .upsert({
            user_id: user.id,
            lines_per_day: settings.linesPerDay,
            days_of_week: settings.daysOfWeek,
            juz_order: settings.juzOrder,
            start_date: settings.startDate
          });
        console.log('Synced memorization planner settings');
      }

      // Sync custom Juz order
      const customJuzOrder = localStorage.getItem('customJuzOrder');
      if (customJuzOrder) {
        const juzOrder = JSON.parse(customJuzOrder);
        
        await supabase
          .from('custom_orders')
          .upsert({
            user_id: user.id,
            order_type: 'juz',
            custom_order: juzOrder
          });
        console.log('Synced custom Juz order');
      }

      // Sync custom Surah order
      const customSurahOrder = localStorage.getItem('customSurahOrder');
      if (customSurahOrder) {
        const surahOrder = JSON.parse(customSurahOrder);
        
        await supabase
          .from('custom_orders')
          .upsert({
            user_id: user.id,
            order_type: 'surah', 
            custom_order: surahOrder
          });
        console.log('Synced custom Surah order');
      }

      // Sync memorization planner schedule
      const plannerSchedule = localStorage.getItem('memorizationPlannerSchedule');
      if (plannerSchedule) {
        const schedule = JSON.parse(plannerSchedule);
        
        // Clear existing schedule for this user first
        await supabase
          .from('memorization_planner_schedule')
          .delete()
          .eq('user_id', user.id);
        
        // Insert new schedule items
        for (const item of schedule) {
          await supabase
            .from('memorization_planner_schedule')
            .insert({
              user_id: user.id,
              date: item.date,
              task: item.task,
              completed: item.completed,
              page: item.page,
              start_line: item.startLine,
              end_line: item.endLine,
              surah: item.surah,
              is_overdue: item.isOverdue || false,
              is_postponed: item.isPostponed || false,
              postponed_to_date: item.postponedToDate || null
            } as any);
        }
        console.log('Synced memorization planner schedule');
      }

      // Sync memorization planner postponed tasks
      const postponedTasks = localStorage.getItem('memorization-planner-postponed-tasks');
      if (postponedTasks) {
        const tasks = JSON.parse(postponedTasks);
        
        // Update existing schedule items to mark them as postponed
        for (const task of tasks) {
          await supabase
            .from('memorization_planner_schedule')
            .update({
              is_postponed: true,
              postponed_to_date: task.targetDate,
              postponed_from_date: task.postponedFromDate
            } as any)
            .eq('user_id', user.id)
            .eq('date', task.originalDate)
            .eq('page', task.page)
            .eq('start_line', task.startLine)
            .eq('end_line', task.endLine);
        }
        console.log('Synced memorization planner postponed tasks');
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

      // Sync postponed Muraja'ah cycles
      const postponedCycles = localStorage.getItem('murajah-postponed-cycles');
      if (postponedCycles) {
        const cycles = JSON.parse(postponedCycles);
        
        // Clear existing postponed cycles for this user first
        await supabase
          .from('postponed_murajah_cycles')
          .delete()
          .eq('user_id', user.id);
        
        // Insert new postponed cycles
        for (const cycle of cycles) {
          await supabase
            .from('postponed_murajah_cycles')
            .insert({
              user_id: user.id,
              cycle_type: cycle.type,
              title: cycle.title,
              content: cycle.content,
              original_date: cycle.originalDate,
              target_date: cycle.targetDate,
              postponed_from_date: cycle.postponedFromDate
            });
        }
        console.log('Synced postponed Muraja\'ah cycles');
      }

      // Sync murajah daily cycles
      const dailyCompletions = localStorage.getItem('murajah-daily-completions');
      if (dailyCompletions) {
        const completions = JSON.parse(dailyCompletions);
        
        // Clear existing daily cycles for this user first
        await supabase
          .from('murajah_daily_cycles')
          .delete()
          .eq('user_id', user.id);
        
        // Insert daily cycles based on completions
        for (const dayCompletion of completions) {
          for (const [cycleId, completed] of Object.entries(dayCompletion.completions)) {
            // Parse cycle ID to extract type and date
            const [cycleType, dateStr] = cycleId.split('-');
            const isOverdue = cycleId.includes('overdue');
            const isPostponed = cycleId.includes('postponed');
            
            // Generate title and content based on cycle type
            let title = '';
            let content = '';
            
            switch (cycleType.toUpperCase()) {
              case 'RMV':
                title = 'RMV (Recent Memorization Review)';
                content = 'Recent memorization pages';
                break;
              case 'OMV':
                title = 'OMV (Old Memorization Review)';
                content = 'Old memorization review';
                break;
              case 'LISTENING':
                title = 'Listening Cycle';
                content = 'Listening review cycle';
                break;
              case 'READING':
                title = 'Reading Cycle';
                content = 'Reading review cycle';
                break;
              default:
                title = `${cycleType} Cycle`;
                content = `${cycleType} review cycle`;
            }
            
            await supabase
              .from('murajah_daily_cycles')
              .insert({
                user_id: user.id,
                date: dateStr,
                cycle_type: cycleType.toUpperCase(),
                title,
                content,
                completed: completed as boolean,
                is_overdue: isOverdue,
                is_postponed: isPostponed,
                original_date: dateStr
              });
          }
        }
        console.log('Synced murajah daily cycles');
      }

      // Sync journal entries
      const journalEntries = localStorage.getItem('journal-storage');
      if (journalEntries) {
        const parsedData = JSON.parse(journalEntries);
        const entries = parsedData.state?.journals || [];
        
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
              created_at: entry.createdAt,
              updated_at: entry.updatedAt
            });
        }
        console.log('Synced journal entries');
      }

      // Sync Quran notes (handle multiple note keys)
      const allLocalStorageKeys = Object.keys(localStorage);
      const quranNoteKeys = allLocalStorageKeys.filter(key => key.startsWith('quran-notes-'));
      
      if (quranNoteKeys.length > 0) {
        // We'll need to create a new table for Quran notes since it's not in the existing schema
        console.log('Found Quran notes but no table exists yet. Consider creating a quran_notes table.');
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
    if (!user) return;

    try {
      console.log('Loading data from Supabase...');

      // Load memorization planner settings
      const { data: settingsData } = await supabase
        .from('memorization_planner_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsData) {
        const formattedSettings = {
          linesPerDay: settingsData.lines_per_day,
          daysOfWeek: settingsData.days_of_week,
          juzOrder: settingsData.juz_order,
          startDate: settingsData.start_date
        };
        localStorage.setItem('memorizationPlannerSettings', JSON.stringify(formattedSettings));
      }

      // Load custom orders
      const { data: customOrdersData } = await supabase
        .from('custom_orders')
        .select('*')
        .eq('user_id', user.id);

      if (customOrdersData && customOrdersData.length > 0) {
        customOrdersData.forEach(order => {
          if (order.order_type === 'juz') {
            localStorage.setItem('customJuzOrder', JSON.stringify(order.custom_order));
          } else if (order.order_type === 'surah') {
            localStorage.setItem('customSurahOrder', JSON.stringify(order.custom_order));
          }
        });
        console.log('Synced custom orders from cloud');
      }

      // Load memorization planner schedule
      const { data: scheduleData } = await supabase
        .from('memorization_planner_schedule')
        .select('*')
        .eq('user_id', user.id);

      if (scheduleData && scheduleData.length > 0) {
        const formattedSchedule = scheduleData.map(item => ({
          date: item.date,
          task: item.task,
          completed: item.completed,
          page: item.page,
          startLine: item.start_line,
          endLine: item.end_line,
          surah: item.surah,
          isOverdue: (item as any).is_overdue || false,
          isPostponed: (item as any).is_postponed || false,
          postponedToDate: (item as any).postponed_to_date || undefined
        }));
        localStorage.setItem('memorizationPlannerSchedule', JSON.stringify(formattedSchedule));

        // Extract postponed tasks and save them separately
        const postponedTasks = scheduleData
          .filter(item => (item as any).is_postponed)
          .map(item => ({
            date: item.date,
            task: item.task,
            page: item.page,
            startLine: item.start_line,
            endLine: item.end_line,
            surah: item.surah,
            originalDate: item.date,
            targetDate: (item as any).postponed_to_date,
            postponedFromDate: (item as any).postponed_from_date,
            isPostponed: true
          }));

        if (postponedTasks.length > 0) {
          localStorage.setItem('memorization-planner-postponed-tasks', JSON.stringify(postponedTasks));
        }
      }

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

      // Load postponed Muraja'ah cycles
      const { data: postponedCyclesData } = await supabase
        .from('postponed_murajah_cycles')
        .select('*')
        .eq('user_id', user.id);

      if (postponedCyclesData && postponedCyclesData.length > 0) {
        const formattedPostponedCycles = postponedCyclesData.map(cycle => ({
          type: cycle.cycle_type,
          title: cycle.title,
          content: cycle.content,
          originalDate: cycle.original_date,
          targetDate: cycle.target_date,
          postponedFromDate: cycle.postponed_from_date,
          isPostponed: true
        }));
        localStorage.setItem('murajah-postponed-cycles', JSON.stringify(formattedPostponedCycles));
      }

      // Load murajah daily cycles
      const { data: dailyCyclesData } = await supabase
        .from('murajah_daily_cycles')
        .select('*')
        .eq('user_id', user.id);

      if (dailyCyclesData && dailyCyclesData.length > 0) {
        // Convert to the format expected by the local storage
        const groupedByDate = dailyCyclesData.reduce((acc, cycle) => {
          const dateStr = cycle.date;
          if (!acc[dateStr]) {
            acc[dateStr] = {};
          }
          
          // Create cycle ID in the format expected by the app
          let cycleId = `${cycle.cycle_type.toLowerCase()}-${dateStr}`;
          if (cycle.is_overdue) cycleId += '-overdue';
          if (cycle.is_postponed) cycleId += '-postponed';
          
          acc[dateStr][cycleId] = cycle.completed;
          return acc;
        }, {} as { [date: string]: { [cycleId: string]: boolean } });

        const formattedDailyCompletions = Object.entries(groupedByDate).map(([date, completions]) => ({
          date,
          completions
        }));

        localStorage.setItem('murajah-daily-completions', JSON.stringify(formattedDailyCompletions));
        console.log('Loaded murajah daily cycles from cloud');
      }

      // Load journal entries
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id);

      if (journalData && journalData.length > 0) {
        const formattedJournalData = {
          state: {
            journals: journalData.map(entry => ({
              id: entry.id,
              title: entry.title,
              description: entry.description,
              content: entry.content,
              tags: entry.tags,
              createdAt: entry.created_at,
              updatedAt: entry.updated_at
            }))
          },
          version: 0
        };
        localStorage.setItem('journal-storage', JSON.stringify(formattedJournalData));
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
    if (!user) return;

    try {
      console.log('Clearing data from Supabase...');

      // Clear custom orders
      await supabase
        .from('custom_orders')
        .delete()
        .eq('user_id', user.id);

      // Clear journal entries
      await supabase
        .from('journal_entries')
        .delete()
        .eq('user_id', user.id);

      // Clear juz memorization
      await supabase
        .from('juz_memorization')
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

      // Clear postponed Muraja'ah cycles
      await supabase
        .from('postponed_murajah_cycles')
        .delete()
        .eq('user_id', user.id);

      // Clear daily murajah cycles
      await supabase
        .from('murajah_daily_cycles')
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

  const clearLocalData = () => {
    try {
      console.log('Clearing all local data...');

      // Clear memorization planner settings
      localStorage.removeItem('memorizationPlannerSettings');
      
      // Clear memorization planner schedule
      localStorage.removeItem('memorizationPlannerSchedule');
      
      // Clear memorization planner postponed tasks
      localStorage.removeItem('memorization-planner-postponed-tasks');
      
      // Clear juz memorization data
      localStorage.removeItem('murajah-juz-memorization');
      
      // Clear postponed cycles
      localStorage.removeItem('murajah-postponed-cycles');
      
      // Clear daily completions
      localStorage.removeItem('murajah-daily-completions');
      
      // Clear journal entries
      localStorage.removeItem('journal-storage');
      
      // Clear custom orders
      localStorage.removeItem('customJuzOrder');
      localStorage.removeItem('customSurahOrder');
      
      // Clear Quran notes (handle multiple note keys)
      const allLocalStorageKeys = Object.keys(localStorage);
      const quranNoteKeys = allLocalStorageKeys.filter(key => key.startsWith('quran-notes-'));
      quranNoteKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear any other app-related data
      const appDataKeys = allLocalStorageKeys.filter(key => 
        key.startsWith('memorization') || 
        key.startsWith('murajah') || 
        key.startsWith('journal') ||
        key.startsWith('quran')
      );
      appDataKeys.forEach(key => localStorage.removeItem(key));

      console.log('Cleared all local data');

      toast({
        title: "Local data cleared",
        description: "All your local data has been cleared. Page will refresh.",
      });

      // Refresh the page to show the cleared state
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error clearing local data:', error);
      toast({
        title: "Clear error",
        description: "There was an error clearing your local data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    syncLocalDataToSupabase,
    loadDataFromSupabase,
    clearSupabaseData,
    clearLocalData
  };
};
