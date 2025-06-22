
-- Add postponement columns to memorization_planner_schedule table
ALTER TABLE public.memorization_planner_schedule 
ADD COLUMN is_postponed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN postponed_to_date DATE,
ADD COLUMN postponed_from_date DATE;
