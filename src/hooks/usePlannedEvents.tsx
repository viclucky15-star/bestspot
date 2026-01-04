import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PlannedEvent, Location } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface EventInput {
  location_id?: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  notes?: string;
  budget_breakdown?: Record<string, number>;
  schedule?: { time: string; activity: string }[];
}

export function usePlannedEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<PlannedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('planned_events')
        .select(`*, location:locations(*)`)
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((item: any) => ({
        ...item,
        schedule: Array.isArray(item.schedule) ? item.schedule : [],
        budget_breakdown: item.budget_breakdown || {},
      })) as PlannedEvent[];

      setEvents(mapped);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (input: EventInput) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to create events", variant: "destructive" });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('planned_events')
        .insert({ ...input, user_id: user.id } as any)
        .select(`*, location:locations(*)`)
        .single();

      if (error) throw error;

      const newEvent = { ...data, schedule: Array.isArray(data.schedule) ? data.schedule : [], budget_breakdown: data.budget_breakdown || {} } as unknown as PlannedEvent;
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      toast({ title: "Event created! 🎉", description: `${input.title} has been added to your plans` });
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      toast({ title: "Error", description: "Failed to create event", variant: "destructive" });
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventInput>) => {
    try {
      const { error } = await supabase.from('planned_events').update(updates as any).eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      toast({ title: "Event updated", description: "Your changes have been saved" });
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      toast({ title: "Error", description: "Failed to update event", variant: "destructive" });
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('planned_events').delete().eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: "Event deleted", description: "The event has been removed" });
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
      return false;
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming' && new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => e.status === 'completed' || new Date(e.event_date) < new Date());

  return { events, upcomingEvents, pastEvents, loading, createEvent, updateEvent, deleteEvent, refetch: fetchEvents };
}
