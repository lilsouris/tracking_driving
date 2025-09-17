-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trajets table
CREATE TABLE IF NOT EXISTS trajets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  distance_km DECIMAL(10,2) DEFAULT 0,
  manoeuvres INTEGER DEFAULT 0,
  city_percentage INTEGER DEFAULT 0,
  route_type TEXT CHECK (route_type IN ('city', 'highway', 'mixed')) DEFAULT 'mixed',
  is_night BOOLEAN DEFAULT FALSE,
  gps_trace JSONB, -- Store GPS coordinates as JSON array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trajets_user_id ON trajets(user_id);
CREATE INDEX IF NOT EXISTS idx_trajets_start_time ON trajets(start_time);
CREATE INDEX IF NOT EXISTS idx_trajets_user_start_time ON trajets(user_id, start_time);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for trajets table
CREATE POLICY "Users can view own trajets" ON trajets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trajets" ON trajets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trajets" ON trajets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trajets" ON trajets
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trajets_updated_at
  BEFORE UPDATE ON trajets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate duration automatically
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duration calculation
CREATE TRIGGER calculate_trajet_duration
  BEFORE INSERT OR UPDATE ON trajets
  FOR EACH ROW EXECUTE FUNCTION calculate_duration();

-- Create function to determine if it's night time
CREATE OR REPLACE FUNCTION determine_is_night()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL THEN
    NEW.is_night = EXTRACT(HOUR FROM NEW.start_time) < 6 OR EXTRACT(HOUR FROM NEW.start_time) > 18;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for night time detection
CREATE TRIGGER determine_trajet_is_night
  BEFORE INSERT OR UPDATE ON trajets
  FOR EACH ROW EXECUTE FUNCTION determine_is_night();
