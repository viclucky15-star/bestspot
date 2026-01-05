import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useFeaturedLocations } from '@/hooks/useLocations';
import { useFavorites } from '@/hooks/useFavorites';
import { LocationCard } from '@/components/LocationCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';
import heroImage from '@/assets/hero-picnic.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { locations: featured, loading } = useFeaturedLocations();
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Couple enjoying scenic view of Enugu" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        <div className="relative px-4 pt-12 pb-16">
          {/* Top bar with theme toggle, notifications, and auth */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            {!user ? (
              <Button variant="secondary" size="sm" onClick={() => navigate('/auth')} className="backdrop-blur-sm">
                Sign In
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="bg-background/50 backdrop-blur-sm">
                <Heart className="w-5 h-5 text-primary" />
              </Button>
            )}
          </div>
          
          <div className="max-w-lg mx-auto text-center pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">BestSpot</span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 text-foreground drop-shadow-lg">
              Discover Your <span className="text-gradient">Perfect Spot</span>
            </h1>
            
            <p className="text-foreground/90 mb-6 drop-shadow-md">
              Romantic spots, picnic areas, hiking trails & events in Enugu State
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => navigate('/explore')} className="gap-2 shadow-lg">
                <MapPin className="w-4 h-4" /> Explore Places
              </Button>
              <Button variant="secondary" onClick={() => navigate('/planner')} className="gap-2 shadow-lg backdrop-blur-sm">
                <Calendar className="w-4 h-4" /> Plan a Date
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-8">
        {/* Weather Widget */}
        <WeatherWidget />

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '💕', label: 'Romantic', category: 'romantic' },
            { icon: '🧺', label: 'Picnic', category: 'picnic' },
            { icon: '🎉', label: 'Events', category: 'event' },
            { icon: '🥾', label: 'Hiking', category: 'hiking' },
          ].map((item) => (
            <button
              key={item.category}
              onClick={() => navigate(`/explore?category=${item.category}`)}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Featured Locations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Featured Places</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/explore')}>See all</Button>
          </div>
          
          {loading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {featured.slice(0, 4).map((location) => (
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

        {/* Community CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/20 rounded-2xl p-6 text-center">
          <Users className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold mb-2">Join Our Community</h3>
          <p className="text-sm text-muted-foreground mb-4">Share your favorite spots and discover hidden gems from others</p>
          <Button variant="outline" onClick={() => navigate('/community')}>Explore Community</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
