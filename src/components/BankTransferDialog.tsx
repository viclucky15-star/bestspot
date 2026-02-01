import { useState, useRef } from 'react';
import { Copy, Upload, CheckCircle, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePaymentReceipts, PaymentReceipt } from '@/hooks/usePaymentReceipts';

// Bank details
const BANK_DETAILS = {
  bankName: 'GTBank',
  accountNumber: '0747038903',
  accountName: 'GRAND WORD MEDIA AND PUBLISHERS',
};

interface BankTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  paymentType: 'premium_upgrade' | 'booking';
  metadata?: Record<string, unknown>;
  onSuccess?: () => void;
  existingReceipt?: PaymentReceipt | null;
}

export function BankTransferDialog({
  open,
  onOpenChange,
  amount,
  paymentType,
  metadata,
  onSuccess,
  existingReceipt,
}: BankTransferDialogProps) {
  const { submitReceipt } = usePaymentReceipts();
  const [bankReference, setBankReference] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please upload your transfer receipt');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReceipt.mutateAsync({
        amount,
        receiptFile: selectedFile,
        bankReference: bankReference || undefined,
        paymentType,
        metadata,
      });
      onSuccess?.();
      onOpenChange(false);
      // Reset form
      setSelectedFile(null);
      setBankReference('');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there's an existing pending receipt, show status
  if (existingReceipt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Status</DialogTitle>
            <DialogDescription>
              Your payment is being reviewed
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {existingReceipt.status === 'pending' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Awaiting Approval</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We're reviewing your payment of {formatPrice(existingReceipt.amount)}.
                    You'll be notified once approved.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <p className="text-xs text-muted-foreground">Submitted on</p>
                  <p className="font-medium">
                    {new Date(existingReceipt.created_at).toLocaleDateString('en-NG', {
                      dateStyle: 'medium',
                    })}
                  </p>
                  {existingReceipt.bank_reference && (
                    <>
                      <p className="text-xs text-muted-foreground mt-2">Reference</p>
                      <p className="font-medium">{existingReceipt.bank_reference}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {existingReceipt.status === 'approved' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Payment Approved!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your payment has been verified and approved.
                  </p>
                </div>
              </div>
            )}

            {existingReceipt.status === 'rejected' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Payment Rejected</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {existingReceipt.rejection_reason || 'Your payment was not approved.'}
                  </p>
                </div>
                <Button onClick={() => onOpenChange(false)}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bank Transfer Payment</DialogTitle>
          <DialogDescription>
            Transfer {formatPrice(amount)} to the account below and upload your receipt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bank Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <p className="font-semibold">{BANK_DETAILS.bankName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Account Number</p>
                <p className="font-semibold text-lg">{BANK_DETAILS.accountNumber}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, 'Account number')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Account Name</p>
                <p className="font-medium text-sm">{BANK_DETAILS.accountName}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(BANK_DETAILS.accountName, 'Account name')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Amount to Transfer</p>
                  <p className="font-bold text-xl text-primary">{formatPrice(amount)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(amount.toString(), 'Amount')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              After transferring, upload your receipt below. Your payment will be verified within 24 hours.
            </p>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-3">
            <Label>Upload Transfer Receipt</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload receipt (image or PDF)
                  </span>
                </div>
              </Button>
            )}
          </div>

          {/* Bank Reference (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="reference">Transaction Reference (Optional)</Label>
            <Input
              id="reference"
              placeholder="Enter your bank transaction reference"
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedFile || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Receipt for Verification'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
