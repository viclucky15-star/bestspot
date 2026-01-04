import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MapPin, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, useMessages } from '@/hooks/useMessages';
import { Conversation, Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading: convsLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const { messages, loading: msgsLoading, sendMessage } = useMessages(selectedConversation?.id);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage.trim());
    setNewMessage('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-semibold mb-2">Sign in to chat</h2>
          <p className="text-muted-foreground mb-4">Connect with others to plan dates together</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedConversation.other_participant?.avatar_url || ''} />
              <AvatarFallback>{selectedConversation.other_participant?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{selectedConversation.other_participant?.full_name || 'User'}</h2>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.other_participant?.is_online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {msgsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user.id} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="sticky bottom-20 bg-background border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-4">
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-10" />
        </div>
      </div>

      <div className="p-4">
        {convsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <Button variant="outline" onClick={() => navigate('/community')}>
              Find people in Community
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border hover:shadow-md transition-shadow text-left"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conv.other_participant?.avatar_url || ''} />
                  <AvatarFallback>{conv.other_participant?.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{conv.other_participant?.full_name || 'User'}</h3>
                    {conv.last_message && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message?.content || 'No messages yet'}
                  </p>
                </div>
                {(conv.unread_count || 0) > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  const navigate = useNavigate();

  if (message.message_type === 'location' && message.location) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[80%] rounded-2xl p-3 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Shared Location</span>
          </div>
          <button
            onClick={() => navigate(`/location/${message.location!.id}`)}
            className="w-full bg-background/20 rounded-lg p-2 text-left hover:bg-background/30"
          >
            <p className="font-semibold">{message.location.name}</p>
            <p className="text-xs opacity-80">{message.location.area}</p>
          </button>
        </div>
      </div>
    );
  }

  if (message.message_type === 'event_invite' && message.event) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[80%] rounded-2xl p-3 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Event Invitation</span>
          </div>
          <div className="bg-background/20 rounded-lg p-2">
            <p className="font-semibold">{message.event.title}</p>
            <p className="text-xs opacity-80">{new Date(message.event.event_date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <p>{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default Messages;
