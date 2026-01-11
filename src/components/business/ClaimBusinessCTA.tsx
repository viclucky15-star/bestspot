import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { ClaimLocationDialog } from './ClaimLocationDialog';

interface ClaimBusinessCTAProps {
  locationId: string;
  locationName: string;
}

export function ClaimBusinessCTA({ locationId, locationName }: ClaimBusinessCTAProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasBusinessAccount } = useBusinessAccount();
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const handleClaim = () => {
    if (!user) {
      toast.info('Please sign in to claim this business');
      navigate('/auth');
      return;
    }

    if (!hasBusinessAccount) {
      toast.info('Please complete business registration first');
      navigate('/business/onboarding');
      return;
    }

    // Open the claim dialog
    setShowClaimDialog(true);
  };

  return (
    <>
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
              >
                Claim This Business
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClaimLocationDialog
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        locationId={locationId}
        locationName={locationName}
      />
    </>
  );
}
