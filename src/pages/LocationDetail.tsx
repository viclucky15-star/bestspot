import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Clock, Wallet, Star, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ShareButton } from '@/components/ShareButton';
import { ClaimBusinessCTA } from '@/components/business/ClaimBusinessCTA';
import { AdBanner } from '@/components/ads/AdBanner';

const LocationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchLocation();
  }, [id]);

  const fetchLocation = async () => {
    if (!id) return;
    const { data, error } = await supabase.from('locations').select('*').eq('id', id).single();
    if (error) {
      toast({ title: 'Error', description: 'Location not found', variant: 'destructive' });
      navigate('/explore');
    } else {
      setLocation(data as unknown as Location);
      // Track recently viewed if user is logged in
      if (user) {
        await supabase.from('recently_viewed').upsert({ user_id: user.id, location_id: id, viewed_at: new Date().toISOString() }, { onConflict: 'user_id,location_id' });
      }
    }
    setLoading(false);
  };


  const getBudgetLabel = (level: string) => {
    const labels: Record<string, string> = { low: '₦ Budget-Friendly', medium: '₦₦ Moderate', high: '₦₦₦ Premium' };
    return labels[level] || level;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = { romantic: '💕', picnic: '🧺', event: '🎉', hiking: '🥾' };
    return emojis[category] || '📍';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-muted animate-pulse" />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!location) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-72">
        {location.image_url ? (
          <img src={location.image_url} alt={location.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
            <span className="text-6xl">{getCategoryEmoji(location.category)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button variant="secondary" size="icon" onClick={() => navigate(-1)} className="bg-background/80 backdrop-blur">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <ShareButton
              title={location.name}
              text={location.description || `Check out ${location.name}!`}
              url={window.location.href}
              variant="secondary"
              size="icon"
              className="bg-background/80 backdrop-blur"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => toggleFavorite(location.id)}
              className="bg-background/80 backdrop-blur"
            >
              <Heart className={`w-5 h-5 ${isFavorite(location.id) ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative">
        <div className="bg-card rounded-2xl border shadow-lg p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{getCategoryEmoji(location.category)} {location.category}</Badge>
                {location.is_featured && <Badge className="bg-primary">Featured</Badge>}
              </div>
              <h1 className="font-display text-2xl font-bold">{location.name}</h1>
            </div>
            {location.rating && (
              <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{location.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span>{location.area}, Enugu</span>
          </div>

          {location.description && (
            <p className="text-muted-foreground mb-6">{location.description}</p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/50 rounded-xl p-4">
              <Wallet className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">{getBudgetLabel(location.budget_level)}</p>
              {location.estimated_budget_min && location.estimated_budget_max && (
                <p className="text-xs text-muted-foreground">
                  ₦{location.estimated_budget_min.toLocaleString()} - ₦{location.estimated_budget_max.toLocaleString()}
                </p>
              )}
            </div>
            {location.best_time && (
              <div className="bg-muted/50 rounded-xl p-4">
                <Clock className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-medium">Best Time</p>
                <p className="text-xs text-muted-foreground">{location.best_time}</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          {location.amenities && location.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {location.amenities.map((amenity, i) => (
                  <Badge key={i} variant="outline">{amenity}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {location.google_maps_url && (
              <Button asChild variant="outline" className="flex-1 gap-2">
                <a href={location.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" /> View on Map
                </a>
              </Button>
            )}
            <Button onClick={() => navigate('/planner', { state: { locationId: location.id } })} className="flex-1 gap-2">
              <Calendar className="w-4 h-4" /> Plan a Visit
            </Button>
          </div>
        </div>

        {/* Claim Business CTA */}
        <div className="mt-4">
          <ClaimBusinessCTA 
            locationId={location.id} 
            locationName={location.name}
            isClaimed={(location as any).is_claimed}
          />
        </div>

        {/* Ad Banner */}
        <div className="mt-4">
          <AdBanner slot="location-detail-1" format="rectangle" />
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
