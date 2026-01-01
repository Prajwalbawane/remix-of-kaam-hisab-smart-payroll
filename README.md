# KaamTrack - Worker Attendance & Payment Tracker

<div align="center">
  <h3>📋 Complete solution for managing daily workers, attendance, and payments</h3>
  <p>Built for contractors, small businesses, and anyone who manages daily wage workers</p>
  
  **URL**: https://lovable.dev/projects/aa132419-b32c-4a02-874c-d79076cc75d5
</div>

---

## 📖 About

**KaamTrack** (काम Track) is a comprehensive mobile-first web application designed to help business owners and contractors manage their workforce efficiently. Track daily attendance, manage payments, generate reports, and maintain accurate records - all in one place.

### Key Problems Solved
- 📝 **Manual Record Keeping** - Eliminate paper-based attendance registers
- 💰 **Payment Tracking** - Keep accurate records of wages, advances, and balances
- ⏱️ **Time-Consuming Calculations** - Automatic calculation of earnings and dues
- 📊 **Reporting** - Generate detailed reports for any time period

---

## ✨ Features

### 👥 Worker Management
- Add, edit, and manage worker profiles
- Store worker details (name, phone, daily rate, work type)
- Unique QR code for each worker
- Soft delete to preserve historical data

### 📅 Attendance Tracking
- Mark daily attendance (Present, Absent, Half-day)
- QR code-based quick attendance marking
- Manual attendance entry option
- View attendance history by date range

### 💳 Payment Management
- Record salary payments and advances
- Track payment history per worker
- Calculate pending balances automatically
- Support for multiple payment types

### 📊 Dashboard & Reports
- Real-time statistics overview
- Today's attendance summary
- Monthly earnings and payments
- Export reports to PDF

### 🔐 Role-Based Access
- **Owner Role**: Full access to all features
- **Worker Role**: View personal attendance and payment history

### 📱 Mobile-First Design
- Responsive UI optimized for mobile devices
- Native app support via Capacitor (Android)
- Bottom navigation for easy access
- Touch-friendly interface

### 🌐 Offline Support
- Works without internet connection
- Local storage fallback when backend is offline
- Automatic sync when connection restored

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| React Router | Navigation |
| TanStack Query | Data Fetching |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | API Framework |
| PostgreSQL | Database |
| JWT | Authentication |
| bcrypt | Password Hashing |

### Mobile
| Technology | Purpose |
|------------|---------|
| Capacitor | Native Bridge |
| Android SDK | Android App |

---

## 📁 Project Structure

```
kaamtrack/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components (AppLayout, Navigation)
│   │   ├── workers/         # Worker-related components
│   │   ├── attendance/      # Attendance components
│   │   └── qr/              # QR code components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useApiData.ts    # API data management with offline support
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useLanguage.ts   # Localization hook
│   │   └── useLocalStorage.ts
│   ├── pages/               # Page components
│   │   ├── AuthPage.tsx     # Login/Register with onboarding
│   │   ├── HomePage.tsx     # Dashboard
│   │   ├── WorkersPage.tsx  # Worker list
│   │   ├── WorkerDetailPage.tsx
│   │   ├── AttendancePage.tsx
│   │   ├── PaymentsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── ScanPage.tsx     # QR Scanner
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   └── api.ts           # API client with auth
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── utils/               # Utility functions
│       └── pdfExport.ts
├── backend-reference/       # Backend server code
│   ├── server.js            # Express API server
│   ├── package.json
│   └── .env                 # Environment variables
├── android/                 # Android app (Capacitor)
├── public/                  # Static assets
└── capacitor.config.ts      # Capacitor configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun
- PostgreSQL 14+ (for backend)

### Frontend Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend folder
cd backend-reference

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Start the server
npm run dev
```

The API will be available at `http://localhost:3001`

### Environment Variables

Create a `.env` file in `backend-reference/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kaamtrack
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

---

## 📱 Native Mobile App (Android/iOS)

This app uses **Capacitor** to convert the web app into a native mobile application.

### Prerequisites

1. **Node.js & npm** - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. **Android Studio** - For Android development ([Download](https://developer.android.com/studio))
3. **Xcode** - For iOS development (Mac only, from App Store)

### Add Native Platforms

```bash
# Add Android platform
npx cap add android

# Add iOS platform (Mac only)
npx cap add ios
```

### Build & Sync

```bash
# Build the web app
npm run build

# Sync web code to native platforms
npx cap sync
```

### Run on Device/Emulator

```bash
# Run on Android
npx cap run android

# Run on iOS (Mac only)
npx cap run ios
```

### 🔄 Development Workflow

After making code changes:

```bash
# Pull latest changes (if using Git)
git pull

# Rebuild and sync
npm run build
npx cap sync

# Run the app
npx cap run android
```

### 📲 Live Reload (Development Mode)

The app is configured for live reload during development. The `capacitor.config.ts` has the server URL configured:

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

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (owner/worker) |
| POST | `/api/auth/login` | Login with phone & password |
| GET | `/api/auth/me` | Get current authenticated user |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workers` | List all workers for owner |
| POST | `/api/workers` | Add new worker |
| GET | `/api/workers/:id` | Get worker details |
| PUT | `/api/workers/:id` | Update worker |
| DELETE | `/api/workers/:id` | Soft delete worker |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get attendance records (with date filters) |
| POST | `/api/attendance` | Mark attendance for worker |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | Get payment records |
| POST | `/api/payments` | Add payment/advance |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/dashboard` | Get dashboard statistics |
| GET | `/api/health` | API health check |

---

## 🗄️ Database Schema

```sql
-- Users table (owners and workers with login)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'owner', -- 'owner' or 'worker'
  worker_id UUID REFERENCES workers(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workers table
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  daily_rate DECIMAL(10,2) NOT NULL,
  work_type VARCHAR(100),
  qr_id VARCHAR(50) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'half-day'
  marked_via VARCHAR(20) DEFAULT 'manual', -- 'manual' or 'qr'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(worker_id, date)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'payment' or 'advance'
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Role-Based Access** - Owner and Worker permissions
- **Input Validation** - Server-side validation
- **CORS Protection** - Configured for allowed origins
- **Offline Mode** - Local storage with no sensitive data exposure

---

## 🌍 Localization

The app supports multiple languages:
- 🇺🇸 English (en)
- 🇮🇳 Hindi (hi)

Language can be changed from the Settings page.

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| White screen on app | Run `npm run build && npx cap sync` |
| Changes not reflecting | Run `npx cap sync` after code changes |
| Build errors | Delete `android/` or `ios/` folder and run `npx cap add android/ios` again |
| Camera not working | Check app permissions in device settings |
| Backend offline | App will work in offline mode with local storage |
| Login not working | Ensure backend is running on `localhost:3001` |

---

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Documentation](https://docs.lovable.dev)
- [Lovable Mobile Development Guide](https://docs.lovable.dev/tips-tricks/mobile-development)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 🚀 Deployment

### Web App
Open [Lovable](https://lovable.dev/projects/aa132419-b32c-4a02-874c-d79076cc75d5) and click Share → Publish.

### Custom Domain
Navigate to Project → Settings → Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Made with ❤️ for small businesses and contractors</p>
  <p><strong>KaamTrack</strong> - Track Work, Simplify Life</p>
</div>
