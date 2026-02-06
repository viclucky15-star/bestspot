import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '@/hooks/useLocations';
import { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Navigation, Locate, AlertCircle, ExternalLink } from 'lucide-react';

// Lazy load the map component to avoid SSR/ESM issues with Leaflet
const LeafletMap = lazy(() => import('@/components/LeafletMap').then(mod => ({ default: mod.LeafletMap })));

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface LocationWithDistance extends Location {
  distance: number;
}

const Nearby = () => {
  const navigate = useNavigate();
  const { locations, loading: locationsLoading } = useLocations();
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [radius, setRadius] = useState(10); // Default 10km radius
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDistance | null>(null);

  // Default to Enugu city center if no user location
  const defaultCenter: [number, number] = [6.4584, 7.5464];

  // Request user's location
  const requestLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Calculate distances and filter locations within radius
  const nearbyLocations = useMemo(() => {
    if (!userPosition || !locations.length) return [];

    return locations
      .filter((loc) => loc.latitude && loc.longitude)
      .map((loc) => ({
        ...loc,
        distance: calculateDistance(
          userPosition.lat,
          userPosition.lng,
          Number(loc.latitude),
          Number(loc.longitude)
        ),
      }))
      .filter((loc) => loc.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }, [userPosition, locations, radius]);

  const openGoogleMaps = (location: Location) => {
    const query = encodeURIComponent(`${location.name} ${location.area} ${location.state} Nigeria`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const getDirections = (location: Location) => {
    const query = encodeURIComponent(`${location.name} ${location.area} ${location.state} Nigeria`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  if (locationsLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b px-4 py-4">
          <h1 className="font-display text-2xl font-bold">Nearby Places</h1>
        </div>
        <div className="p-4">
          <Skeleton className="h-[60vh] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Nearby Places
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            disabled={isLocating}
            className="gap-1"
          >
            <Locate className="w-4 h-4" />
            {isLocating ? 'Locating...' : 'Refresh'}
          </Button>
        </div>

        {/* Radius Slider */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Radius:</span>
          <Slider
            value={[radius]}
            onValueChange={(value) => setRadius(value[0])}
            min={1}
            max={50}
            step={1}
            className="flex-1"
          />
          <Badge variant="secondary" className="whitespace-nowrap">
            {radius} km
          </Badge>
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {locationError}
          </div>
        )}

        {userPosition && (
          <p className="mt-2 text-sm text-muted-foreground">
            Found {nearbyLocations.length} place{nearbyLocations.length !== 1 ? 's' : ''} within {radius}km
          </p>
        )}
      </div>

      {/* Map Container */}
      <div className="relative h-[60vh] w-full">
        <Suspense fallback={
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        }>
          <LeafletMap
            userPosition={userPosition}
            nearbyLocations={nearbyLocations}
            radius={radius}
            defaultCenter={defaultCenter}
            onLocationSelect={setSelectedLocation}
          />
        </Suspense>
      </div>

      {/* Nearby Locations List */}
      <div className="p-4 space-y-3">
        <h2 className="font-display font-semibold text-lg">
          {nearbyLocations.length > 0 ? 'Closest to You' : 'No Places Nearby'}
        </h2>

        {!userPosition && !locationError && (
          <Card>
            <CardContent className="p-4 text-center">
              <Locate className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                Enable location access to find places near you
              </p>
              <Button onClick={requestLocation} disabled={isLocating}>
                {isLocating ? 'Getting Location...' : 'Enable Location'}
              </Button>
            </CardContent>
          </Card>
        )}

        {nearbyLocations.length === 0 && userPosition && (
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No places found within {radius}km. Try increasing the radius.
              </p>
            </CardContent>
          </Card>
        )}

        {nearbyLocations.map((location) => (
          <Card
            key={location.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/location/${location.id}`)}
          >
            <CardContent className="p-0 flex">
              {/* Image */}
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={location.image_url || '/placeholder.svg'}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{location.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {location.area}, {location.state}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {location.distance.toFixed(1)} km
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGoogleMaps(location);
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(location);
                      }}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Nearby;
