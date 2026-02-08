import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentReceipts } from '@/hooks/usePaymentReceipts';
import { BankTransferDialog } from '@/components/BankTransferDialog';
import { Camera, Video, Map, CheckCircle, Clock, XCircle, CreditCard, Eye, Loader2 } from 'lucide-react';
import { SERVICE_PROVIDER_LABELS, ServiceProviderType } from '@/types/serviceProvider';

const SERVICE_PROVIDER_FEE = 5000; // ₦5,000

const providerIcons: Record<ServiceProviderType, typeof Camera> = {
  photographer: Camera,
  cinematographer: Video,
  tour_guide: Map,
};

export function ServiceProviderStatusCard() {
  const { user } = useAuth();
  const { getLatestReceipt } = usePaymentReceipts();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { data: providerProfile, isLoading } = useQuery({
    queryKey: ['my-service-provider', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Not a service provider
  if (!providerProfile) {
    return null;
  }

  const Icon = providerIcons[providerProfile.provider_type as ServiceProviderType] || Camera;
  const existingReceipt = getLatestReceipt('service_provider_payment');

  const getStatusBadge = () => {
    if (providerProfile.is_approved && providerProfile.is_paid) {
      return <Badge className="bg-green-500">Live</Badge>;
    }
    if (providerProfile.is_approved && !providerProfile.is_paid) {
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Awaiting Payment</Badge>;
    }
    if (providerProfile.rejection_reason) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="secondary">Pending Review</Badge>;
  };

  const getStatusContent = () => {
    // Live
    if (providerProfile.is_approved && providerProfile.is_paid) {
      return (
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <Eye className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="font-semibold text-green-600">You're Visible!</p>
            <p className="text-sm text-muted-foreground">
              Your profile is live in the Service Providers directory. Visitors can now find and contact you.
            </p>
          </div>
        </div>
      );
    }

    // Approved but not paid - show payment option
    if (providerProfile.is_approved && !providerProfile.is_paid) {
      // Check if there's a pending receipt
      if (existingReceipt?.status === 'pending') {
        return (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold">Payment Under Review</p>
              <p className="text-sm text-muted-foreground">
                We're verifying your payment. You'll be visible in the directory once approved.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold">Approved! Pay to Go Live</p>
            <p className="text-sm text-muted-foreground">
              Complete your payment of ₦{SERVICE_PROVIDER_FEE.toLocaleString()} to appear in the public directory.
            </p>
          </div>
          <Button onClick={() => setShowPaymentDialog(true)} className="w-full">
            Pay ₦{SERVICE_PROVIDER_FEE.toLocaleString()} to Go Live
          </Button>
        </div>
      );
    }

    // Rejected
    if (providerProfile.rejection_reason) {
      return (
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-destructive">Application Rejected</p>
            <p className="text-sm text-muted-foreground">
              {providerProfile.rejection_reason}
            </p>
          </div>
        </div>
      );
    }

    // Pending review
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">Under Review</p>
          <p className="text-sm text-muted-foreground">
            Your application is being reviewed. We'll notify you once approved.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-base">
                {SERVICE_PROVIDER_LABELS[providerProfile.provider_type as ServiceProviderType]}
              </CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {getStatusContent()}

          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            <p><strong>Name:</strong> {providerProfile.full_name}</p>
            <p><strong>Phone:</strong> {providerProfile.phone_number}</p>
            <p><strong>Location:</strong> {providerProfile.area ? `${providerProfile.area}, ` : ''}{providerProfile.state}</p>
          </div>
        </CardContent>
      </Card>

      <BankTransferDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={SERVICE_PROVIDER_FEE}
        paymentType="service_provider_payment"
        metadata={{ provider_id: providerProfile.id }}
        title="Service Provider Listing Fee"
        description={`Pay ₦${SERVICE_PROVIDER_FEE.toLocaleString()} to appear in the public service providers directory`}
        existingReceipt={existingReceipt}
      />
    </>
  );
}
