
-- Create a table for storing daily murajah review cycles
CREATE TABLE public.murajah_daily_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  cycle_type TEXT NOT NULL, -- 'RMV', 'OMV', 'Listening', 'Reading'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  is_overdue BOOLEAN NOT NULL DEFAULT false,
  is_postponed BOOLEAN NOT NULL DEFAULT false,
  postponed_to_date DATE,
  original_date DATE, -- for tracking when a cycle was originally scheduled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, cycle_type)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.murajah_daily_cycles ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own murajah cycles" 
  ON public.murajah_daily_cycles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own murajah cycles" 
  ON public.murajah_daily_cycles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own murajah cycles" 
  ON public.murajah_daily_cycles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own murajah cycles" 
  ON public.murajah_daily_cycles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_murajah_daily_cycles_updated_at
  BEFORE UPDATE ON public.murajah_daily_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();
