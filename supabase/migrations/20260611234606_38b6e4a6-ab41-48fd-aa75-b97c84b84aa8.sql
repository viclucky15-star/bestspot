-- Restrict Realtime channel subscriptions for conversations/messages topics
-- Public RLS on public.messages/conversations already filters postgres_changes payloads,
-- but we additionally lock down realtime.messages (Broadcast/Presence) so users can only
-- subscribe to channels for conversations they participate in.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read conversation realtime topics" ON realtime.messages;
DROP POLICY IF EXISTS "Participants can write conversation realtime topics" ON realtime.messages;

CREATE POLICY "Participants can read conversation realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow topics not related to conversations/messages to pass through
  (realtime.topic() NOT LIKE 'conversation:%'
   AND realtime.topic() NOT LIKE 'messages:%'
   AND realtime.topic() NOT LIKE 'conversations:%')
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = split_part(realtime.topic(), ':', 2)
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Participants can write conversation realtime topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() NOT LIKE 'conversation:%'
   AND realtime.topic() NOT LIKE 'messages:%'
   AND realtime.topic() NOT LIKE 'conversations:%')
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = split_part(realtime.topic(), ':', 2)
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);