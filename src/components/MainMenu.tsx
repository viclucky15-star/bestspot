import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Monitor, Clock, Share2, Users, LogOut, ChevronRight, Building2, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useStateSelection, STATES } from '@/hooks/useStateSelection';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types';

interface RecentlyViewed {
  id: string;
  location_id: string;
  viewed_at: string;
  locations: Location;
}

export function MainMenu() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isBusiness, isAdmin } = useUserRole();
  const { selectedState, setSelectedState } = useStateSelection();
  const [open, setOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchRecentlyViewed();
    }
  }, [open, user]);

  const fetchRecentlyViewed = async () => {
    if (!user) return;
    
    setLoadingRecent(true);
    try {
      const { data, error } = await supabase
        .from('recently_viewed')
        .select('id, location_id, viewed_at, locations(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentlyViewed(data as unknown as RecentlyViewed[]);
      }
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-[calc(100%-60px)]">
          <div className="flex-1 overflow-y-auto">
            {/* Theme Section */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme</h3>
              <div className="flex gap-2">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(option.value)}
                    className="flex-1 gap-2"
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* State Selection */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">State</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedState ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedState(null)}
                  className="h-8"
                >
                  All
                </Button>
                {STATES.map((state) => (
                  <Button
                    key={state.name}
                    variant={selectedState === state.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedState(state.name)}
                    className="h-8"
                  >
                    {state.name}
                  </Button>
                ))}
              </div>
            </div>


            {/* Recently Viewed Section */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Recently Viewed</h3>
              </div>
              
              {!user ? (
                <p className="text-sm text-muted-foreground">Sign in to see recently viewed places</p>
              ) : loadingRecent ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentlyViewed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recently viewed places</p>
              ) : (
                <div className="space-y-2">
                  {recentlyViewed.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(`/location/${item.location_id}`)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      {item.locations?.image_url && (
                        <img
                          src={item.locations.image_url}
                          alt={item.locations.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.locations?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.locations?.category}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* My Social Accounts */}
            <button
              onClick={() => handleNavigate('/profile?tab=social')}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b"
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-left">My Social Accounts</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* My Connections */}
            <button
              onClick={() => handleNavigate('/profile?tab=connections')}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-left">My Connections</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Business Dashboard - Only visible to business owners */}
            {isBusiness && (
              <button
                onClick={() => handleNavigate('/business/dashboard')}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b"
              >
                <Building2 className="h-5 w-5 text-primary" />
                <span className="flex-1 text-left font-medium">Business Dashboard</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}

            {/* Admin Panel - Only visible to admins */}
            {isAdmin && (
              <button
                onClick={() => handleNavigate('/admin')}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b"
              >
                <Shield className="h-5 w-5 text-destructive" />
                <span className="flex-1 text-left font-medium">Admin Panel</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Sign Out Button */}
          {user && (
            <div className="p-4 border-t mt-auto">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
