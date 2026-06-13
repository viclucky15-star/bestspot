import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Video, Map, Users, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { ServiceProviderType, SERVICE_PROVIDER_LABELS, NIGERIAN_STATES } from '@/types/serviceProvider';

const providerTypes: { value: ServiceProviderType | 'all'; label: string; icon: typeof Camera }[] = [
  { value: 'all', label: 'All Services', icon: Users },
  { value: 'photographer', label: 'Photographers', icon: Camera },
  { value: 'cinematographer', label: 'Cinematographers', icon: Video },
  { value: 'tour_guide', label: 'Tour Guides', icon: Map },
  { value: 'event_planner', label: 'Event Planners', icon: Calendar },
];

const ServiceProviders = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ServiceProviderType | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: providers, isLoading } = useServiceProviders({
    providerType: selectedType,
    state: selectedState,
  });

  const filteredProviders = providers?.filter((provider) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      provider.full_name.toLowerCase().includes(query) ||
      provider.state.toLowerCase().includes(query) ||
      (provider.area?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Service Providers</h1>
              <p className="text-sm text-muted-foreground">
                Find photographers, cinematographers & tour guides
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {providerTypes.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={selectedType === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(value)}
                className="flex-shrink-0"
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          {/* State Filter */}
          <div className="mt-3">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {NIGERIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProviders && filteredProviders.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
            </p>
            {filteredProviders.map((provider) => (
              <ServiceProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No providers found</h3>
            <p className="text-muted-foreground text-sm">
              {selectedType !== 'all' || selectedState !== 'all'
                ? 'Try adjusting your filters'
                : 'Service providers will appear here once approved'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProviders;
