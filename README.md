# KaamTrack - Worker Attendance Management

## Project Info

**URL**: https://lovable.dev/projects/aa132419-b32c-4a02-874c-d79076cc75d5

A comprehensive worker attendance tracking system with QR code scanning, reports, and multi-language support.

---

## 📱 Native Mobile App Setup (Android/iOS)

This app uses **Capacitor** to convert the web app into a native mobile application.

### Prerequisites

1. **Node.js & npm** - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. **Android Studio** - For Android development ([Download](https://developer.android.com/studio))
3. **Xcode** - For iOS development (Mac only, from App Store)

### Step-by-Step Guide

#### Step 1: Clone & Setup Project

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
```

#### Step 2: Add Native Platforms

```bash
# Add Android platform
npx cap add android

# Add iOS platform (Mac only)
npx cap add ios
```

#### Step 3: Build & Sync

```bash
# Build the web app
npm run build

# Sync web code to native platforms
npx cap sync
```

#### Step 4: Run on Device/Emulator

```bash
# Run on Android
npx cap run android

# Run on iOS (Mac only)
npx cap run ios
```

### 🔄 Development Workflow

After making code changes in Lovable:

```bash
# Pull latest changes
git pull

# Rebuild and sync
npm run build
npx cap sync

# Run the app
npx cap run android
```

### 📲 Live Reload (Development Mode)

The app is configured for live reload during development. Changes made in Lovable will reflect in the native app automatically when connected to the same network.

**Note**: The `capacitor.config.ts` has the server URL configured for hot-reload:
```typescript
server: {
  url: 'https://aa132419-b32c-4a02-874c-d79076cc75d5.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

### 🏗️ Building for Production

For production builds, remove the `server` section from `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.aa132419b32c4a02874cd79076cc75d5',
  appName: 'KaamTrack',
  webDir: 'dist'
  // Remove server section for production
};
```

Then build:

```bash
npm run build
npx cap sync
```

#### Android APK/AAB

1. Open Android Studio: `npx cap open android`
2. Build → Generate Signed Bundle/APK
3. Follow the signing wizard

#### iOS IPA

1. Open Xcode: `npx cap open ios`
2. Product → Archive
3. Distribute App → Follow wizard

### 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| White screen on app | Run `npm run build && npx cap sync` |
| Changes not reflecting | Run `npx cap sync` after `git pull` |
| Build errors | Delete `android/` or `ios/` folder and run `npx cap add android/ios` again |
| Camera not working | Check app permissions in device settings |

### 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Mobile Development Guide](https://docs.lovable.dev/tips-tricks/mobile-development)

---

## 🖥️ Web Development

### Local Development

```bash
npm install
npm run dev
```

### Technologies Used

- **Vite** - Build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - UI components
- **Tailwind CSS** - Styling
- **Capacitor** - Native mobile

---

## 🚀 Deployment

### Web App
Open [Lovable](https://lovable.dev/projects/aa132419-b32c-4a02-874c-d79076cc75d5) and click Share → Publish.

### Custom Domain
Navigate to Project → Settings → Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
