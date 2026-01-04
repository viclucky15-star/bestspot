import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Heart, Calendar, MapPin, LogOut, Camera, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { LocationCard } from '@/components/LocationCard';
import { supabase } from '@/integrations/supabase/client';
import { Profile as ProfileType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { favorites, loading: favsLoading, toggleFavorite, isFavorite } = useFavorites();
  const { upcomingEvents, pastEvents, loading: eventsLoading } = usePlannedEvents();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data as unknown as ProfileType);
      setFullName(data.full_name || '');
      setBio(data.bio || '');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ full_name: fullName, bio }).eq('id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
      setEditOpen(false);
      fetchProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-semibold mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground mb-4">Save favorites, plan dates, and connect with others</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/30 px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-2xl">{profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-2xl font-bold">{profile?.full_name || 'Your Profile'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
                  </div>
                  <Button onClick={handleUpdateProfile} className="w-full">Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {profile?.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}

          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <p className="font-bold text-lg">{favorites.length}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{upcomingEvents.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{pastEvents.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <Tabs defaultValue="favorites">
          <TabsList className="w-full">
            <TabsTrigger value="favorites" className="flex-1 gap-2">
              <Heart className="w-4 h-4" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1 gap-2">
              <Calendar className="w-4 h-4" /> Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-4">
            {favsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No favorites yet</p>
                <Button variant="outline" onClick={() => navigate('/explore')}>Explore Places</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((fav) => fav.location && (
                  <LocationCard
                    key={fav.id}
                    location={fav.location}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(fav.location_id)}
                    onClick={() => navigate(`/location/${fav.location_id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-4 space-y-6">
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 bg-card rounded-xl border">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()}
                        {event.event_time && ` at ${event.event_time}`}
                      </p>
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-primary mt-2">
                          <MapPin className="w-3 h-3" />
                          {event.location.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Past Events</h3>
                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="p-4 bg-muted/50 rounded-xl opacity-70">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingEvents.length === 0 && pastEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No events planned</p>
                <Button variant="outline" onClick={() => navigate('/planner')}>Plan a Date</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Button variant="outline" onClick={handleSignOut} className="w-full mt-8 gap-2 text-destructive">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
