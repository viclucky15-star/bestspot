import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentReceipts } from '@/hooks/usePaymentReceipts';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { SERVICE_PROVIDER_LABELS, ServiceProviderType } from '@/types/serviceProvider';
import { toast } from 'sonner';

const SERVICE_PROVIDER_FEE = 5000;

const BANK_DETAILS = {
  bankName: 'GTBank',
  accountNumber: '0747038903',
  accountName: 'GRAND WORD MEDIA AND PUBLISHERS',
};

export function ServiceProviderPaymentBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getLatestReceipt } = usePaymentReceipts();
  const { permission, requestPermission, sendNotification } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const { data: providerProfile } = useQuery({
    queryKey: ['my-service-provider-banner', user?.id],
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Send push notification once when provider is approved but not paid
  useEffect(() => {
    if (providerProfile?.is_approved && !providerProfile?.is_paid && !notificationSent) {
      const existingReceipt = getLatestReceipt('service_provider_payment');
      
      if (!existingReceipt || existingReceipt.status === 'rejected') {
        // Request permission if not set
        if (permission === 'default') {
          requestPermission();
        }
        
        // Send notification
        if (permission === 'granted') {
          sendNotification({
            title: '🎉 Your Application is Approved!',
            body: `Pay ₦${SERVICE_PROVIDER_FEE.toLocaleString()} to go live in the Service Providers directory.`,
            tag: 'service-provider-payment',
            data: { url: '/profile' },
          });
        }
        
        setNotificationSent(true);
      }
    }
  }, [providerProfile, notificationSent, permission, requestPermission, sendNotification, getLatestReceipt]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // Don't show if no provider profile, already paid, not approved, or dismissed
  if (!providerProfile || providerProfile.is_paid || !providerProfile.is_approved || dismissed) {
    return null;
  }

  const existingReceipt = getLatestReceipt('service_provider_payment');
  
  // Don't show if there's already a pending receipt
  if (existingReceipt?.status === 'pending') {
    return null;
  }

  const providerType = SERVICE_PROVIDER_LABELS[providerProfile.provider_type as ServiceProviderType];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-2 pb-0">
      <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/50 shadow-lg">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-3 flex-1">
            <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-green-700 dark:text-green-300">
                🎉 You're Approved as a {providerType}!
              </AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-400 text-sm">
                Pay ₦{SERVICE_PROVIDER_FEE.toLocaleString()} to appear in the public directory.
              </AlertDescription>
              
              {expanded && (
                <div className="mt-3 space-y-2 bg-background/80 rounded-lg p-3 text-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Bank</p>
                      <p className="font-medium text-sm">{BANK_DETAILS.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-semibold">{BANK_DETAILS.accountNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, 'Account number')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Name</p>
                      <p className="font-medium text-xs">{BANK_DETAILS.accountName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => copyToClipboard(BANK_DETAILS.accountName, 'Account name')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-bold text-primary">₦{SERVICE_PROVIDER_FEE.toLocaleString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => copyToClipboard(SERVICE_PROVIDER_FEE.toString(), 'Amount')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate('/profile')}
                  >
                    Upload Payment Receipt
                  </Button>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-green-700 dark:text-green-300"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    View Bank Details
                  </>
                )}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-green-600 hover:text-green-700 shrink-0"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
