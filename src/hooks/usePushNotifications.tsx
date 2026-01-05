import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled! You\'ll be notified about messages and events.');
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications blocked. Enable them in browser settings.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(({ title, body, icon, tag, data }: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag,
        data,
        badge: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (data?.url) {
          window.location.href = data.url as string;
        }
      };

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const notifyNewMessage = useCallback((senderName: string, messagePreview: string) => {
    sendNotification({
      title: `New message from ${senderName}`,
      body: messagePreview.length > 50 ? messagePreview.slice(0, 50) + '...' : messagePreview,
      tag: 'new-message',
      data: { url: '/messages' },
    });
  }, [sendNotification]);

  const notifyUpcomingEvent = useCallback((eventTitle: string, eventTime: string) => {
    sendNotification({
      title: 'Upcoming Event Reminder',
      body: `${eventTitle} is scheduled for ${eventTime}`,
      tag: 'upcoming-event',
      data: { url: '/planner' },
    });
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    notifyNewMessage,
    notifyUpcomingEvent,
  };
}
