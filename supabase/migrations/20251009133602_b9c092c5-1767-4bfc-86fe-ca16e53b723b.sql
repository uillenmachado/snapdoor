-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create pipelines table
CREATE TABLE public.pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pipelines"
  ON public.pipelines FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own pipelines"
  ON public.pipelines FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pipelines"
  ON public.pipelines FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own pipelines"
  ON public.pipelines FOR DELETE
  USING (user_id = auth.uid());

-- Create stages table
CREATE TABLE public.stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B46F2',
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stages of their pipelines"
  ON public.stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = stages.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stages in their pipelines"
  ON public.stages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stages in their pipelines"
  ON public.stages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = stages.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stages in their pipelines"
  ON public.stages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = stages.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (user_id = auth.uid());

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes on their leads"
  ON public.notes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create notes on their leads"
  ON public.notes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their notes"
  ON public.notes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their notes"
  ON public.notes FOR DELETE
  USING (user_id = auth.uid());

-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'email', 'call', 'meeting', 'comment')),
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities on their leads"
  ON public.activities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create activities on their leads"
  ON public.activities FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their activities"
  ON public.activities FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their activities"
  ON public.activities FOR DELETE
  USING (user_id = auth.uid());

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();