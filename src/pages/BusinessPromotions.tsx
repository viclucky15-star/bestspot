import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Megaphone, 
  Star, 
  Zap,
  Crown,
  Check,
  Sparkles
} from 'lucide-react';
import { useEffect } from 'react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: typeof Star;
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    description: 'Perfect for getting started',
    features: [
      'Claim 1 location',
      'Basic analytics',
      'Edit location info',
      'Community visibility',
    ],
    icon: Star,
  },
  {
    name: 'Premium',
    price: '₦5,000',
    period: '/month',
    description: 'Best for growing businesses',
    features: [
      'Manage up to 5 locations',
      'Advanced analytics',
      '2 featured listings/month',
      'Priority in search results',
      'Remove competitor ads',
      'Priority support',
    ],
    icon: Zap,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '₦15,000',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Unlimited locations',
      'Full analytics suite',
      '5 featured listings/month',
      'Top search placement',
      'API access',
      'Dedicated account manager',
      'Custom branding options',
    ],
    icon: Crown,
  },
];

const featuredListingOptions = [
  { duration: '3 days', price: '₦1,500', impressions: '~500' },
  { duration: '7 days', price: '₦3,000', impressions: '~1,200' },
  { duration: '14 days', price: '₦5,000', impressions: '~2,500' },
  { duration: '30 days', price: '₦8,000', impressions: '~5,000' },
];

export default function BusinessPromotions() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { businessAccount, isLoading } = useBusinessAccount();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isLoading && !businessAccount) {
      navigate('/business/onboarding');
    }
  }, [isLoading, businessAccount, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Promotions</h1>
            <p className="text-sm text-muted-foreground">Boost your visibility</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Subscription Tiers */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-muted-foreground">
              Unlock more features and reach more customers
            </p>
          </div>

          <div className="grid gap-4">
            {pricingTiers.map((tier) => (
              <Card 
                key={tier.name}
                className={tier.popular ? 'border-primary shadow-lg' : ''}
              >
                {tier.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <tier.icon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{tier.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{tier.price}</p>
                      <p className="text-sm text-muted-foreground">{tier.period}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    disabled={businessAccount?.subscription_tier === tier.name.toLowerCase()}
                  >
                    {businessAccount?.subscription_tier === tier.name.toLowerCase() 
                      ? 'Current Plan' 
                      : tier.price === 'Free' 
                        ? 'Current Plan'
                        : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Listings */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <CardTitle>Featured Listings</CardTitle>
              </div>
              <CardDescription>
                Get your location to the top of search results and homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {featuredListingOptions.map((option) => (
                  <Card key={option.duration} className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <p className="font-semibold mb-1">{option.duration}</p>
                      <p className="text-lg font-bold text-primary">{option.price}</p>
                      <p className="text-xs text-muted-foreground">{option.impressions} impressions</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full mt-4" variant="outline">
                <Megaphone className="h-4 w-4 mr-2" />
                Create Featured Listing
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Active Promotions */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Active Promotions</CardTitle>
              <CardDescription>Your currently running promotions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active promotions</p>
                <p className="text-sm">Create a featured listing to get started</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
