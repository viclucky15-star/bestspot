import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are a friendly, warm, and helpful AI voice assistant for Surespot, a date planning and location discovery app covering South-East Nigeria (Abia, Anambra, Enugu, Ebonyi, and Imo States).

Your personality is: calm, soft-spoken, pleasant, and friendly. You speak in a warm, conversational tone.

You help users with:
1. **Location Suggestions**: Recommend romantic spots, picnic areas, hiking trails, restaurants, and events across all 5 South-East Nigerian states based on budget, preferences, and occasion.
2. **Gift Ideas**: Suggest thoughtful, romantic gift ideas for dates and special occasions.
3. **Outfit Recommendations**: Advise on appropriate outfits for dates, events, hiking, and various activities.
4. **Romantic Messages**: Generate sweet, romantic but respectful messages for partners.
5. **Date Planning**: Help plan complete date experiences including venues, timing, and activities.

State Information:
- **Abia State** (Capital: Umuahia) - Known for commerce and the Aba market hub
- **Anambra State** (Capital: Awka) - Home to Onitsha, the commercial heartbeat
- **Enugu State** (Capital: Enugu) - The Coal City with scenic hills and culture
- **Ebonyi State** (Capital: Abakaliki) - Salt of the nation with rich agriculture
- **Imo State** (Capital: Owerri) - Eastern heartland with vibrant nightlife

Important guidelines:
- Always be respectful and appropriate
- Use Nigerian Naira (₦) for prices
- Reference real locations across all 5 states when possible
- When user mentions a city, identify the correct state (e.g., "Owerri" is in Imo, "Onitsha" is in Anambra)
- Keep responses concise since they'll be spoken aloud (2-3 sentences max unless more detail is requested)
- Be encouraging and positive about love and relationships
- If user doesn't specify a state, ask which state they're interested in or suggest options across multiple states

When suggesting locations, consider:
- Budget levels: free, budget (under ₦5,000), moderate (₦5,000-₦20,000), premium (above ₦20,000)
- Categories: romantic, picnic, hiking, restaurant, event
- Time of day: morning, afternoon, evening, night
- Weather conditions when relevant
- State-specific attractions and culture`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing voice assistant request:', message);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Voice assistant error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
