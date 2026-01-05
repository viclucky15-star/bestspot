import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';
import { useLocations } from '@/hooks/useLocations';
import { PlannedEvent } from '@/types';

interface EditPlanDialogProps {
  event: PlannedEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanDialog({ event, open, onOpenChange }: EditPlanDialogProps) {
  const { updateEvent } = usePlannedEvents();
  const { locations } = useLocations();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    event_time: '',
    location_id: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        event_date: event.event_date,
        event_time: event.event_time || '',
        location_id: event.location_id || '',
        description: event.description || '',
        notes: event.notes || '',
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !formData.title || !formData.event_date) return;
    
    setLoading(true);
    try {
      await updateEvent(event.id, {
        title: formData.title,
        event_date: formData.event_date,
        event_time: formData.event_time || undefined,
        location_id: formData.location_id || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Plan</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Plan Title *</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Anniversary Dinner"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-date" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date *
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time" className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time
              </Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-location" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </Label>
            <Select
              value={formData.location_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, location_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name} - {loc.area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> Description
            </Label>
            <Textarea
              id="edit-description"
              placeholder="What's the plan about?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Personal Notes</Label>
            <Textarea
              id="edit-notes"
              placeholder="Any reminders or things to prepare?"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !formData.title || !formData.event_date}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
