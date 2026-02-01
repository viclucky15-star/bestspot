import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { usePremiumPayment } from '@/hooks/usePremiumPayment';
import { usePaymentReceipts } from '@/hooks/usePaymentReceipts';
import { BankTransferDialog } from '@/components/BankTransferDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Lock, Clock } from 'lucide-react';

interface PremiumGateProps {
  children: ReactNode;
  feature: 'weather' | 'ai-assistant';
  fallback?: ReactNode;
}

const featureDetails = {
  'weather': {
    title: 'Premium Weather',
    description: 'Get real-time weather updates and personalized suggestions for your outdoor activities.',
    icon: Sparkles,
  },
  'ai-assistant': {
    title: 'AI Date Assistant',
    description: 'Your personal AI companion to help plan the perfect date with voice interactions.',
    icon: Crown,
  },
};

export function PremiumGate({ children, feature, fallback }: PremiumGateProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isLoading } = usePremiumStatus();
  const { premiumPrice } = usePremiumPayment();
  const { getPendingReceipt, receipts } = usePaymentReceipts();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Show loading state
  if (isLoading) {
    return fallback || null;
  }

  // If premium, show the feature
  if (isPremium) {
    return <>{children}</>;
  }

  const details = featureDetails[feature];
  const Icon = details.icon;

  // Check for pending premium receipt
  const pendingReceipt = getPendingReceipt('premium_upgrade');

  const handleUpgrade = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowPaymentDialog(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // If there's a pending receipt, show waiting status
  if (pendingReceipt) {
    return (
      <>
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative p-5 text-center">
            {/* Clock Icon */}
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>

            {/* Feature Icon & Title */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Payment Pending
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
              Your payment is being verified. You'll get access to {details.title} once approved.
            </p>

            {/* View Status Button */}
            <Button 
              variant="outline"
              onClick={() => setShowPaymentDialog(true)}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              View Status
            </Button>

            {/* Premium benefits */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                ⏳ Usually verified within 24 hours
              </p>
            </div>
          </div>
        </Card>

        <BankTransferDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          amount={premiumPrice}
          paymentType="premium_upgrade"
          existingReceipt={pendingReceipt}
        />
      </>
    );
  }

  return (
    <>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative p-5 text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>

          {/* Feature Icon & Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">
              {details.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
            {details.description}
          </p>

          {/* Upgrade Button */}
          <Button 
            onClick={handleUpgrade}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Crown className="w-4 h-4" />
            {user ? `Upgrade for ${formatPrice(premiumPrice)}` : 'Sign in to Upgrade'}
          </Button>

          {/* Premium benefits */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              ✨ One-time payment • Lifetime access
            </p>
          </div>
        </div>
      </Card>

      <BankTransferDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={premiumPrice}
        paymentType="premium_upgrade"
      />
    </>
  );
}
