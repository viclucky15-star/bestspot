import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessAccount } from '@/hooks/useBusinessAccount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, Check, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createBusinessAccount, hasBusinessAccount, isLoading } = useBusinessAccount();
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_email: '',
    phone_number: '',
    business_type: 'venue',
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isLoading && hasBusinessAccount) {
      navigate('/business');
    }
  }, [isLoading, hasBusinessAccount, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBusinessAccount.mutateAsync(formData);
      setStep(3);
      setTimeout(() => navigate('/business'), 2000);
    } catch (error) {
      console.error('Failed to create business account:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const benefits = [
    'Claim and manage your venue listings',
    'View detailed analytics and insights',
    'Respond to customer inquiries',
    'Promote your locations with featured listings',
    'Access business-only tools and features',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Business Account</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Grow Your Business</h2>
              <p className="text-muted-foreground">
                Join thousands of businesses on tourguide and reach more customers
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What you'll get</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-500" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={() => setStep(2)}>
              Get Started
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Tell us about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    placeholder="Enter your business name"
                    value={formData.business_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_email">Business Email *</Label>
                  <Input
                    id="business_email"
                    type="email"
                    placeholder="business@example.com"
                    value={formData.business_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venue">Venue / Location</SelectItem>
                      <SelectItem value="event_organizer">Event Organizer</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                      <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
                      <SelectItem value="restaurant">Restaurant / Eatery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={!formData.business_name || !formData.business_email || createBusinessAccount.isPending}
              >
                {createBusinessAccount.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome Aboard!</h2>
            <p className="text-muted-foreground mb-6">
              Your business account has been created successfully. Redirecting to your dashboard...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
