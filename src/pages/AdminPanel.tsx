import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminLocationClaims } from '@/hooks/useLocationClaims';
import { useAdminPaymentReceipts, PaymentReceiptWithUser } from '@/hooks/usePaymentReceipts';
import { useAdminServiceProviders } from '@/hooks/useAdminServiceProviders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceProviderAdminCard } from '@/components/admin/ServiceProviderAdminCard';
import {
  ArrowLeft,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  Loader2,
  ExternalLink,
  Receipt,
  Crown,
  CalendarIcon,
  Camera,
} from 'lucide-react';
import { LocationClaim, VerificationStatus } from '@/types/business';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { claims, isLoading, updateClaimStatus } = useAdminLocationClaims();
  const { 
    pendingReceipts, 
    reviewedReceipts, 
    isLoading: receiptsLoading,
    approveReceipt,
    rejectReceipt,
  } = useAdminPaymentReceipts();
  
  const {
    pendingProviders,
    approvedProviders,
    isLoading: providersLoading,
    approveProvider,
    rejectProvider,
    markAsPaid,
  } = useAdminServiceProviders();
  
  const [selectedClaim, setSelectedClaim] = useState<LocationClaim | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  // Payment receipt state
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceiptWithUser | null>(null);
  const [receiptRejectReason, setReceiptRejectReason] = useState('');
  const [showReceiptRejectDialog, setShowReceiptRejectDialog] = useState(false);
  const [showReceiptImageDialog, setShowReceiptImageDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  if (authLoading || roleLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const pendingClaims = claims?.filter(c => c.status === 'pending') || [];
  const reviewedClaims = claims?.filter(c => c.status !== 'pending') || [];

  const handleApprove = async (claim: LocationClaim) => {
    await updateClaimStatus.mutateAsync({
      claimId: claim.id,
      status: 'approved' as VerificationStatus,
    });
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    
    await updateClaimStatus.mutateAsync({
      claimId: selectedClaim.id,
      status: 'rejected' as VerificationStatus,
      rejectionReason: rejectReason,
    });
    
    setShowRejectDialog(false);
    setSelectedClaim(null);
    setRejectReason('');
  };

  const openRejectDialog = (claim: LocationClaim) => {
    setSelectedClaim(claim);
    setShowRejectDialog(true);
  };

  // Payment receipt handlers
  const handleApproveReceipt = async (receipt: PaymentReceiptWithUser) => {
    await approveReceipt.mutateAsync(receipt.id);
  };

  const handleRejectReceipt = async () => {
    if (!selectedReceipt) return;
    
    await rejectReceipt.mutateAsync({
      receiptId: selectedReceipt.id,
      reason: receiptRejectReason,
    });
    
    setShowReceiptRejectDialog(false);
    setSelectedReceipt(null);
    setReceiptRejectReason('');
  };

  const openReceiptRejectDialog = (receipt: PaymentReceiptWithUser) => {
    setSelectedReceipt(receipt);
    setShowReceiptRejectDialog(true);
  };

  const openReceiptImageDialog = (receipt: PaymentReceiptWithUser) => {
    setSelectedReceipt(receipt);
    setShowReceiptImageDialog(true);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReceiptStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'premium_upgrade':
        return <Badge variant="outline" className="border-amber-500 text-amber-600"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
      case 'booking':
        return <Badge variant="outline" className="border-primary text-primary"><CalendarIcon className="h-3 w-3 mr-1" />Booking</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage claims, payments, and platform settings</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingClaims.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingReceipts.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {claims?.filter(c => c.status === 'approved').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingProviders.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Providers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="payments">
              Payments ({pendingReceipts.length})
            </TabsTrigger>
            <TabsTrigger value="providers">
              Providers ({pendingProviders.length})
            </TabsTrigger>
            <TabsTrigger value="claims">
              Claims ({pendingClaims.length})
            </TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Payment Receipts Tab */}
          <TabsContent value="payments" className="space-y-4">
            {receiptsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : pendingReceipts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <h3 className="font-semibold">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending payments to review</p>
                </CardContent>
              </Card>
            ) : (
              pendingReceipts.map((receipt) => (
                <Card key={receipt.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Receipt Thumbnail */}
                      <button
                        onClick={() => openReceiptImageDialog(receipt)}
                        className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={receipt.receipt_url}
                          alt="Receipt"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>';
                          }}
                        />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{receipt.profiles?.full_name || 'Unknown User'}</h3>
                              {getPaymentTypeBadge(receipt.payment_type)}
                            </div>
                            <p className="text-xl font-bold text-primary">{formatPrice(receipt.amount)}</p>
                          </div>
                          {getReceiptStatusBadge(receipt.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>{' '}
                            {new Date(receipt.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                          </div>
                          {receipt.bank_reference && (
                            <div>
                              <span className="text-muted-foreground">Reference:</span>{' '}
                              {receipt.bank_reference}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReceiptImageDialog(receipt)}
                          >
                            <Image className="h-4 w-4 mr-1" />
                            View Receipt
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openReceiptRejectDialog(receipt)}
                            disabled={approveReceipt.isPending || rejectReceipt.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveReceipt(receipt)}
                            disabled={approveReceipt.isPending || rejectReceipt.isPending}
                          >
                            {approveReceipt.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Reviewed Payments History */}
            {reviewedReceipts.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Review History</h3>
                <div className="space-y-2">
                  {reviewedReceipts.slice(0, 10).map((receipt) => (
                    <Card key={receipt.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{receipt.profiles?.full_name || 'Unknown'}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatPrice(receipt.amount)}
                          </span>
                          {getPaymentTypeBadge(receipt.payment_type)}
                        </div>
                        {getReceiptStatusBadge(receipt.status)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Service Providers Tab */}
          <TabsContent value="providers" className="space-y-4">
            {providersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : pendingProviders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <h3 className="font-semibold">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending provider applications</p>
                </CardContent>
              </Card>
            ) : (
              pendingProviders.map((provider) => (
                <ServiceProviderAdminCard
                  key={provider.id}
                  provider={provider}
                  onApprove={() => approveProvider.mutate(provider.id)}
                  onReject={(reason) => rejectProvider.mutate({ providerId: provider.id, reason })}
                  onMarkPaid={(amount) => markAsPaid.mutate({ providerId: provider.id, amount })}
                  isApproving={approveProvider.isPending}
                  isRejecting={rejectProvider.isPending}
                  isMarkingPaid={markAsPaid.isPending}
                />
              ))
            )}

            {/* Approved Providers Awaiting Payment */}
            {approvedProviders.filter(p => !p.is_paid).length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Awaiting Payment</h3>
                <div className="space-y-4">
                  {approvedProviders.filter(p => !p.is_paid).map((provider) => (
                    <ServiceProviderAdminCard
                      key={provider.id}
                      provider={provider}
                      onApprove={() => {}}
                      onReject={() => {}}
                      onMarkPaid={(amount) => markAsPaid.mutate({ providerId: provider.id, amount })}
                      isMarkingPaid={markAsPaid.isPending}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Live Providers */}
            {approvedProviders.filter(p => p.is_paid).length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Live Providers ({approvedProviders.filter(p => p.is_paid).length})</h3>
                <div className="space-y-2">
                  {approvedProviders.filter(p => p.is_paid).slice(0, 10).map((provider) => (
                    <Card key={provider.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{provider.full_name}</span>
                          <Badge variant="outline">{provider.provider_type}</Badge>
                          <span className="text-sm text-muted-foreground">{provider.state}</span>
                        </div>
                        <Badge className="bg-green-600">Live</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : pendingClaims.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <h3 className="font-semibold">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">No pending claims to review</p>
                </CardContent>
              </Card>
            ) : (
              pendingClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {claim.locations?.image_url && (
                        <img
                          src={claim.locations.image_url}
                          alt={claim.locations.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{claim.locations?.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {claim.locations?.area}, {claim.locations?.state}
                            </p>
                          </div>
                          {getStatusBadge(claim.status)}
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Business:</span>{' '}
                            {claim.business_name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Owner:</span>{' '}
                            {claim.owner_full_name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span>{' '}
                            {claim.phone_number}
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {claim.cac_document_url && (
                            <a
                              href={claim.cac_document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
                            >
                              <FileText className="h-3 w-3" />
                              CAC Document
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {claim.utility_bill_url && (
                            <a
                              href={claim.utility_bill_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
                            >
                              <FileText className="h-3 w-3" />
                              Utility Bill
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {claim.signboard_photo_url && (
                            <a
                              href={claim.signboard_photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
                            >
                              <Image className="h-3 w-3" />
                              Signboard Photo
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openRejectDialog(claim)}
                            disabled={updateClaimStatus.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(claim)}
                            disabled={updateClaimStatus.isPending}
                          >
                            {updateClaimStatus.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Reviewed Claims History */}
            {reviewedClaims.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Review History</h3>
                <div className="space-y-2">
                  {reviewedClaims.slice(0, 10).map((claim) => (
                    <Card key={claim.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{claim.locations?.name}</span>
                          <span className="text-sm text-muted-foreground">
                            by {claim.business_name}
                          </span>
                        </div>
                        {getStatusBadge(claim.status)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="venues">
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold">No pending venues</h3>
                <p className="text-sm text-muted-foreground">
                  New venue submissions will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Label>Commission Rate</Label>
                    <p className="text-2xl font-bold mt-1">10%</p>
                    <p className="text-xs text-muted-foreground">Per booking</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Label>Minimum Payout</Label>
                    <p className="text-2xl font-bold mt-1">₦1,000</p>
                    <p className="text-xs text-muted-foreground">Minimum withdrawal</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <Label>Bank Account (for payments)</Label>
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold">GTBank - 0747038903</p>
                    <p className="text-sm text-muted-foreground">GRAND WORD MEDIA AND PUBLISHERS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Claim Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for rejection</Label>
              <Textarea
                placeholder="Explain why this claim is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || updateClaimStatus.isPending}
            >
              {updateClaimStatus.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reject Claim'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Receipt Dialog */}
      <Dialog open={showReceiptRejectDialog} onOpenChange={setShowReceiptRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for rejection</Label>
              <Textarea
                placeholder="Explain why this payment is being rejected..."
                value={receiptRejectReason}
                onChange={(e) => setReceiptRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectReceipt}
              disabled={!receiptRejectReason.trim() || rejectReceipt.isPending}
            >
              {rejectReceipt.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reject Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Receipt Image Dialog */}
      <Dialog open={showReceiptImageDialog} onOpenChange={setShowReceiptImageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="aspect-auto max-h-[60vh] overflow-auto rounded-lg border">
                <img
                  src={selectedReceipt.receipt_url}
                  alt="Receipt"
                  className="w-full h-auto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount:</span>{' '}
                  <span className="font-semibold">{formatPrice(selectedReceipt.amount)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  {getPaymentTypeBadge(selectedReceipt.payment_type)}
                </div>
                <div>
                  <span className="text-muted-foreground">User:</span>{' '}
                  {selectedReceipt.profiles?.full_name || 'Unknown'}
                </div>
                {selectedReceipt.bank_reference && (
                  <div>
                    <span className="text-muted-foreground">Reference:</span>{' '}
                    {selectedReceipt.bank_reference}
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <a
                  href={selectedReceipt.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in New Tab
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
