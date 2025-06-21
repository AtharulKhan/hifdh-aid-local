
-- Add date_memorized column to juz_memorization table if it doesn't exist
ALTER TABLE public.juz_memorization 
ADD COLUMN IF NOT EXISTS date_memorized DATE;

-- Update the column to allow storing just the date (not timestamp)
-- This will make it easier to work with date pickers
