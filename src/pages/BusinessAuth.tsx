import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, ArrowLeft, Phone, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


type AuthStep = 'auth' | 'phone' | 'otp' | 'business-info' | 'success';

const BusinessAuth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>('auth');
  
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const [phoneData, setPhoneData] = useState({
    phoneNumber: '',
    otp: '',
    verificationSent: false,
  });

  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessEmail: '',
    businessType: 'venue',
    ownerFullName: '',
  });

  // Redirect if already logged in and has business account
  useEffect(() => {
    if (user && step === 'auth') {
      checkExistingBusinessAccount();
    }
  }, [user]);

  const checkExistingBusinessAccount = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('business_accounts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      navigate('/business');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(authData.email, authData.password);
        if (error) throw error;
        
        // Check if user has a business account
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const { data: businessAccount } = await supabase
            .from('business_accounts')
            .select('id')
            .eq('user_id', currentUser.id)
            .maybeSingle();
          
          if (businessAccount) {
            toast({ title: "Welcome back! 🏢", description: "Redirecting to your business dashboard" });
            navigate('/business');
          } else {
            // Existing user but no business account - go to phone verification
            setStep('phone');
          }
        }
      } else {
        const { error } = await signUp(authData.email, authData.password, authData.fullName);
        if (error) throw error;
        
        toast({ title: "Account created! 🎉", description: "Let's set up your business profile" });
        setBusinessData(prev => ({ ...prev, ownerFullName: authData.fullName }));
        setStep('phone');
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Something went wrong", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneData.phoneNumber || phoneData.phoneNumber.length < 10) {
      toast({ 
        title: "Invalid Phone", 
        description: "Please enter a valid phone number", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Store OTP in profile
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase
          .from('profiles')
          .update({
            phone_number: phoneData.phoneNumber,
            phone_verification_code: otp,
            phone_verification_expires_at: expiresAt,
          })
          .eq('id', currentUser.id);
      }

      // In production, you'd send this via SMS. For now, show it in toast for testing
      toast({ 
        title: "OTP Sent! 📱", 
        description: `For testing: Your OTP is ${otp}`,
      });
      
      setPhoneData(prev => ({ ...prev, verificationSent: true }));
      setStep('otp');
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: "Failed to send OTP", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (phoneData.otp.length !== 6) {
      toast({ 
        title: "Invalid OTP", 
        description: "Please enter the 6-digit code", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Verify OTP
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_verification_code, phone_verification_expires_at')
        .eq('id', currentUser.id)
        .single();

      if (!profile?.phone_verification_code) {
        throw new Error('No verification code found');
      }

      if (new Date(profile.phone_verification_expires_at!) < new Date()) {
        throw new Error('OTP has expired');
      }

      if (profile.phone_verification_code !== phoneData.otp) {
        throw new Error('Invalid OTP');
      }

      // Mark phone as verified
      await supabase
        .from('profiles')
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expires_at: null,
        })
        .eq('id', currentUser.id);

      toast({ title: "Phone Verified! ✅" });
      setStep('business-info');
    } catch (error: any) {
      toast({ 
        title: "Verification Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusinessAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Create business account
      const { error: businessError } = await supabase
        .from('business_accounts')
        .insert({
          user_id: currentUser.id,
          business_name: businessData.businessName,
          business_email: businessData.businessEmail || authData.email,
          phone_number: phoneData.phoneNumber,
          business_type: businessData.businessType,
          owner_full_name: businessData.ownerFullName || authData.fullName,
        });

      if (businessError) throw businessError;

      // Assign business role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: currentUser.id,
          role: 'business',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Role assignment error:', roleError);
      }

      setStep('success');
      setTimeout(() => navigate('/business'), 2000);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create business account", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Claim and manage your venue listings',
    'Receive bookings and payments',
    'View detailed analytics and insights',
    'Respond to customer reviews',
    'Promote your locations',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => step === 'auth' ? navigate('/') : setStep('auth')} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> 
          {step === 'auth' ? 'Back to home' : 'Back'}
        </button>

        {/* Auth Step */}
        {step === 'auth' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">
                {isLogin ? 'Business Login' : 'Register Your Business'}
              </CardTitle>
              <CardDescription>
                {isLogin ? 'Sign in to your business account' : 'Create a business account to manage your venues'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isLogin && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Why register?</p>
                  <ul className="space-y-1.5">
                    {benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        placeholder="Your full name" 
                        className="pl-10" 
                        value={authData.fullName} 
                        onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })} 
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@business.com" 
                      className="pl-10" 
                      value={authData.email} 
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10" 
                      value={authData.password} 
                      onChange={(e) => setAuthData({ ...authData, password: e.target.value })} 
                      required 
                      minLength={6} 
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <button 
                  type="button" 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign in'}
                </button>
                <p className="text-xs text-muted-foreground">
                  Not a business? <a href="/auth" className="text-primary hover:underline">Regular sign up</a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phone Verification Step */}
        {step === 'phone' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Verify Your Phone</CardTitle>
              <CardDescription>
                We'll send a verification code to your phone number
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+234 XXX XXX XXXX" 
                    className="pl-10" 
                    value={phoneData.phoneNumber} 
                    onChange={(e) => setPhoneData({ ...phoneData, phoneNumber: e.target.value })} 
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSendOTP} 
                disabled={loading || !phoneData.phoneNumber}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep('business-info')}
              >
                Skip for now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Enter Code</CardTitle>
              <CardDescription>
                We sent a 6-digit code to {phoneData.phoneNumber}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={phoneData.otp}
                  onChange={(value) => setPhoneData({ ...phoneData, otp: value })}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                className="w-full" 
                onClick={handleVerifyOTP} 
                disabled={loading || phoneData.otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center">
                <button 
                  type="button" 
                  onClick={handleSendOTP} 
                  className="text-sm text-primary hover:underline"
                  disabled={loading}
                >
                  Resend code
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Info Step */}
        {step === 'business-info' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Business Details</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateBusinessAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input 
                    id="businessName" 
                    placeholder="Your business name" 
                    value={businessData.businessName} 
                    onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input 
                    id="businessEmail" 
                    type="email"
                    placeholder="contact@business.com" 
                    value={businessData.businessEmail} 
                    onChange={(e) => setBusinessData({ ...businessData, businessEmail: e.target.value })} 
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to use your account email</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Full Name</Label>
                  <Input 
                    id="ownerName" 
                    placeholder="Legal owner name" 
                    value={businessData.ownerFullName} 
                    onChange={(e) => setBusinessData({ ...businessData, ownerFullName: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'venue', label: 'Venue / Location' },
                      { value: 'hotel', label: 'Hotel' },
                      { value: 'restaurant', label: 'Restaurant' },
                      { value: 'event_organizer', label: 'Event Center' },
                    ].map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={businessData.businessType === type.value ? 'default' : 'outline'}
                        className="h-auto py-3"
                        onClick={() => setBusinessData({ ...businessData, businessType: type.value })}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !businessData.businessName}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Business Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Card className="border-0 shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome Aboard! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Your business account has been created. Redirecting to your dashboard...
              </p>
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BusinessAuth;

