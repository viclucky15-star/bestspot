import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { permission, isSupported, requestPermission } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const getIcon = () => {
    switch (permission) {
      case 'granted':
        return <BellRing className="h-4 w-4" />;
      case 'denied':
        return <BellOff className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "w-9 h-9 bg-background/50 backdrop-blur-sm relative",
            permission === 'granted' && "text-success"
          )}
        >
          {getIcon()}
          {permission === 'default' && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Push Notifications</h4>
          
          {permission === 'granted' ? (
            <div className="flex items-center gap-2 text-sm text-success">
              <BellRing className="h-4 w-4" />
              <span>Notifications enabled</span>
            </div>
          ) : permission === 'denied' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <BellOff className="h-4 w-4" />
                <span>Notifications blocked</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enable notifications in your browser settings to receive alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Get notified about new messages and upcoming events.
              </p>
              <Button onClick={requestPermission} size="sm" className="w-full">
                Enable Notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
