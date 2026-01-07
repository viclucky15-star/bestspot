import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessAccount } from './useBusinessAccount';

export interface AnalyticsData {
  id: string;
  business_id: string;
  location_id: string;
  date: string;
  views: number;
  favorites: number;
  planned_visits: number;
  clicks_to_maps: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalFavorites: number;
  totalPlannedVisits: number;
  totalMapClicks: number;
  viewsTrend: number;
  favoritesTrend: number;
}

export function useBusinessAnalytics(dateRange?: { start: string; end: string }) {
  const { businessAccount } = useBusinessAccount();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['businessAnalytics', businessAccount?.id, dateRange],
    queryFn: async () => {
      if (!businessAccount?.id) return [];

      let query = supabase
        .from('business_analytics')
        .select('*')
        .eq('business_id', businessAccount.id)
        .order('date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AnalyticsData[];
    },
    enabled: !!businessAccount?.id,
  });

  const summary: AnalyticsSummary = {
    totalViews: analytics?.reduce((sum, a) => sum + a.views, 0) || 0,
    totalFavorites: analytics?.reduce((sum, a) => sum + a.favorites, 0) || 0,
    totalPlannedVisits: analytics?.reduce((sum, a) => sum + a.planned_visits, 0) || 0,
    totalMapClicks: analytics?.reduce((sum, a) => sum + a.clicks_to_maps, 0) || 0,
    viewsTrend: 0, // Calculate based on previous period
    favoritesTrend: 0,
  };

  return {
    analytics,
    summary,
    isLoading,
  };
}
