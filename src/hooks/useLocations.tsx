import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Location, FilterOptions } from '@/types';

export function useLocations(filters?: FilterOptions) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('locations')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.budgetLevel && filters.budgetLevel !== 'all') {
        query = query.eq('budget_level', filters.budgetLevel);
      }

      if (filters?.area && filters.area !== 'all') {
        query = query.eq('area', filters.area);
      }

      if (filters?.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,area.ilike.%${filters.searchQuery}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setLocations((data as Location[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.budgetLevel, filters?.area, filters?.searchQuery]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, loading, error, refetch: fetchLocations };
}

export function useLocation(id: string | undefined) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchLocation = async () => {
      setLoading(true);
      try {
        const { data, error: queryError } = await supabase
          .from('locations')
          .select('*')
          .eq('id', id)
          .single();

        if (queryError) throw queryError;

        setLocation(data as Location);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  return { location, loading, error };
}

export function useFeaturedLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(6);

      setLocations((data as Location[]) || []);
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  return { locations, loading };
}

export function useAreas() {
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    const fetchAreas = async () => {
      const { data } = await supabase
        .from('locations')
        .select('area');

      if (data) {
        const uniqueAreas = [...new Set(data.map(d => d.area))].sort();
        setAreas(uniqueAreas);
      }
    };

    fetchAreas();
  }, []);

  return areas;
}
