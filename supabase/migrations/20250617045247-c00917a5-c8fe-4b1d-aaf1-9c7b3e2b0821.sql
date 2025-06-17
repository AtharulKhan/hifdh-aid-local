
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table to store memorization planner settings
CREATE TABLE public.memorization_planner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lines_per_day INTEGER NOT NULL DEFAULT 15,
  days_of_week TEXT[] NOT NULL DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  juz_order TEXT NOT NULL DEFAULT 'sequential',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table to store memorization planner schedule
CREATE TABLE public.memorization_planner_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  task TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  page INTEGER NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  surah TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table to store juz memorization data
CREATE TABLE public.juz_memorization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  juz_number INTEGER NOT NULL,
  is_memorized BOOLEAN NOT NULL DEFAULT FALSE,
  date_memorized TIMESTAMP WITH TIME ZONE,
  start_page INTEGER,
  end_page INTEGER,
  memorized_surahs INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, juz_number)
);

-- Create table to store journal entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorization_planner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorization_planner_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juz_memorization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for memorization planner settings
CREATE POLICY "Users can view their own planner settings" ON public.memorization_planner_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own planner settings" ON public.memorization_planner_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own planner settings" ON public.memorization_planner_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own planner settings" ON public.memorization_planner_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for memorization planner schedule
CREATE POLICY "Users can view their own planner schedule" ON public.memorization_planner_schedule
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own planner schedule" ON public.memorization_planner_schedule
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own planner schedule" ON public.memorization_planner_schedule
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own planner schedule" ON public.memorization_planner_schedule
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for juz memorization
CREATE POLICY "Users can view their own juz memorization" ON public.juz_memorization
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own juz memorization" ON public.juz_memorization
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own juz memorization" ON public.juz_memorization
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own juz memorization" ON public.juz_memorization
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for journal entries
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
