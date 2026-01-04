import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocations, useAreas } from '@/hooks/useLocations';
import { useFavorites } from '@/hooks/useFavorites';
import { LocationCard } from '@/components/LocationCard';
import { FilterBar } from '@/components/FilterBar';
import { FilterOptions, Category } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as Category | null;
  
  const [filters, setFilters] = useState<FilterOptions>({
    category: initialCategory || 'all',
    budgetLevel: 'all',
    area: 'all',
    searchQuery: '',
  });

  const { locations, loading } = useLocations(filters);
  const { toggleFavorite, isFavorite } = useFavorites();
  const areas = useAreas();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b px-4 py-4">
        <h1 className="font-display text-2xl font-bold mb-4">Explore Enugu</h1>
        <FilterBar filters={filters} onFiltersChange={setFilters} areas={areas} />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-72 rounded-xl" />))}
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="font-display text-lg font-semibold mb-2">No locations found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">{locations.length} places found</p>
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isFavorite={isFavorite(location.id)}
                onToggleFavorite={() => toggleFavorite(location.id)}
                onClick={() => navigate(`/location/${location.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
