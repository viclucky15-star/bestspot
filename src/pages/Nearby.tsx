import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { useLocations } from '@/hooks/useLocations';
import { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Navigation, Locate, AlertCircle, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const locationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

// Component to recenter map when user location changes
function RecenterMap({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
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
  const defaultCenter: LatLngExpression = [6.4584, 7.5464];

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

  const mapCenter: LatLngExpression = userPosition
    ? [userPosition.lat, userPosition.lng]
    : defaultCenter;

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
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full z-10"
          style={{ background: 'hsl(var(--muted))' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userPosition && (
            <>
              <RecenterMap position={[userPosition.lat, userPosition.lng]} />
              
              {/* User location marker */}
              <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>You are here</strong>
                  </div>
                </Popup>
              </Marker>

              {/* Radius circle */}
              <Circle
                center={[userPosition.lat, userPosition.lng]}
                radius={radius * 1000}
                pathOptions={{
                  color: 'hsl(var(--primary))',
                  fillColor: 'hsl(var(--primary))',
                  fillOpacity: 0.1,
                }}
              />
            </>
          )}

          {/* Location markers */}
          {nearbyLocations.map((location) => (
            <Marker
              key={location.id}
              position={[Number(location.latitude), Number(location.longitude)]}
              icon={locationIcon}
              eventHandlers={{
                click: () => setSelectedLocation(location),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-sm">{location.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {location.area}, {location.state}
                  </p>
                  <Badge variant="outline" className="text-xs mb-2">
                    {location.distance.toFixed(1)} km away
                  </Badge>
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => navigate(`/location/${location.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => getDirections(location)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Go
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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
