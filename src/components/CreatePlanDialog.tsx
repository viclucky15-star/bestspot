import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DialogTrigger,
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

interface CreatePlanDialogProps {
  children: React.ReactNode;
}

export function CreatePlanDialog({ children }: CreatePlanDialogProps) {
  const navigate = useNavigate();
  const { createEvent } = usePlannedEvents();
  const { locations } = useLocations();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    event_time: '',
    location_id: '',
    description: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) return;
    
    setLoading(true);
    try {
      await createEvent({
        title: formData.title,
        event_date: formData.event_date,
        event_time: formData.event_time || undefined,
        location_id: formData.location_id || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      });
      
      setOpen(false);
      setFormData({
        title: '',
        event_date: '',
        event_time: '',
        location_id: '',
        description: '',
        notes: '',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Plan</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Anniversary Dinner, Weekend Picnic"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
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
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> Description
            </Label>
            <Textarea
              id="description"
              placeholder="What's the plan about?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any reminders or things to prepare?"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.title || !formData.event_date}
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
