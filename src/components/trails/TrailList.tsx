import { HikingTrail } from '@/types/trails';
import { TrailCard } from './TrailCard';
import { Skeleton } from '@/components/ui/skeleton';

interface TrailListProps {
  trails: HikingTrail[];
  loading?: boolean;
  selectedTrailId?: string;
  onTrailSelect?: (trail: HikingTrail) => void;
}

export function TrailList({ trails, loading, selectedTrailId, onTrailSelect }: TrailListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (trails.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No trails available for this location yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trails.map(trail => (
        <TrailCard
          key={trail.id}
          trail={trail}
          isSelected={trail.id === selectedTrailId}
          onSelect={onTrailSelect}
        />
      ))}
    </div>
  );
}
