
-- Add is_overdue column to memorization_planner_schedule table
ALTER TABLE public.memorization_planner_schedule 
ADD COLUMN is_overdue BOOLEAN NOT NULL DEFAULT FALSE;
