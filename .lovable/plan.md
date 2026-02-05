
# Surespot Native App Launch Plan (Android & iOS)

Great news! Your project is already set up with Capacitor and all the necessary dependencies. This plan will guide you through launching Surespot on both the Google Play Store and Apple App Store.

---

## What You'll Need

### For Android
- A computer (Windows, Mac, or Linux)
- Android Studio installed
- Google Play Developer account ($25 one-time fee)

### For iOS
- A Mac computer (required for iOS development)
- Xcode installed from the Mac App Store
- Apple Developer Program membership ($99/year)

---

## Step-by-Step Launch Process

### Step 1: Export & Set Up Locally

1. Click the **"Export to GitHub"** button in Lovable to transfer your project to your own repository
2. Clone the repository to your local machine:
   ```bash
   git clone <your-github-repo-url>
   cd surespot
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Step 2: Add Native Platforms

Run these commands to add Android and iOS support:

```bash
# Add Android platform
npx cap add android

# Add iOS platform (Mac only)
npx cap add ios
```

### Step 3: Build & Sync

```bash
# Build the web app
npm run build

# Sync web assets to native projects
npx cap sync
```

### Step 4: Configure App Icons & Splash Screens

Before submitting to app stores, you'll need proper app icons and splash screens:

**Android** (`android/app/src/main/res/`):
- Create icons in multiple sizes: `mipmap-hdpi`, `mipmap-mdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`
- Add a splash screen in `drawable/`

**iOS** (`ios/App/App/Assets.xcassets/`):
- Add `AppIcon.appiconset` with all required sizes
- Configure `Splash.storyboard`

**Tip**: Use a tool like [Capacitor Assets](https://github.com/ionic-team/capacitor-assets) or online icon generators to create all required sizes from a single image.

### Step 5: Test on Devices/Emulators

```bash
# Run on Android emulator or connected device
npx cap run android

# Run on iOS simulator or connected device (Mac only)
npx cap run ios
```

### Step 6: Prepare for Production

Before submitting to stores, update `capacitor.config.ts` to remove the development server URL:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.18b17956fbce4d2ab62d0fdeb9b0e7b2',
  appName: 'surespot',
  webDir: 'dist',
  // Remove the server block for production
  plugins: {
    AdMob: {
      // Add your production AdMob App IDs here
    }
  }
};
```

---

## Publishing to Google Play Store

1. **Open Android Studio**:
   ```bash
   npx cap open android
   ```

2. **Generate Signed APK/Bundle**:
   - Go to `Build > Generate Signed Bundle/APK`
   - Create a new keystore (keep this file safe - you'll need it for all future updates!)
   - Select "Android App Bundle" for Play Store submission

3. **Create Play Store Listing**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create a new app
   - Fill in app details, screenshots, privacy policy
   - Upload your `.aab` file

4. **Submit for Review**:
   - Complete the content rating questionnaire
   - Set up pricing and distribution
   - Submit for review (usually 1-3 days)

---

## Publishing to Apple App Store

1. **Open Xcode**:
   ```bash
   npx cap open ios
   ```

2. **Configure Signing**:
   - Select your Team in Xcode project settings
   - Enable "Automatically manage signing"
   - Set Bundle Identifier to match your app ID

3. **Archive & Upload**:
   - Select "Any iOS Device" as the build target
   - Go to `Product > Archive`
   - Click "Distribute App" and follow the prompts

4. **Create App Store Listing**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create a new app
   - Fill in app details, screenshots, privacy policy
   - Link your uploaded build

5. **Submit for Review**:
   - Complete App Privacy details
   - Submit for review (usually 1-7 days)

---

## Important Considerations

### AdMob Setup
Your app has AdMob configured with test IDs. Before going live:
1. Create a real AdMob account at [admob.google.com](https://admob.google.com)
2. Create ad units for your app
3. Update `src/services/admob.ts` with your production ad unit IDs
4. Set `USE_TEST_ADS = false`

### App Store Requirements
- **Privacy Policy**: Both stores require a privacy policy URL
- **Screenshots**: Prepare screenshots for different device sizes
- **App Description**: Write compelling store descriptions
- **Age Rating**: Complete content rating questionnaires

### Future Updates
Whenever you make changes in Lovable:
1. Pull the latest changes: `git pull`
2. Rebuild and sync: `npm run build && npx cap sync`
3. Test on device, then submit update to stores

---

## Technical Details

**Current Configuration:**
- **App ID**: `app.lovable.18b17956fbce4d2ab62d0fdeb9b0e7b2`
- **App Name**: `surespot`
- **Capacitor Version**: 8.x
- **Platforms**: Android & iOS ready

**Dependencies Already Installed:**
- `@capacitor/core` - Core Capacitor functionality
- `@capacitor/cli` - Command line tools
- `@capacitor/android` - Android platform support
- `@capacitor/ios` - iOS platform support
- `@capacitor-community/admob` - Mobile ad support

**Mobile-Optimized Features:**
- Safe area handling for notched devices
- Touch-optimized UI components
- Service worker for offline support
- Bottom navigation optimized for mobile

---

## Helpful Resources

For more detailed guidance on the native app build process, check out the Lovable documentation on building mobile apps with Capacitor.
