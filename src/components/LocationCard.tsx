import { Heart, MapPin, Star, Clock, ExternalLink, Navigation } from 'lucide-react';
import { Location, Category, BudgetLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/ShareButton';

interface LocationCardProps {
  location: Location;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

const categoryConfig: Record<Category, { label: string; className: string }> = {
  romantic: { label: 'Romantic', className: 'bg-romantic-light text-romantic' },
  picnic: { label: 'Picnic', className: 'bg-picnic-light text-picnic' },
  event: { label: 'Event', className: 'bg-event-light text-event' },
  hiking: { label: 'Hiking', className: 'bg-hiking-light text-hiking' },
};

const budgetConfig: Record<BudgetLevel, { label: string; className: string }> = {
  low: { label: '₦ Budget', className: 'bg-success/10 text-success' },
  medium: { label: '₦₦ Mid', className: 'bg-warning/10 text-warning' },
  high: { label: '₦₦₦ Premium', className: 'bg-primary/10 text-primary' },
};

export function LocationCard({ location, isFavorite, onToggleFavorite, onClick, compact }: LocationCardProps) {
  const categoryStyle = categoryConfig[location.category];
  const budgetStyle = budgetConfig[location.budget_level];

  const openGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${location.name} ${location.area} ${location.state || 'Enugu'} Nigeria`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const getDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${location.name} ${location.area} ${location.state || 'Enugu'} Nigeria`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  if (compact) {
    return (
      <div 
        className="flex flex-col bg-card rounded-xl border cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
        onClick={onClick}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={location.image_url || '/placeholder.svg'} 
            alt={location.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-2.5">
          <h4 className="font-medium text-sm line-clamp-1 mb-1">{location.name}</h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{location.area}</span>
          </p>
          <Badge className={cn("text-[10px] px-1.5 py-0.5", categoryStyle.className)}>
            {categoryStyle.label}
          </Badge>
        </div>
      </div>
    );
  }

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
        />
        
        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart 
              className={cn(
                "w-5 h-5 transition-colors",
                isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
              )} 
            />
          </button>
        )}

        {/* Featured badge */}
        {location.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground">
              ⭐ Featured
            </Badge>
          </div>
        )}

        {/* Category & Budget badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <Badge className={categoryStyle.className}>
            {categoryStyle.label}
          </Badge>
          <Badge className={budgetStyle.className}>
            {budgetStyle.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-lg leading-tight">{location.name}</h3>
          {location.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium">{location.rating}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
          <MapPin className="w-4 h-4" />
          {location.area}{location.state && `, ${location.state}`}
        </p>

        {location.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {location.description}
          </p>
        )}

        {location.best_time && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <Clock className="w-3 h-3" />
            Best time: {location.best_time}
          </p>
        )}

        {/* Budget range */}
        {(location.estimated_budget_min || location.estimated_budget_max) && (
          <p className="text-sm font-medium text-primary mb-3">
            ₦{location.estimated_budget_min?.toLocaleString()} - ₦{location.estimated_budget_max?.toLocaleString()}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={openGoogleMaps}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Map
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={getDirections}
          >
            <Navigation className="w-4 h-4 mr-1" />
            Go
          </Button>
          <ShareButton 
            title={location.name}
            text={`Check out ${location.name} in ${location.area}, ${location.state || 'Enugu'}! ${location.description || ''}`}
            url={`${window.location.origin}/location/${location.id}`}
            size="sm"
            variant="outline"
          />
        </div>
      </div>
    </div>
  );
}
