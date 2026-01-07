import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { useBusinessAnalytics } from '@/hooks/useBusinessAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  MapPin, 
  Eye, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Plus,
  BarChart3,
  Megaphone,
  ArrowLeft,
  Star
} from 'lucide-react';
import { useEffect } from 'react';

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { businessAccount, businessLocations, isLoading, hasBusinessAccount } = useBusinessAccount();
  const { summary } = useBusinessAnalytics();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isLoading && !hasBusinessAccount && user) {
      navigate('/business/onboarding');
    }
  }, [isLoading, hasBusinessAccount, user, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!businessAccount) return null;

  const stats = [
    { label: 'Total Views', value: summary.totalViews, icon: Eye, color: 'text-blue-500' },
    { label: 'Favorites', value: summary.totalFavorites, icon: Heart, color: 'text-red-500' },
    { label: 'Planned Visits', value: summary.totalPlannedVisits, icon: Calendar, color: 'text-green-500' },
    { label: 'Map Clicks', value: summary.totalMapClicks, icon: MapPin, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{businessAccount.business_name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={businessAccount.verification_status === 'verified' ? 'default' : 'secondary'}>
                  {businessAccount.verification_status}
                </Badge>
                <Badge variant="outline">{businessAccount.subscription_tier}</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/business/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => navigate('/business/analytics')}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => navigate('/business/promotions')}
          >
            <Megaphone className="h-5 w-5" />
            <span className="text-xs">Promotions</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => navigate('/explore')}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Claim Location</span>
          </Button>
        </div>

        {/* Managed Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Locations
            </CardTitle>
            <CardDescription>
              Locations you manage ({businessLocations?.length || 0})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {businessLocations && businessLocations.length > 0 ? (
              <div className="space-y-3">
                {businessLocations.map((bl) => (
                  <div 
                    key={bl.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/location/${bl.location_id}`)}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={bl.location?.image_url || '/placeholder.svg'}
                        alt={bl.location?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{bl.location?.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {bl.location?.area}, {bl.location?.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>4.5</span>
                      </div>
                      <p className="text-xs text-muted-foreground">23 views</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No locations claimed yet</p>
                <Button onClick={() => navigate('/explore')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Claim a Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA for Basic Users */}
        {businessAccount.subscription_tier === 'basic' && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Get featured listings, advanced analytics, and manage up to 5 locations
                  </p>
                </div>
                <Button onClick={() => navigate('/business/promotions')}>
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
