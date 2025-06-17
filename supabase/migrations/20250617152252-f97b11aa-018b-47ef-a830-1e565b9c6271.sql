
-- Create a table for custom orders (both Juz and Surah)
CREATE TABLE public.custom_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('juz', 'surah')),
  custom_order INTEGER[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own custom orders" 
  ON public.custom_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom orders" 
  ON public.custom_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom orders" 
  ON public.custom_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom orders" 
  ON public.custom_orders 
  FOR DELETE 
  USING (auth.uid() = user_id);
