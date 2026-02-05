import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedLocations } from '@/hooks/useLocations';
import { useFavorites } from '@/hooks/useFavorites';
import { useStateSelection, STATES } from '@/hooks/useStateSelection';
import { useUserRole } from '@/hooks/useUserRole';
import { LocationCard } from '@/components/LocationCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { MainMenu } from '@/components/MainMenu';
import { StateSelector } from '@/components/StateSelector';
import { PremiumGate } from '@/components/PremiumGate';
import { HeroSlideshow } from '@/components/HeroSlideshow';

const Index = () => {
  const navigate = useNavigate();
  const {
    selectedState,
    stateInfo
  } = useStateSelection();
  const {
    locations: featured,
    loading
  } = useFeaturedLocations(selectedState);
  const {
    toggleFavorite,
    isFavorite
  } = useFavorites();
  const {
    isBusiness
  } = useUserRole();
  return <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden px-4 pt-4">
        {/* Slideshow with rounded corners */}
        <div className="relative h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
          <HeroSlideshow />

          {/* Top bar with menu and logo */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <MainMenu />
              <span className="font-display font-bold text-foreground drop-shadow-lg">Surespot</span>
            </div>
            <StateSelector compact />
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
            <h1 className="font-display text-3xl md:text-4xl drop-shadow-lg text-primary-foreground font-medium">
              Discover Your Surespot
            </h1>

            <div className="flex gap-3 justify-center flex-wrap mt-4">
              <Button onClick={() => navigate('/states')} variant="outline" className="gap-2 shadow-lg backdrop-blur-sm">
                 Browse States
              </Button>
              <Button onClick={() => navigate('/explore')} className="gap-2 shadow-lg">
                <MapPin className="w-4 h-4" /> Explore Places
              </Button>
            </div>

            {/* Business Dashboard Button - Only visible to business owners */}
            {isBusiness && <div className="mt-4">
                <Button onClick={() => navigate('/business/dashboard')} variant="secondary" className="gap-2 shadow-lg">
                  <Building2 className="w-4 h-4" /> Dashboard Panel
                </Button>
              </div>}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* State Quick Access */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Quick Access</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {STATES.map(state => <button key={state.name} onClick={() => navigate(`/explore?state=${state.name}`)} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedState === state.name ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                <span>{state.icon}</span>
                <span className="text-sm font-medium">{state.name}</span>
              </button>)}
          </div>
        </div>

        {/* Weather Widget - Premium Feature */}
        <PremiumGate feature="weather">
          <WeatherWidget />
        </PremiumGate>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[{
          icon: '💕',
          label: 'Romantic',
          category: 'romantic'
        }, {
          icon: '🧺',
          label: 'Picnic',
          category: 'picnic'
        }, {
          icon: '🎉',
          label: 'Events',
          category: 'event'
        }, {
          icon: '🥾',
          label: 'Hiking',
          category: 'hiking'
        }].map(item => <button key={item.category} onClick={() => navigate(`/explore?category=${item.category}`)} className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:shadow-md transition-shadow">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>)}
        </div>

        {/* Featured Locations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">
              Featured Places {selectedState && `in ${selectedState}`}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/explore')}>See all</Button>
          </div>
          
        {loading ? <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
            </div> : featured.length === 0 ? <div className="text-center py-8 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground">No featured places {selectedState && `in ${selectedState}`} yet</p>
              <Button variant="link" onClick={() => navigate('/explore')}>Explore all locations</Button>
            </div> : <div className="grid grid-cols-2 gap-3">
              {featured.slice(0, 6).map(location => <LocationCard key={location.id} location={location} isFavorite={isFavorite(location.id)} onToggleFavorite={() => toggleFavorite(location.id)} onClick={() => navigate(`/location/${location.id}`)} compact />)}
            </div>}
        </div>

        {/* Community CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/20 rounded-2xl p-6 text-center">
          <Users className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold mb-2">Join Our Community</h3>
          <p className="text-sm text-muted-foreground mb-4">Share your favorite spots and discover hidden gems from others</p>
          <Button variant="outline" onClick={() => navigate('/community')}>Explore Community</Button>
        </div>
      </div>
    </div>;
};
export default Index;