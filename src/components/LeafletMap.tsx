import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons - must be done after leaflet is imported
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create icons lazily
const createUserIcon = () => new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const createLocationIcon = () => new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationWithDistance extends Location {
  distance: number;
}

interface LeafletMapProps {
  userPosition: { lat: number; lng: number } | null;
  nearbyLocations: LocationWithDistance[];
  radius: number;
  defaultCenter: [number, number];
  onLocationSelect?: (location: LocationWithDistance) => void;
}

// Component to recenter map when user location changes
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function LeafletMap({ 
  userPosition, 
  nearbyLocations, 
  radius, 
  defaultCenter,
  onLocationSelect 
}: LeafletMapProps) {
  const navigate = useNavigate();
  
  // Create icons inside component
  const userIcon = useMemo(() => createUserIcon(), []);
  const locationIcon = useMemo(() => createLocationIcon(), []);

  const mapCenter: [number, number] = userPosition
    ? [userPosition.lat, userPosition.lng]
    : defaultCenter;

  const getDirections = (location: Location) => {
    const query = encodeURIComponent(`${location.name} ${location.area} ${location.state} Nigeria`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  return (
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
              color: '#22c55e',
              fillColor: '#22c55e',
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
            click: () => onLocationSelect?.(location),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-sm">{location.name}</h3>
              <p className="text-xs text-gray-500 mb-2">
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
  );
}
