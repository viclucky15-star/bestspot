-- Add state and city fields to locations table
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'Enugu';

-- Update existing locations to have Enugu as state (they're already Enugu locations)
UPDATE public.locations SET state = 'Enugu' WHERE state IS NULL OR state = '';

-- Add city column (rename area conceptually, but keep area for backward compatibility)
-- The 'area' column will now represent city/area within a state

-- Add state field to community_posts for state-grouped posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS state text;

-- Add state field to planned_events for state-aware events
ALTER TABLE public.planned_events 
ADD COLUMN IF NOT EXISTS state text;

-- Create index for faster state-based filtering
CREATE INDEX IF NOT EXISTS idx_locations_state ON public.locations(state);
CREATE INDEX IF NOT EXISTS idx_community_posts_state ON public.community_posts(state);
CREATE INDEX IF NOT EXISTS idx_planned_events_state ON public.planned_events(state);