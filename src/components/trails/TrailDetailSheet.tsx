import { Clock, Ruler, Mountain, AlertTriangle, MapPin, Heart, Navigation } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HikingTrail, DIFFICULTY_COLORS, DIFFICULTY_LABELS, TRAIL_TYPE_LABELS, WAYPOINT_ICONS } from '@/types/trails';
import { useSavedTrails } from '@/hooks/useHikingTrails';
import { ShareButton } from '@/components/ShareButton';

interface TrailDetailSheetProps {
  trail: HikingTrail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrailDetailSheet({ trail, open, onOpenChange }: TrailDetailSheetProps) {
  const { isTrailSaved, toggleSaveTrail } = useSavedTrails();

  if (!trail) return null;

  const isSaved = isTrailSaved(trail.id);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  };

  const openInMaps = () => {
    if (trail.start_point) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${trail.start_point.lat},${trail.start_point.lng}`,
        '_blank'
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              style={{ 
                backgroundColor: DIFFICULTY_COLORS[trail.difficulty],
                color: trail.difficulty === 'moderate' ? '#000' : '#fff'
              }}
            >
              {DIFFICULTY_LABELS[trail.difficulty]}
            </Badge>
            <Badge variant="outline">
              {TRAIL_TYPE_LABELS[trail.trail_type]}
            </Badge>
          </div>
          <SheetTitle className="text-left text-xl">{trail.name}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <Ruler className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="font-semibold">{trail.distance_km}km</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="font-semibold">{formatDuration(trail.estimated_duration_minutes)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <Mountain className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="font-semibold">{trail.elevation_gain_meters}m</p>
              <p className="text-xs text-muted-foreground">Elevation</p>
            </div>
          </div>

          {/* Description */}
          {trail.description && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">About this trail</h4>
              <p className="text-muted-foreground text-sm">{trail.description}</p>
            </div>
          )}

          {/* Highlights */}
          {trail.highlights && trail.highlights.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {trail.highlights.map((highlight, i) => (
                  <Badge key={i} variant="secondary">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Waypoints */}
          {trail.waypoints.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Points of Interest</h4>
              <div className="space-y-2">
                {trail.waypoints.map((waypoint, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                    <span className="text-xl">{WAYPOINT_ICONS[waypoint.type]}</span>
                    <div>
                      <p className="font-medium text-sm">{waypoint.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{waypoint.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Notes */}
          {trail.safety_notes && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                Safety Notes
              </h4>
              <p className="text-sm text-muted-foreground bg-accent/10 rounded-lg p-3 border border-accent/20">
                {trail.safety_notes}
              </p>
            </div>
          )}

          {/* Trailhead Info */}
          {trail.start_point && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Trailhead</h4>
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{trail.start_point.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {trail.start_point.lat.toFixed(6)}, {trail.start_point.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex gap-3 pb-6">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => toggleSaveTrail(trail.id)}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
              {isSaved ? 'Saved' : 'Save Trail'}
            </Button>
            <ShareButton
              title={trail.name}
              text={`Check out the ${trail.name} trail - ${trail.distance_km}km, ${DIFFICULTY_LABELS[trail.difficulty]}`}
              url={window.location.href}
              variant="outline"
              className="flex-1 gap-2"
            />
          </div>

          {trail.start_point && (
            <Button onClick={openInMaps} className="w-full gap-2 mb-4">
              <Navigation className="w-4 h-4" />
              Navigate to Trailhead
            </Button>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
