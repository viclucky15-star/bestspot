import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { format } from 'date-fns';

const Planner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { upcomingEvents, pastEvents, loading } = usePlannedEvents();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Plan Your Dates</h2>
            <p className="text-muted-foreground mb-4">Sign in to create and manage your date plans</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">My Plans</h1>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Plan
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">{[1, 2].map((i) => (<div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />))}</div>
        ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">No plans yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Start planning your perfect date!</p>
              <Button onClick={() => navigate('/explore')}>Browse Locations</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3">Upcoming</h2>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {event.location.name}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {format(new Date(event.event_date), 'MMM d, yyyy')}
                              {event.event_time && ` at ${event.event_time}`}
                            </p>
                          </div>
                          <Badge variant="secondary">Upcoming</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3 text-muted-foreground">Past Events</h2>
                <div className="space-y-3 opacity-60">
                  {pastEvents.slice(0, 3).map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{format(new Date(event.event_date), 'MMM d, yyyy')}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
