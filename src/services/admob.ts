import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdOptions, RewardAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Test Ad Unit IDs - Replace with your real AdMob Ad Unit IDs in production
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';
const TEST_REWARDED_ANDROID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_REWARDED_IOS = 'ca-app-pub-3940256099942544/1712485313';

// Production Ad Unit IDs - Replace these with your actual AdMob Ad Unit IDs
const PROD_BANNER_ANDROID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_BANNER_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_INTERSTITIAL_ANDROID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_INTERSTITIAL_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_REWARDED_ANDROID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_REWARDED_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

// Set to false in production
const USE_TEST_ADS = true;

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getAdUnitId = (type: 'banner' | 'interstitial' | 'rewarded'): string => {
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  if (USE_TEST_ADS) {
    switch (type) {
      case 'banner':
        return isAndroid ? TEST_BANNER_ANDROID : TEST_BANNER_IOS;
      case 'interstitial':
        return isAndroid ? TEST_INTERSTITIAL_ANDROID : TEST_INTERSTITIAL_IOS;
      case 'rewarded':
        return isAndroid ? TEST_REWARDED_ANDROID : TEST_REWARDED_IOS;
    }
  }
  
  switch (type) {
    case 'banner':
      return isAndroid ? PROD_BANNER_ANDROID : PROD_BANNER_IOS;
    case 'interstitial':
      return isAndroid ? PROD_INTERSTITIAL_ANDROID : PROD_INTERSTITIAL_IOS;
    case 'rewarded':
      return isAndroid ? PROD_REWARDED_ANDROID : PROD_REWARDED_IOS;
  }
};

export const initializeAdMob = async (): Promise<void> => {
  if (!isNativePlatform()) {
    console.log('AdMob: Running on web, skipping initialization');
    return;
  }

  try {
    await AdMob.initialize({
      testingDevices: USE_TEST_ADS ? ['YOUR_DEVICE_ID'] : [],
      initializeForTesting: USE_TEST_ADS,
    });
    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('AdMob initialization failed:', error);
  }
};

export const showBannerAd = async (position: 'top' | 'bottom' = 'bottom'): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    const options: BannerAdOptions = {
      adId: getAdUnitId('banner'),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS,
    };

    await AdMob.showBanner(options);
    console.log('Banner ad shown');
  } catch (error) {
    console.error('Failed to show banner ad:', error);
  }
};

export const hideBannerAd = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await AdMob.hideBanner();
  } catch (error) {
    console.error('Failed to hide banner ad:', error);
  }
};

export const prepareInterstitialAd = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    const options: AdOptions = {
      adId: getAdUnitId('interstitial'),
      isTesting: USE_TEST_ADS,
    };

    await AdMob.prepareInterstitial(options);
    console.log('Interstitial ad prepared');
  } catch (error) {
    console.error('Failed to prepare interstitial ad:', error);
  }
};

export const showInterstitialAd = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await AdMob.showInterstitial();
    console.log('Interstitial ad shown');
  } catch (error) {
    console.error('Failed to show interstitial ad:', error);
  }
};

export const prepareRewardedAd = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    const options: RewardAdOptions = {
      adId: getAdUnitId('rewarded'),
      isTesting: USE_TEST_ADS,
    };

    await AdMob.prepareRewardVideoAd(options);
    console.log('Rewarded ad prepared');
  } catch (error) {
    console.error('Failed to prepare rewarded ad:', error);
  }
};

export const showRewardedAd = async (): Promise<{ rewarded: boolean }> => {
  if (!isNativePlatform()) return { rewarded: false };

  try {
    const result = await AdMob.showRewardVideoAd();
    console.log('Rewarded ad result:', result);
    return { rewarded: true };
  } catch (error) {
    console.error('Failed to show rewarded ad:', error);
    return { rewarded: false };
  }
};
