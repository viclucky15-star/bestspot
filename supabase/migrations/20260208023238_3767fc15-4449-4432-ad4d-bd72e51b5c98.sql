-- Create hiking_trails table
CREATE TABLE public.hiking_trails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  distance_km NUMERIC NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  elevation_gain_meters INTEGER DEFAULT 0,
  trail_type TEXT NOT NULL CHECK (trail_type IN ('loop', 'out_and_back', 'point_to_point')),
  gps_path JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_point JSONB,
  end_point JSONB,
  waypoints JSONB DEFAULT '[]'::jsonb,
  safety_notes TEXT,
  highlights TEXT[],
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_saved_trails table for favorites
CREATE TABLE public.user_saved_trails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trail_id UUID NOT NULL REFERENCES public.hiking_trails(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, trail_id)
);

-- Enable RLS
ALTER TABLE public.hiking_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_trails ENABLE ROW LEVEL SECURITY;

-- Trails are viewable by everyone
CREATE POLICY "Trails are viewable by everyone"
ON public.hiking_trails
FOR SELECT
USING (true);

-- Admins can manage trails
CREATE POLICY "Admins can manage trails"
ON public.hiking_trails
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view own saved trails
CREATE POLICY "Users can view own saved trails"
ON public.user_saved_trails
FOR SELECT
USING (auth.uid() = user_id);

-- Users can save trails
CREATE POLICY "Users can save trails"
ON public.user_saved_trails
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove saved trails
CREATE POLICY "Users can remove saved trails"
ON public.user_saved_trails
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_hiking_trails_updated_at
BEFORE UPDATE ON public.hiking_trails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample trails for hiking locations
INSERT INTO public.hiking_trails (location_id, name, distance_km, estimated_duration_minutes, difficulty, elevation_gain_meters, trail_type, gps_path, start_point, end_point, waypoints, safety_notes, highlights)
SELECT 
  l.id,
  'Summit Trail',
  3.5,
  120,
  'moderate',
  250,
  'out_and_back',
  '[
    {"lat": 6.4541, "lng": 7.5134},
    {"lat": 6.4545, "lng": 7.5140},
    {"lat": 6.4552, "lng": 7.5148},
    {"lat": 6.4560, "lng": 7.5155},
    {"lat": 6.4568, "lng": 7.5162},
    {"lat": 6.4575, "lng": 7.5170}
  ]'::jsonb,
  '{"lat": 6.4541, "lng": 7.5134, "name": "Trailhead"}'::jsonb,
  '{"lat": 6.4575, "lng": 7.5170, "name": "Summit Viewpoint"}'::jsonb,
  '[
    {"lat": 6.4552, "lng": 7.5148, "type": "viewpoint", "name": "Valley Overlook"},
    {"lat": 6.4560, "lng": 7.5155, "type": "rest", "name": "Rest Area"}
  ]'::jsonb,
  'Bring plenty of water. Trail can be slippery after rain. Best hiked in early morning.',
  ARRAY['Panoramic views', 'Wildlife spotting', 'Photography spots']
FROM public.locations l
WHERE l.category = 'hiking'
LIMIT 1;

INSERT INTO public.hiking_trails (location_id, name, distance_km, estimated_duration_minutes, difficulty, elevation_gain_meters, trail_type, gps_path, start_point, end_point, waypoints, safety_notes, highlights)
SELECT 
  l.id,
  'Nature Loop',
  2.0,
  60,
  'easy',
  50,
  'loop',
  '[
    {"lat": 6.4541, "lng": 7.5134},
    {"lat": 6.4538, "lng": 7.5142},
    {"lat": 6.4535, "lng": 7.5150},
    {"lat": 6.4538, "lng": 7.5158},
    {"lat": 6.4541, "lng": 7.5150},
    {"lat": 6.4541, "lng": 7.5134}
  ]'::jsonb,
  '{"lat": 6.4541, "lng": 7.5134, "name": "Main Entrance"}'::jsonb,
  '{"lat": 6.4541, "lng": 7.5134, "name": "Main Entrance"}'::jsonb,
  '[
    {"lat": 6.4535, "lng": 7.5150, "type": "water", "name": "Stream Crossing"}
  ]'::jsonb,
  'Family-friendly trail. Watch for roots on the path.',
  ARRAY['Forest bathing', 'Bird watching', 'Easy terrain']
FROM public.locations l
WHERE l.category = 'hiking'
LIMIT 1;

INSERT INTO public.hiking_trails (location_id, name, distance_km, estimated_duration_minutes, difficulty, elevation_gain_meters, trail_type, gps_path, start_point, end_point, waypoints, safety_notes, highlights)
SELECT 
  l.id,
  'Ridge Challenge',
  5.8,
  180,
  'hard',
  450,
  'point_to_point',
  '[
    {"lat": 6.4541, "lng": 7.5134},
    {"lat": 6.4550, "lng": 7.5145},
    {"lat": 6.4562, "lng": 7.5160},
    {"lat": 6.4575, "lng": 7.5175},
    {"lat": 6.4590, "lng": 7.5190},
    {"lat": 6.4605, "lng": 7.5205}
  ]'::jsonb,
  '{"lat": 6.4541, "lng": 7.5134, "name": "Base Camp"}'::jsonb,
  '{"lat": 6.4605, "lng": 7.5205, "name": "Ridge End"}'::jsonb,
  '[
    {"lat": 6.4562, "lng": 7.5160, "type": "viewpoint", "name": "Eagle Point"},
    {"lat": 6.4575, "lng": 7.5175, "type": "rest", "name": "Midway Shelter"},
    {"lat": 6.4590, "lng": 7.5190, "type": "water", "name": "Spring Water"}
  ]'::jsonb,
  'Experienced hikers only. Carry emergency supplies. Check weather before departure.',
  ARRAY['Challenging terrain', 'Stunning ridge views', 'Adventure experience']
FROM public.locations l
WHERE l.category = 'hiking'
LIMIT 1;