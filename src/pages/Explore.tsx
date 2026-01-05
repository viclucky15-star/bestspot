import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocations, useAreas } from '@/hooks/useLocations';
import { useFavorites } from '@/hooks/useFavorites';
import { useStateSelection } from '@/hooks/useStateSelection';
import { LocationCardCompact } from '@/components/LocationCardCompact';
import { FilterBar } from '@/components/FilterBar';
import { StateSelector } from '@/components/StateSelector';
import { FilterOptions, Category, NigerianState } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Heart, Mountain, Calendar, Sparkles, MapPin } from 'lucide-react';

const categoryInfo: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  romantic: { label: 'Romantic', icon: <Heart className="w-4 h-4" />, color: 'text-romantic' },
  picnic: { label: 'Picnic', icon: <Sparkles className="w-4 h-4" />, color: 'text-picnic' },
  hiking: { label: 'Hiking & Outdoor', icon: <Mountain className="w-4 h-4" />, color: 'text-hiking' },
  event: { label: 'Events & Hangouts', icon: <Calendar className="w-4 h-4" />, color: 'text-event' },
};

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as Category | null;
  const initialState = searchParams.get('state') as NigerianState | null;
  
  const { selectedState } = useStateSelection();
  
  const [filters, setFilters] = useState<FilterOptions>({
    category: initialCategory || 'all',
    budgetLevel: 'all',
    area: 'all',
    state: initialState || selectedState || 'all',
    searchQuery: '',
  });

  // Update filters when selected state changes from context
  useEffect(() => {
    if (selectedState && filters.state === 'all') {
      setFilters(prev => ({ ...prev, state: selectedState }));
    }
  }, [selectedState]);

  const { locations, loading } = useLocations(filters);
  const { toggleFavorite, isFavorite } = useFavorites();
  const areas = useAreas(filters.state !== 'all' ? filters.state : null);

  // Group locations by category
  const groupedLocations = locations.reduce((acc, location) => {
    const category = location.category as Category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(location);
    return acc;
  }, {} as Record<Category, typeof locations>);

  // Order categories
  const categoryOrder: Category[] = ['picnic', 'romantic', 'hiking', 'event'];
  const orderedCategories = categoryOrder.filter(cat => groupedLocations[cat]?.length > 0);

  const getTitle = () => {
    if (filters.state !== 'all') {
      return `Explore ${filters.state}`;
    }
    return 'Explore South-East Nigeria';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">{getTitle()}</h1>
          <StateSelector compact />
        </div>
        <FilterBar 
          filters={filters} 
          onFiltersChange={setFilters} 
          areas={areas}
          showStateFilter={true}
        />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="font-display text-lg font-semibold mb-2">No locations found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or selecting a different state</p>
          </div>
        ) : filters.category !== 'all' ? (
          // Show flat grid when filtering by category
          <>
            <p className="text-sm text-muted-foreground mb-4">{locations.length} places found</p>
            <div className="grid grid-cols-2 gap-3">
              {locations.map((location) => (
                <LocationCardCompact
                  key={location.id}
                  location={location}
                  isFavorite={isFavorite(location.id)}
                  onToggleFavorite={() => toggleFavorite(location.id)}
                  onClick={() => navigate(`/location/${location.id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          // Show grouped by category when showing all
          <div className="space-y-8">
            <p className="text-sm text-muted-foreground">{locations.length} places found</p>
            {orderedCategories.map((category) => {
              const info = categoryInfo[category];
              const categoryLocations = groupedLocations[category];
              
              return (
                <div key={category}>
                  <div className={`flex items-center gap-2 mb-4 ${info.color}`}>
                    {info.icon}
                    <h2 className="font-display font-semibold text-lg">{info.label}</h2>
                    <span className="text-xs text-muted-foreground">({categoryLocations.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryLocations.map((location) => (
                      <LocationCardCompact
                        key={location.id}
                        location={location}
                        isFavorite={isFavorite(location.id)}
                        onToggleFavorite={() => toggleFavorite(location.id)}
                        onClick={() => navigate(`/location/${location.id}`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
