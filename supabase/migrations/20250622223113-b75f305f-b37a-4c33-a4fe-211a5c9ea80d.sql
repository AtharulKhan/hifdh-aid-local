
-- Create a table for postponed muraja'ah cycles
CREATE TABLE public.postponed_murajah_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cycle_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  original_date DATE NOT NULL,
  target_date DATE NOT NULL,
  postponed_from_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own postponed cycles
ALTER TABLE public.postponed_murajah_cycles ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own postponed cycles
CREATE POLICY "Users can view their own postponed cycles" 
  ON public.postponed_murajah_cycles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own postponed cycles
CREATE POLICY "Users can create their own postponed cycles" 
  ON public.postponed_murajah_cycles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own postponed cycles
CREATE POLICY "Users can update their own postponed cycles" 
  ON public.postponed_murajah_cycles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own postponed cycles
CREATE POLICY "Users can delete their own postponed cycles" 
  ON public.postponed_murajah_cycles 
  FOR DELETE 
  USING (auth.uid() = user_id);
