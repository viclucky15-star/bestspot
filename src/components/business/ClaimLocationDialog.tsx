import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocationClaims } from '@/hooks/useLocationClaims';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Upload, CheckCircle2, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

const claimSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerFullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Enter a valid phone number'),
});

type ClaimFormData = z.infer<typeof claimSchema>;

interface ClaimLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  locationName: string;
}

export function ClaimLocationDialog({
  open,
  onOpenChange,
  locationId,
  locationName,
}: ClaimLocationDialogProps) {
  const { user } = useAuth();
  const { businessAccount } = useBusinessAccount();
  const { submitClaim } = useLocationClaims();
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState<{
    cac?: string;
    utility?: string;
    signboard?: string;
  }>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      businessName: businessAccount?.business_name || '',
      ownerFullName: '',
      phoneNumber: businessAccount?.phone_number || '',
    },
  });

  const uploadDocument = async (file: File, type: 'cac' | 'utility' | 'signboard') => {
    if (!user) return;
    setUploading(type);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${locationId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-documents')
        .getPublicUrl(fileName);

      setDocuments(prev => ({ ...prev, [type]: publicUrl }));
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async (data: ClaimFormData) => {
    if (!businessAccount) {
      toast.error('Please complete business registration first');
      return;
    }

    if (!documents.cac && !documents.utility && !documents.signboard) {
      toast.error('Please upload at least one proof of ownership document');
      return;
    }

    await submitClaim.mutateAsync({
      location_id: locationId,
      business_id: businessAccount.id,
      business_name: data.businessName,
      owner_full_name: data.ownerFullName,
      phone_number: data.phoneNumber,
      cac_document_url: documents.cac,
      utility_bill_url: documents.utility,
      signboard_photo_url: documents.signboard,
    });

    onOpenChange(false);
    setStep(1);
    setDocuments({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claim {locationName}</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Provide your business details to claim this location'
              : 'Upload proof of ownership documents'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  {...register('businessName')}
                  placeholder="Your business name"
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerFullName">Owner Full Name</Label>
                <Input
                  id="ownerFullName"
                  {...register('ownerFullName')}
                  placeholder="Full name as on documents"
                />
                {errors.ownerFullName && (
                  <p className="text-sm text-destructive">{errors.ownerFullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  placeholder="08012345678"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              <Button type="button" className="w-full" onClick={() => setStep(2)}>
                Continue to Document Upload
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Upload at least one of the following documents:
              </p>

              <div className="space-y-3">
                {/* CAC Document */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">CAC Certificate</span>
                    </div>
                    {documents.cac ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              uploadDocument(e.target.files[0], 'cac');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploading === 'cac'}
                          asChild
                        >
                          <span>
                            {uploading === 'cac' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </span>
                        </Button>
                      </label>
                    )}
                  </div>
                </div>

                {/* Utility Bill */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Utility Bill</span>
                    </div>
                    {documents.utility ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              uploadDocument(e.target.files[0], 'utility');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploading === 'utility'}
                          asChild
                        >
                          <span>
                            {uploading === 'utility' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </span>
                        </Button>
                      </label>
                    )}
                  </div>
                </div>

                {/* Signboard Photo */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Signboard Photo</span>
                    </div>
                    {documents.signboard ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              uploadDocument(e.target.files[0], 'signboard');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploading === 'signboard'}
                          asChild
                        >
                          <span>
                            {uploading === 'signboard' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </span>
                        </Button>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitClaim.isPending || (!documents.cac && !documents.utility && !documents.signboard)}
                >
                  {submitClaim.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Submit Claim'
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
