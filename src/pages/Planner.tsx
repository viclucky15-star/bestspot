import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Clock, Navigation, ExternalLink, Pencil, Trash2, CalendarDays, List, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { CreatePlanDialog } from '@/components/CreatePlanDialog';
import { EditPlanDialog } from '@/components/EditPlanDialog';
import { DeletePlanDialog } from '@/components/DeletePlanDialog';
import { PlannerCalendar } from '@/components/PlannerCalendar';
import { PlannedEvent } from '@/types';
import { format } from 'date-fns';

const Planner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, upcomingEvents, pastEvents, loading } = usePlannedEvents();
  
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [editingEvent, setEditingEvent] = useState<PlannedEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<{ id: string; title: string } | null>(null);

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

  const EventCard = ({ event, isPast = false }: { event: PlannedEvent; isPast?: boolean }) => {
    const openMaps = () => {
      if (event.location) {
        const query = encodeURIComponent(`${event.location.name} Enugu Nigeria`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
      }
    };
    const getDirections = () => {
      if (event.location) {
        const query = encodeURIComponent(`${event.location.name} Enugu Nigeria`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
      }
    };

    return (
      <Card className={isPast ? 'opacity-60' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
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
            <div className="flex items-center gap-1">
              <Badge variant={isPast ? 'outline' : 'secondary'}>{isPast ? 'Past' : 'Upcoming'}</Badge>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            {event.location && !isPast && (
              <>
                <Button variant="outline" size="sm" className="flex-1" onClick={openMaps}>
                  <ExternalLink className="w-3 h-3 mr-1" /> Map
                </Button>
                <Button size="sm" className="flex-1" onClick={getDirections}>
                  <Navigation className="w-3 h-3 mr-1" /> Go
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditingEvent(event)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeletingEvent({ id: event.id, title: event.title })}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">My Plans</h1>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('calendar')}
              >
                <CalendarDays className="w-4 h-4" />
              </Button>
            </div>
            <CreatePlanDialog>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> New Plan
              </Button>
            </CreatePlanDialog>
          </div>
        </div>

        {/* Service Providers Quick Access */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Need a Photographer or Tour Guide?</h3>
                  <p className="text-xs text-muted-foreground">Find verified professionals for your events</p>
                </div>
              </div>
              <Button size="sm" variant="default" onClick={() => navigate('/service-providers')}>
                Browse
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">{[1, 2].map((i) => (<div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />))}</div>
        ) : view === 'calendar' ? (
          <PlannerCalendar events={events} onSelectEvent={setEditingEvent} />
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
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3 text-muted-foreground">Past Events</h2>
                <div className="space-y-3">
                  {pastEvents.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} isPast />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <EditPlanDialog
        event={editingEvent}
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
      />
      
      <DeletePlanDialog
        eventId={deletingEvent?.id || null}
        eventTitle={deletingEvent?.title || ''}
        open={!!deletingEvent}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
      />
    </div>
  );
};

export default Planner;
