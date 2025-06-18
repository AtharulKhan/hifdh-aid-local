
-- Create weak_spots table
CREATE TABLE public.weak_spots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'weak' CHECK (status IN ('weak', 'mastered')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, surah_number, ayah_number)
);

-- Enable Row Level Security
ALTER TABLE public.weak_spots ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Allow users to SELECT their own weak spots"
ON public.weak_spots
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to INSERT weak spots for themselves"
ON public.weak_spots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to UPDATE their own weak spots"
ON public.weak_spots
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to DELETE their own weak spots"
ON public.weak_spots
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.weak_spots
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
