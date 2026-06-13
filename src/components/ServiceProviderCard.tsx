import { Phone, MapPin, Camera, Video, Map, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ServiceProvider, SERVICE_PROVIDER_LABELS } from '@/types/serviceProvider';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

const providerIcons = {
  photographer: Camera,
  cinematographer: Video,
  tour_guide: Map,
  event_planner: Calendar,
};

export function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const Icon = providerIcons[provider.provider_type];
  const initials = provider.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleCall = () => {
    window.location.href = `tel:${provider.phone_number}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello ${provider.full_name}, I found your profile on tourguide and I'm interested in your ${SERVICE_PROVIDER_LABELS[provider.provider_type]} services.`
    );
    window.open(`https://wa.me/${provider.phone_number.replace(/^0/, '234')}?text=${message}`, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{provider.full_name}</h3>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {SERVICE_PROVIDER_LABELS[provider.provider_type]}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span>
                {provider.area ? `${provider.area}, ` : ''}
                {provider.state}
              </span>
            </div>

            {provider.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {provider.bio}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={handleCall} className="flex-1">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button size="sm" onClick={handleWhatsApp} className="flex-1 bg-[hsl(145_55%_25%)] hover:bg-[hsl(145_55%_20%)] text-white">
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
