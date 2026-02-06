import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, ArrowLeft, Camera, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProviderType, SERVICE_PROVIDER_LABELS, NIGERIAN_STATES } from '@/types/serviceProvider';

type UserType = 'visitor' | 'service_provider';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'visitor' as UserType,
    providerType: '' as ServiceProviderType | '',
    phoneNumber: '',
    state: '',
    area: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('places')
      .upload(filePath, avatarFile, { upsert: true });
    
    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return null;
    }
    
    const { data } = supabase.storage.from('places').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const createServiceProviderProfile = async (userId: string) => {
    if (formData.userType !== 'service_provider' || !formData.providerType) return;

    const { error } = await supabase
      .from('service_providers')
      .insert({
        user_id: userId,
        provider_type: formData.providerType,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        state: formData.state,
        area: formData.area || null,
      });

    if (error) {
      console.error('Error creating service provider profile:', error);
      throw new Error('Failed to create service provider profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        toast({ title: "Welcome back! 💕", description: "You're now signed in" });
        navigate('/');
      } else {
        // Validation for service providers
        if (formData.userType === 'service_provider') {
          if (!formData.providerType) {
            throw new Error('Please select your service type');
          }
          if (!formData.phoneNumber) {
            throw new Error('Phone number is required for service providers');
          }
          if (!formData.state) {
            throw new Error('Please select your state');
          }
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) throw error;
        
        // Get the user after signup
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Upload avatar if provided
          if (avatarFile) {
            const avatarUrl = await uploadAvatar(user.id);
            if (avatarUrl) {
              await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
            }
          }

          // Create service provider profile if applicable
          if (formData.userType === 'service_provider') {
            await createServiceProviderProfile(user.id);
          }
        }
        
        if (formData.userType === 'service_provider') {
          toast({ 
            title: "Account created! 🎉", 
            description: "Your profile is pending admin approval. You'll be notified once approved." 
          });
        } else {
          toast({ title: "Account created! 🎉", description: "Welcome to Surespot" });
        }
        navigate('/');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isServiceProvider = formData.userType === 'service_provider';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>{isLogin ? 'Sign in to continue exploring' : 'Join Surespot today'}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Avatar className="w-20 h-20 border-2 border-dashed border-muted-foreground/50 group-hover:border-primary transition-colors">
                        <AvatarImage src={avatarPreview || undefined} />
                        <AvatarFallback className="bg-muted">
                          <Camera className="w-6 h-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Profile picture (optional)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {/* User Type Selection */}
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <Select
                      value={formData.userType}
                      onValueChange={(value: UserType) => setFormData({ ...formData, userType: value, providerType: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visitor">Visitor / Explorer</SelectItem>
                        <SelectItem value="service_provider">Service Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Provider Type - Only show if service provider is selected */}
                  {isServiceProvider && (
                    <div className="space-y-2">
                      <Label>Service Type *</Label>
                      <Select
                        value={formData.providerType}
                        onValueChange={(value: ServiceProviderType) => setFormData({ ...formData, providerType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your service" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(SERVICE_PROVIDER_LABELS) as ServiceProviderType[]).map((type) => (
                            <SelectItem key={type} value={type}>
                              {SERVICE_PROVIDER_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name {isServiceProvider && '*'}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        placeholder="Your name" 
                        className="pl-10" 
                        value={formData.fullName} 
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required={isServiceProvider}
                      />
                    </div>
                  </div>

                  {/* Phone Number - Required for service providers */}
                  {isServiceProvider && (
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="phoneNumber" 
                          type="tel"
                          placeholder="08012345678" 
                          className="pl-10" 
                          value={formData.phoneNumber} 
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* State - Required for service providers */}
                  {isServiceProvider && (
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Area/City - Optional for service providers */}
                  {isServiceProvider && (
                    <div className="space-y-2">
                      <Label htmlFor="area">City/Area (optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="area" 
                          placeholder="e.g. Enugu, Nsukka" 
                          className="pl-10" 
                          value={formData.area} 
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              {!isLogin && isServiceProvider && (
                <p className="text-xs text-muted-foreground text-center">
                  Service providers require admin approval and payment to be visible to visitors.
                </p>
              )}
            </form>

            <div className="mt-6 text-center space-y-3">
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Are you a business or venue owner?</p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/business/auth')}
                >
                  Register as Business Owner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
