# KaamTrack Backend API

A Node.js/Express backend with PostgreSQL database for the KaamTrack attendance and payment tracking app.

## Quick Start (Local Development)

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/kaamtrack"
export JWT_SECRET="your-super-secret-key"
export PORT=3001
```

3. Run the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Deploy to Railway (Recommended)

### Step 1: Push to GitHub
Make sure your code is in a GitHub repository.

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically sets `DATABASE_URL`

### Step 4: Configure Backend Service
1. Click on your backend service
2. Go to "Settings" tab
3. Set **Root Directory** to `backend-reference` (if in subfolder)
4. Go to "Variables" tab
5. Add: `JWT_SECRET` = `your-super-secret-key-here`

### Step 5: Deploy
Railway auto-deploys on every push. Tables are created automatically on first run.

### Step 6: Get Your API URL
After deployment, find your URL in the "Settings" tab under "Domains".
Example: `https://your-app.up.railway.app`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Railway) |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `PORT` | No | Server port (default: 3001, auto-set by Railway) |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new owner
- `POST /api/auth/login` - Login with phone + password
- `GET /api/auth/me` - Get current user (requires token)

### Workers
- `GET /api/workers` - List all workers
- `POST /api/workers` - Add new worker
- `GET /api/workers/:id` - Get worker details
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker (soft delete)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance

### Payments
- `GET /api/payments` - Get payment records
- `POST /api/payments` - Add payment

### Reports
- `GET /api/reports/dashboard` - Get dashboard stats

### Health
- `GET /api/health` - Health check endpoint

## Authentication

All endpoints (except register, login, and health) require a Bearer token:

```
Authorization: Bearer <token>
```

## Example Requests

```bash
# Register
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "phone": "9876543210", "password": "123456", "role": "owner"}'

# Login
curl -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "password": "123456"}'

# Get workers (with token)
curl https://your-app.up.railway.app/api/workers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Schema

The following tables are created automatically:

- **users** - Owner and worker accounts
- **workers** - Worker profiles (linked to owner)
- **attendance** - Daily attendance records
- **payments** - Payment/advance records

## Other Deployment Options

### Render
1. Create a new Web Service
2. Connect your GitHub repo
3. Add PostgreSQL database from Render
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add environment variables

### Heroku
1. Create new app
2. Add Heroku Postgres addon
3. Set `JWT_SECRET` config var
4. Deploy via GitHub or CLI
