import { useEffect, useRef, useCallback } from 'react';
import { 
  initializeAdMob, 
  showBannerAd, 
  hideBannerAd, 
  prepareInterstitialAd, 
  showInterstitialAd,
  prepareRewardedAd,
  showRewardedAd,
  isNativePlatform 
} from '@/services/admob';

export function useAdMob() {
  const initialized = useRef(false);
  const viewCount = useRef(0);

  useEffect(() => {
    if (!initialized.current && isNativePlatform()) {
      initializeAdMob().then(() => {
        initialized.current = true;
        // Pre-load interstitial ad
        prepareInterstitialAd();
      });
    }
  }, []);

  const showBanner = useCallback(async (position: 'top' | 'bottom' = 'bottom') => {
    if (isNativePlatform()) {
      await showBannerAd(position);
    }
  }, []);

  const hideBanner = useCallback(async () => {
    if (isNativePlatform()) {
      await hideBannerAd();
    }
  }, []);

  const triggerInterstitial = useCallback(async () => {
    if (!isNativePlatform()) return;
    
    viewCount.current += 1;
    
    // Show interstitial every 5 views
    if (viewCount.current >= 5) {
      await showInterstitialAd();
      viewCount.current = 0;
      // Prepare next interstitial
      await prepareInterstitialAd();
    }
  }, []);

  const showRewarded = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform()) return false;
    
    await prepareRewardedAd();
    const result = await showRewardedAd();
    return result.rewarded;
  }, []);

  return {
    isNative: isNativePlatform(),
    showBanner,
    hideBanner,
    triggerInterstitial,
    showRewarded,
  };
}
