import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePlannedEvents } from '@/hooks/usePlannedEvents';

interface DeletePlanDialogProps {
  eventId: string | null;
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePlanDialog({ eventId, eventTitle, open, onOpenChange }: DeletePlanDialogProps) {
  const { deleteEvent } = usePlannedEvents();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      await deleteEvent(eventId);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Plan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{eventTitle}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
