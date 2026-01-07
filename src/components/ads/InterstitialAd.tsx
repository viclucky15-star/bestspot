import { useEffect } from 'react';
import { useAdMob } from '@/hooks/useAdMob';

interface InterstitialAdProps {
  trigger?: boolean;
}

export function InterstitialAd({ trigger = false }: InterstitialAdProps) {
  const { triggerInterstitial, isNative } = useAdMob();

  useEffect(() => {
    if (trigger && isNative) {
      triggerInterstitial();
    }
  }, [trigger, isNative, triggerInterstitial]);

  // This component doesn't render anything visible
  // It just manages the interstitial ad logic
  return null;
}
