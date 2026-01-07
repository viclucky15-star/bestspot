import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClaimBusinessCTAProps {
  locationId: string;
  locationName: string;
  isClaimed?: boolean;
}

export function ClaimBusinessCTA({ locationId, locationName, isClaimed }: ClaimBusinessCTAProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businessAccount, claimLocation, hasBusinessAccount } = useBusinessAccount();

  const handleClaim = async () => {
    if (!user) {
      toast.info('Please sign in to claim this business');
      navigate('/auth');
      return;
    }

    if (!hasBusinessAccount) {
      navigate('/business/onboarding');
      return;
    }

    try {
      await claimLocation.mutateAsync(locationId);
    } catch (error) {
      console.error('Failed to claim location:', error);
    }
  };

  if (isClaimed) {
    return (
      <Card className="bg-green-500/10 border-green-500/20">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">Verified Business</p>
            <p className="text-sm text-muted-foreground">This location is managed by its owner</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Own this business?</p>
            <p className="text-sm text-muted-foreground mb-3">
              Claim {locationName} to manage your listing, respond to customers, and access analytics
            </p>
            <Button 
              size="sm" 
              onClick={handleClaim}
              disabled={claimLocation.isPending}
            >
              {claimLocation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                'Claim This Business'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
