import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Loader2, Send, Crown, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { usePremiumPayment } from '@/hooks/usePremiumPayment';
import { usePaymentReceipts } from '@/hooks/usePaymentReceipts';
import { useAuth } from '@/hooks/useAuth';
import { BankTransferDialog } from '@/components/BankTransferDialog';
import tourguideLogo from '@/assets/tourguide-logo.png.asset.json';
const aiAssistantIcon = tourguideLogo.url;

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isPremium, isLoading: isPremiumLoading } = usePremiumStatus();
  const { premiumPrice } = usePremiumPayment();
  const { getPendingReceipt } = usePaymentReceipts();
  const { user } = useAuth();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Check for pending premium receipt
  const pendingReceipt = getPendingReceipt('premium_upgrade');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition (Web Speech API fallback)
  const startListening = useCallback(() => {
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionConstructor) {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser.',
      });
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-NG';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);
      
      if (result.isFinal) {
        handleSendMessage(text);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not recognize speech. Please try again.',
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setTranscript('');
    setInputText('');

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Get AI response
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: {
          message: text,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakResponse(data.reply);
      }
    } catch (error) {
      console.error('Voice assistant error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      // Speak error message too if voice is enabled
      if (voiceEnabled) {
        speakResponse("I'm sorry, I encountered an error. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS if ElevenLabs fails
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleSendMessage(inputText);
    }
  };

  const handleUpgrade = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setShowPaymentDialog(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden animate-pulse"
        aria-label="Open voice assistant"
      >
        <div className="relative">
          <img src={aiAssistantIcon} alt="Date Assistant" className="w-14 h-14 object-cover" />
          {!isPremium && !isPremiumLoading && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
      </button>
    );
  }

  // Show pending payment status if user has submitted a receipt
  if (pendingReceipt && !isPremium && !isPremiumLoading) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t rounded-t-3xl shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <img src={aiAssistantIcon} alt="Date Assistant" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">Date Assistant</h3>
                <p className="text-xs text-muted-foreground">Payment Pending</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Pending Payment Content */}
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Payment Being Verified</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Your payment is being reviewed. You'll get access once approved.
              </p>
            </div>

            <Button 
              variant="outline"
              onClick={() => setShowPaymentDialog(true)}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              View Status
            </Button>

            <p className="text-xs text-muted-foreground">
              ⏳ Usually verified within 24 hours
            </p>
          </div>
        </div>

        <BankTransferDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          amount={premiumPrice}
          paymentType="premium_upgrade"
          existingReceipt={pendingReceipt}
        />
      </>
    );
  }

  // Show premium upgrade prompt for non-premium users
  if (!isPremium && !isPremiumLoading) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t rounded-t-3xl shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <img src={aiAssistantIcon} alt="Date Assistant" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold">Date Assistant</h3>
                <p className="text-xs text-muted-foreground">Premium Feature</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Premium Upgrade Content */}
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Unlock AI Date Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Your personal AI companion to help plan the perfect date with voice interactions and personalized suggestions.
              </p>
            </div>

            <div className="space-y-2 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Voice-enabled conversations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Personalized date suggestions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Gift and activity ideas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Romantic message templates</span>
              </div>
            </div>

            <Button 
              onClick={handleUpgrade}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full max-w-xs"
            >
              <Crown className="w-4 h-4" />
              {user ? `Upgrade for ${formatPrice(premiumPrice)}` : 'Sign in to Upgrade'}
            </Button>

            <p className="text-xs text-muted-foreground">
              ✨ One-time payment • Lifetime access
            </p>
          </div>
        </div>

        <BankTransferDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          amount={premiumPrice}
          paymentType="premium_upgrade"
        />
      </>
    );
  }

  return (
    <>
      <audio ref={audioRef} className="hidden" />
      
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] bg-background border-t rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <img src={aiAssistantIcon} alt="Date Assistant" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold">Date Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : isProcessing ? 'Thinking...' : 'Ask me anything'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <img src={aiAssistantIcon} alt="Date Assistant" className="w-16 h-16 mx-auto mb-3 rounded-full opacity-80" />
              <p className="text-sm">Hi! I'm your date planning assistant.</p>
              <p className="text-xs mt-1">Ask me for location suggestions, gift ideas, or romantic messages!</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-primary/50 text-primary-foreground rounded-br-sm">
                <p className="text-sm italic">{transcript}...</p>
              </div>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t space-y-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <Button
              type="button"
              size="icon"
              variant={voiceEnabled ? 'default' : 'outline'}
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isSpeaking && voiceEnabled) {
                  stopSpeaking();
                }
              }}
              className="shrink-0"
              title={voiceEnabled ? 'Voice responses on' : 'Voice responses off'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or tap the mic to speak..."
              disabled={isListening || isProcessing}
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant={isListening ? 'destructive' : 'outline'}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className="shrink-0"
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button type="submit" size="icon" disabled={!inputText.trim() || isProcessing} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-center text-muted-foreground">
            {isListening
              ? 'Speak now... tap mic to stop'
              : isSpeaking
              ? 'Speaking... tap speaker to toggle voice'
              : voiceEnabled
              ? 'Voice responses enabled'
              : 'Voice responses disabled'}
          </p>
        </div>
      </div>
    </>
  );
};
