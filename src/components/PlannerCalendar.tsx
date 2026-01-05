import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlannedEvent } from '@/types';
import { format, isSameDay } from 'date-fns';

interface PlannerCalendarProps {
  events: PlannedEvent[];
  onSelectEvent: (event: PlannedEvent) => void;
}

export function PlannerCalendar({ events, onSelectEvent }: PlannerCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const eventDates = events.map(e => new Date(e.event_date));
  
  const eventsOnSelectedDate = selectedDate 
    ? events.filter(e => isSameDay(new Date(e.event_date), selectedDate))
    : [];

  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersStyles = {
    hasEvent: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      borderRadius: '50%',
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Calendar View</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md border mx-auto"
        />
        
        {selectedDate && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            {eventsOnSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {eventsOnSelectedDate.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="w-full text-left p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{event.title}</span>
                      {event.event_time && (
                        <Badge variant="secondary" className="text-xs">
                          {event.event_time}
                        </Badge>
                      )}
                    </div>
                    {event.location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {event.location.name}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events on this day</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
