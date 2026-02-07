import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.18b17956fbce4d2ab62d0fdeb9b0e7b2',
  appName: 'Easterni',
  webDir: 'dist',
  server: {
    url: 'https://18b17956-fbce-4d2a-b62d-0fdeb9b0e7b2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    AdMob: {
      // Test App ID - Replace with your real AdMob App ID in production
      // Android: ca-app-pub-3940256099942544~3347511713 (test)
      // iOS: ca-app-pub-3940256099942544~1458002511 (test)
    }
  }
};

export default config;
