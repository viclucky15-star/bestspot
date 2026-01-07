import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { useBusinessPayouts } from '@/hooks/usePayments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BanknoteIcon,
} from 'lucide-react';
import { PayoutStatus } from '@/types/business';

// Extended type for business account with wallet fields
interface ExtendedBusinessAccount {
  id: string;
  wallet_balance?: number;
  total_earnings?: number;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
}

export default function BusinessWallet() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { businessAccount: rawBusinessAccount, isLoading: accountLoading } = useBusinessAccount();
  
  // Cast to extended type to access wallet fields
  const businessAccount = rawBusinessAccount as ExtendedBusinessAccount | null;
  
  const { payouts, isLoading: payoutsLoading, requestPayout } = useBusinessPayouts(businessAccount?.id);
  
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!accountLoading && !rawBusinessAccount) {
      navigate('/business/onboarding');
    }
  }, [rawBusinessAccount, accountLoading, navigate]);

  const isLoading = authLoading || accountLoading || payoutsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const walletBalance = businessAccount?.wallet_balance || 0;
  const totalEarnings = businessAccount?.total_earnings || 0;
  const hasBankDetails = businessAccount?.bank_account_number && businessAccount?.bank_name;

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > walletBalance) return;
    if (!hasBankDetails) return;

    await requestPayout.mutateAsync({
      amount,
      bankName: businessAccount?.bank_name || '',
      accountNumber: businessAccount?.bank_account_number || '',
      accountName: businessAccount?.bank_account_name || '',
    });

    setShowWithdrawDialog(false);
    setWithdrawAmount('');
  };

  const getPayoutStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="outline"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Wallet</h1>
            <p className="text-sm text-muted-foreground">
              Manage your earnings and payouts
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Available Balance</p>
                <p className="text-3xl font-bold mt-1">
                  ₦{walletBalance.toLocaleString()}
                </p>
              </div>
              <Wallet className="h-10 w-10 opacity-50" />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div>
                <p className="text-xs opacity-70">Total Earnings</p>
                <p className="font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  ₦{totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => setShowWithdrawDialog(true)}
              disabled={walletBalance < 1000 || !hasBankDetails}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>

        {/* Bank Details Warning */}
        {!hasBankDetails && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <BanknoteIcon className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  Add bank details to withdraw
                </p>
                <p className="text-sm text-muted-foreground">
                  Go to business settings to add your bank account
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/business/settings')}>
                Add Bank
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {!payouts?.length ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No payouts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">₦{payout.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {payout.bank_name} • {payout.account_number.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payout.created_at!), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {getPayoutStatusBadge(payout.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1000"
                max={walletBalance}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: ₦1,000 • Available: ₦{walletBalance.toLocaleString()}
              </p>
            </div>
            {hasBankDetails && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">Payout to:</p>
                <p className="font-medium">{businessAccount?.bank_account_name}</p>
                <p>{businessAccount?.bank_name} • {businessAccount?.bank_account_number}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                !withdrawAmount ||
                parseFloat(withdrawAmount) < 1000 ||
                parseFloat(withdrawAmount) > walletBalance ||
                requestPayout.isPending
              }
            >
              {requestPayout.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Request Payout'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
