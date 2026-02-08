import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HikingTrail, DIFFICULTY_COLORS, WAYPOINT_ICONS } from '@/types/trails';

interface TrailMapProps {
  trails: HikingTrail[];
  selectedTrailId?: string;
  onTrailSelect?: (trail: HikingTrail) => void;
  showUserLocation?: boolean;
  className?: string;
}

export function TrailMap({
  trails,
  selectedTrailId,
  onTrailSelect,
  showUserLocation = false,
  className = '',
}: TrailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<Map<string, L.Polyline>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center (Enugu area)
    const defaultCenter: L.LatLngExpression = [6.4541, 7.5134];
    
    mapInstanceRef.current = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: true,
    });

    // Use OpenStreetMap tiles with terrain style
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap contributors',
      maxZoom: 17,
    }).addTo(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Draw trails
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing polylines
    polylinesRef.current.forEach(polyline => polyline.remove());
    polylinesRef.current.clear();

    if (trails.length === 0) return;

    const allBounds: L.LatLngBounds[] = [];

    trails.forEach(trail => {
      if (trail.gps_path.length < 2) return;

      const latLngs = trail.gps_path.map(p => [p.lat, p.lng] as L.LatLngTuple);
      const isSelected = trail.id === selectedTrailId;
      
      const polyline = L.polyline(latLngs, {
        color: DIFFICULTY_COLORS[trail.difficulty],
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 1 : 0.7,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Add click handler
      polyline.on('click', () => {
        onTrailSelect?.(trail);
      });

      // Add hover effect
      polyline.on('mouseover', () => {
        if (!isSelected) {
          polyline.setStyle({ weight: 6, opacity: 1 });
        }
      });

      polyline.on('mouseout', () => {
        if (!isSelected) {
          polyline.setStyle({ weight: 4, opacity: 0.7 });
        }
      });

      polylinesRef.current.set(trail.id, polyline);
      allBounds.push(polyline.getBounds());

      // Add start marker
      if (trail.start_point) {
        const startIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: ${DIFFICULTY_COLORS[trail.difficulty]}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">🚩</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([trail.start_point.lat, trail.start_point.lng], { icon: startIcon })
          .bindPopup(`<strong>Start:</strong> ${trail.start_point.name}`)
          .addTo(map);
      }

      // Add end marker for point-to-point trails
      if (trail.trail_type === 'point_to_point' && trail.end_point) {
        const endIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: ${DIFFICULTY_COLORS[trail.difficulty]}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">🏁</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([trail.end_point.lat, trail.end_point.lng], { icon: endIcon })
          .bindPopup(`<strong>End:</strong> ${trail.end_point.name}`)
          .addTo(map);
      }

      // Add waypoint markers
      trail.waypoints.forEach(waypoint => {
        const waypointIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: white; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #374151; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px;">${WAYPOINT_ICONS[waypoint.type]}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon })
          .bindPopup(`<strong>${waypoint.name}</strong><br/><em>${waypoint.type}</em>`)
          .addTo(map);
      });
    });

    // Fit bounds to show all trails
    if (allBounds.length > 0) {
      const combinedBounds = allBounds.reduce((acc, bounds) => acc.extend(bounds), allBounds[0]);
      map.fitBounds(combinedBounds, { padding: [30, 30] });
    }
  }, [trails, selectedTrailId, onTrailSelect]);

  // User location tracking
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !showUserLocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6, 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup('You are here')
            .addTo(map);
        }
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
    };
  }, [showUserLocation]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full min-h-[300px] rounded-xl overflow-hidden ${className}`}
      style={{ background: '#e5e7eb' }}
    />
  );
}
