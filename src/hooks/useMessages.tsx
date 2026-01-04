import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Conversation, Message, Profile } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) { setConversations([]); setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipantId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          const [profileResult, messageResult, unreadResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', otherParticipantId).single(),
            supabase.from('messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('messages').select('id', { count: 'exact' }).eq('conversation_id', conv.id).eq('is_read', false).neq('sender_id', user.id),
          ]);
          return { ...conv, other_participant: profileResult.data as Profile, last_message: messageResult.data as Message, unread_count: unreadResult.count || 0 } as Conversation;
        })
      );
      setConversations(conversationsWithDetails);
    } catch (err) { console.error('Error fetching conversations:', err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('conversations-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchConversations()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  const startConversation = async (otherUserId: string) => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return null; }
    const existing = conversations.find(c => c.participant_1 === otherUserId || c.participant_2 === otherUserId);
    if (existing) return existing;

    try {
      const [p1, p2] = [user.id, otherUserId].sort();
      const { data, error } = await supabase.from('conversations').insert({ participant_1: p1, participant_2: p2 }).select().single();
      if (error && error.code === '23505') {
        const { data: existingConv } = await supabase.from('conversations').select('*').or(`and(participant_1.eq.${p1},participant_2.eq.${p2}),and(participant_1.eq.${p2},participant_2.eq.${p1})`).single();
        return existingConv;
      }
      if (error) throw error;
      await fetchConversations();
      return data;
    } catch (err) { console.error('Error:', err); return null; }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  return { conversations, loading, startConversation, totalUnread, refetch: fetchConversations };
}

export function useMessages(conversationId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('messages').select(`*, sender:profiles(*), location:locations(*), event:planned_events(*)`).eq('conversation_id', conversationId).order('created_at', { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map((m: any) => ({ ...m, event: m.event ? { ...m.event, schedule: Array.isArray(m.event.schedule) ? m.event.schedule : [] } : null })) as Message[];
      setMessages(mapped);
      if (user) await supabase.from('messages').update({ is_read: true }).eq('conversation_id', conversationId).neq('sender_id', user.id).eq('is_read', false);
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  }, [conversationId, user]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`messages-${conversationId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, async (payload) => {
      const { data } = await supabase.from('messages').select(`*, sender:profiles(*), location:locations(*), event:planned_events(*)`).eq('id', payload.new.id).single();
      if (data) {
        const mapped = {
          ...data,
          event: data.event ? { ...data.event, schedule: Array.isArray(data.event.schedule) ? data.event.schedule : [], budget_breakdown: data.event.budget_breakdown || {} } : null
        } as unknown as Message;
        setMessages(prev => [...prev, mapped]);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const sendMessage = async (content: string, messageType: 'text' | 'location' | 'event_invite' = 'text', locationId?: string, eventId?: string) => {
    if (!user || !conversationId) return null;
    try {
      const { data, error } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, content, message_type: messageType, location_id: locationId, event_id: eventId }).select(`*, sender:profiles(*), location:locations(*), event:planned_events(*)`).single();
      if (error) throw error;
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      const mapped = {
        ...data,
        event: data.event ? { ...data.event, schedule: Array.isArray(data.event.schedule) ? data.event.schedule : [], budget_breakdown: data.event.budget_breakdown || {} } : null
      } as unknown as Message;
      return mapped;
    } catch (err) { console.error('Error:', err); return null; }
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
