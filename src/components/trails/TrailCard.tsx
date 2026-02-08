import { Clock, Ruler, Mountain, ArrowRight, Heart, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HikingTrail, DIFFICULTY_COLORS, DIFFICULTY_LABELS, TRAIL_TYPE_LABELS } from '@/types/trails';
import { useSavedTrails } from '@/hooks/useHikingTrails';
import { ShareButton } from '@/components/ShareButton';

interface TrailCardProps {
  trail: HikingTrail;
  onSelect?: (trail: HikingTrail) => void;
  isSelected?: boolean;
}

export function TrailCard({ trail, onSelect, isSelected }: TrailCardProps) {
  const { isTrailSaved, toggleSaveTrail } = useSavedTrails();
  const isSaved = isTrailSaved(trail.id);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={() => onSelect?.(trail)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                style={{ 
                  backgroundColor: DIFFICULTY_COLORS[trail.difficulty],
                  color: trail.difficulty === 'moderate' ? '#000' : '#fff'
                }}
              >
                {DIFFICULTY_LABELS[trail.difficulty]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {TRAIL_TYPE_LABELS[trail.trail_type]}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg">{trail.name}</h3>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveTrail(trail.id);
              }}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
            </Button>
            <ShareButton
              title={trail.name}
              text={`Check out the ${trail.name} trail - ${trail.distance_km}km, ${DIFFICULTY_LABELS[trail.difficulty]}`}
              url={window.location.href}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            />
          </div>
        </div>

        {trail.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {trail.description}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Ruler className="w-4 h-4" />
            <span>{trail.distance_km}km</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(trail.estimated_duration_minutes)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Mountain className="w-4 h-4" />
            <span>{trail.elevation_gain_meters}m</span>
          </div>
        </div>

        {trail.highlights && trail.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {trail.highlights.slice(0, 3).map((highlight, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {highlight}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
