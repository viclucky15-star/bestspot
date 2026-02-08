import { useState } from 'react';
import { Map, List, Locate } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrailMap } from './TrailMap';
import { TrailList } from './TrailList';
import { TrailDetailSheet } from './TrailDetailSheet';
import { HikingTrail, DIFFICULTY_COLORS } from '@/types/trails';

interface HikeTrailsTabProps {
  trails: HikingTrail[];
  loading?: boolean;
}

export function HikeTrailsTab({ trails, loading }: HikeTrailsTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedTrail, setSelectedTrail] = useState<HikingTrail | null>(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleTrailSelect = (trail: HikingTrail) => {
    setSelectedTrail(trail);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle & Controls */}
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(v) => v && setViewMode(v as 'list' | 'map')}
          className="bg-muted rounded-lg p-1"
        >
          <ToggleGroupItem value="list" className="gap-2 px-4">
            <List className="w-4 h-4" />
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="map" className="gap-2 px-4">
            <Map className="w-4 h-4" />
            Map
          </ToggleGroupItem>
        </ToggleGroup>

        {viewMode === 'map' && (
          <Button
            variant={showUserLocation ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setShowUserLocation(!showUserLocation)}
          >
            <Locate className="w-4 h-4" />
            {showUserLocation ? 'Tracking' : 'My Location'}
          </Button>
        )}
      </div>

      {/* Legend (for map view) */}
      {viewMode === 'map' && trails.length > 0 && (
        <div className="flex items-center gap-4 text-xs bg-muted/50 rounded-lg p-2">
          <span className="text-muted-foreground">Difficulty:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIFFICULTY_COLORS.easy }} />
            <span>Easy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIFFICULTY_COLORS.moderate }} />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIFFICULTY_COLORS.hard }} />
            <span>Hard</span>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <TrailList
          trails={trails}
          selectedTrailId={selectedTrail?.id}
          onTrailSelect={handleTrailSelect}
        />
      ) : (
        <div className="h-[400px] rounded-xl overflow-hidden border">
          <TrailMap
            trails={trails}
            selectedTrailId={selectedTrail?.id}
            onTrailSelect={handleTrailSelect}
            showUserLocation={showUserLocation}
          />
        </div>
      )}

      {/* Trail Detail Sheet */}
      <TrailDetailSheet
        trail={selectedTrail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
