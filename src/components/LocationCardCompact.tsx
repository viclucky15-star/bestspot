import { Heart, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Location, Category, BudgetLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationCardCompactProps {
  location: Location;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

const categoryConfig: Record<Category, { label: string; className: string }> = {
  romantic: { label: 'Romantic', className: 'bg-romantic-light text-romantic' },
  picnic: { label: 'Picnic', className: 'bg-picnic-light text-picnic' },
  event: { label: 'Event', className: 'bg-event-light text-event' },
  hiking: { label: 'Hiking', className: 'bg-hiking-light text-hiking' },
};

const budgetConfig: Record<BudgetLevel, { label: string; className: string }> = {
  low: { label: '₦', className: 'bg-success/10 text-success' },
  medium: { label: '₦₦', className: 'bg-warning/10 text-warning' },
  high: { label: '₦₦₦', className: 'bg-primary/10 text-primary' },
};

export function LocationCardCompact({ location, isFavorite, onToggleFavorite, onClick }: LocationCardCompactProps) {
  const categoryStyle = categoryConfig[location.category];
  const budgetStyle = budgetConfig[location.budget_level];

  const openGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${location.name} Enugu Nigeria`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const getDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${location.name} Enugu Nigeria`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  return (
    <div 
      className="group bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={location.image_url || '/placeholder.svg'} 
          alt={location.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
              )} 
            />
          </button>
        )}

        {/* Featured badge */}
        {location.is_featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
              ⭐
            </Badge>
          </div>
        )}

        {/* Budget badge */}
        <div className="absolute bottom-2 right-2">
          <Badge className={cn("text-xs px-1.5", budgetStyle.className)}>
            {budgetStyle.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 mb-1">{location.name}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{location.area}</span>
        </p>
        
        {/* Map buttons */}
        <div className="flex gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-7 text-xs px-2"
            onClick={openGoogleMaps}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Map
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 h-7 text-xs px-2"
            onClick={getDirections}
          >
            <Navigation className="w-3 h-3 mr-1" />
            Go
          </Button>
        </div>
      </div>
    </div>
  );
}
