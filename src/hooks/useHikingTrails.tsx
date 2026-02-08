import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HikingTrail, GpsPoint, Waypoint, TrailEndpoint } from '@/types/trails';

// Helper to parse JSON fields from database
const parseTrail = (data: any): HikingTrail => ({
  ...data,
  gps_path: (data.gps_path as GpsPoint[]) || [],
  waypoints: (data.waypoints as Waypoint[]) || [],
  start_point: data.start_point as TrailEndpoint | null,
  end_point: data.end_point as TrailEndpoint | null,
});

export function useHikingTrails(locationId?: string) {
  const [trails, setTrails] = useState<HikingTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrails = useCallback(async () => {
    if (!locationId) {
      setTrails([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .from('hiking_trails')
        .select('*')
        .eq('location_id', locationId)
        .order('difficulty', { ascending: true });

      if (queryError) throw queryError;

      setTrails((data || []).map(parseTrail));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchTrails();
  }, [fetchTrails]);

  return { trails, loading, error, refetch: fetchTrails };
}

export function useTrail(trailId?: string) {
  const [trail, setTrail] = useState<HikingTrail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!trailId) {
      setLoading(false);
      return;
    }

    const fetchTrail = async () => {
      setLoading(true);
      try {
        const { data, error: queryError } = await supabase
          .from('hiking_trails')
          .select('*')
          .eq('id', trailId)
          .single();

        if (queryError) throw queryError;

        setTrail(parseTrail(data));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrail();
  }, [trailId]);

  return { trail, loading, error };
}

export function useSavedTrails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedTrailIds, setSavedTrailIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedTrailIds(new Set());
      return;
    }

    const fetchSaved = async () => {
      const { data } = await supabase
        .from('user_saved_trails')
        .select('trail_id')
        .eq('user_id', user.id);

      if (data) {
        setSavedTrailIds(new Set(data.map(d => d.trail_id)));
      }
    };

    fetchSaved();
  }, [user]);

  const toggleSaveTrail = useCallback(async (trailId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save trails',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const isSaved = savedTrailIds.has(trailId);

    try {
      if (isSaved) {
        await supabase
          .from('user_saved_trails')
          .delete()
          .eq('user_id', user.id)
          .eq('trail_id', trailId);
        
        setSavedTrailIds(prev => {
          const next = new Set(prev);
          next.delete(trailId);
          return next;
        });
        toast({ title: 'Trail removed from saved' });
      } else {
        await supabase
          .from('user_saved_trails')
          .insert({ user_id: user.id, trail_id: trailId });
        
        setSavedTrailIds(prev => new Set(prev).add(trailId));
        toast({ title: 'Trail saved!' });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update saved trails',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, savedTrailIds, toast]);

  const isTrailSaved = useCallback((trailId: string) => {
    return savedTrailIds.has(trailId);
  }, [savedTrailIds]);

  return { savedTrailIds, toggleSaveTrail, isTrailSaved, loading };
}
