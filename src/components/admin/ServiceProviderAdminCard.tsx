import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Camera,
  Video,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  Clock,
} from 'lucide-react';
import { ServiceProvider, SERVICE_PROVIDER_LABELS, ServiceProviderType } from '@/types/serviceProvider';

interface ServiceProviderAdminCardProps {
  provider: ServiceProvider;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onMarkPaid: (amount: number) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isMarkingPaid?: boolean;
}

const providerTypeIcons: Record<ServiceProviderType, React.ElementType> = {
  photographer: Camera,
  cinematographer: Video,
  tour_guide: MapPin,
};

export function ServiceProviderAdminCard({
  provider,
  onApprove,
  onReject,
  onMarkPaid,
  isApproving,
  isRejecting,
  isMarkingPaid,
}: ServiceProviderAdminCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('5000');

  const Icon = providerTypeIcons[provider.provider_type];
  const isPending = !provider.is_approved && !provider.rejection_reason;

  const handleReject = () => {
    onReject(rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const handleMarkPaid = () => {
    onMarkPaid(Number(paymentAmount));
    setShowPaymentDialog(false);
  };

  const getStatusBadge = () => {
    if (provider.is_approved && provider.is_paid) {
      return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Live</Badge>;
    }
    if (provider.is_approved && !provider.is_paid) {
      return <Badge variant="secondary"><DollarSign className="h-3 w-3 mr-1" />Awaiting Payment</Badge>;
    }
    if (provider.rejection_reason) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{provider.full_name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {SERVICE_PROVIDER_LABELS[provider.provider_type]}
                  </Badge>
                </div>
                {getStatusBadge()}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{provider.phone_number}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{provider.state}{provider.area ? `, ${provider.area}` : ''}</span>
                </div>
              </div>

              {provider.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {provider.bio}
                </p>
              )}

              {provider.rejection_reason && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                  <span className="font-medium">Rejection reason:</span> {provider.rejection_reason}
                </div>
              )}

              {provider.is_paid && provider.payment_amount && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Paid: ₦{provider.payment_amount.toLocaleString()} on{' '}
                  {provider.payment_date && new Date(provider.payment_date).toLocaleDateString('en-NG')}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {isPending && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={isApproving || isRejecting}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={onApprove}
                      disabled={isApproving || isRejecting}
                    >
                      {isApproving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                  </>
                )}

                {provider.is_approved && !provider.is_paid && (
                  <Button
                    size="sm"
                    onClick={() => setShowPaymentDialog(true)}
                    disabled={isMarkingPaid}
                  >
                    {isMarkingPaid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Mark as Paid
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Provider Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for rejection</Label>
              <Textarea
                placeholder="Explain why this application is being rejected..."
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
              disabled={!rejectReason.trim() || isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Reject Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment Received</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirm that {provider.full_name} has made their listing payment.
            </p>
            <div>
              <Label>Payment Amount (₦)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaid}
              disabled={!paymentAmount || isMarkingPaid}
            >
              {isMarkingPaid ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
