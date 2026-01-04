import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Favorite, Location } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          location:locations(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const favs = data as (Favorite & { location: Location })[];
      setFavorites(favs);
      setFavoriteIds(new Set(favs.map(f => f.location_id)));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (locationId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    const isFavorited = favoriteIds.has(locationId);

    try {
      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('location_id', locationId);

        if (error) throw error;

        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
        setFavorites(prev => prev.filter(f => f.location_id !== locationId));

        toast({
          title: "Removed from favorites",
          description: "Location removed from your favorites",
        });
      } else {
        // Add favorite
        const { data, error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, location_id: locationId })
          .select(`
            *,
            location:locations(*)
          `)
          .single();

        if (error) throw error;

        const fav = data as Favorite & { location: Location };
        setFavoriteIds(prev => new Set([...prev, locationId]));
        setFavorites(prev => [fav, ...prev]);

        toast({
          title: "Added to favorites",
          description: "Location saved to your favorites ❤️",
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (locationId: string) => favoriteIds.has(locationId);

  return { favorites, loading, toggleFavorite, isFavorite, refetch: fetchFavorites };
}
