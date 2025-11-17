# GrowTrack - AI-Powered Habit Tracking Application

GrowTrack is a comprehensive habit tracking platform that leverages AI to provide personalized coaching, insights, and motivation to help users build and maintain healthy habits.

## 🚀 Features

- **Habit Management**: Create, track, pause, and archive habits
- **Streak Tracking**: Visual streak counters and progress tracking
- **AI-Powered Coaching**: Get personalized insights, motivation, and recommendations
- **Analytics Dashboard**: Daily, weekly, and monthly analytics with charts
- **Smart Reminders**: AI-optimized notification timing via FCM
- **Multi-language Support**: English and Arabic (RTL support)
- **Dark Mode**: Light and dark themes
- **Responsive Design**: Mobile-first, works on all devices

## 🛠️ Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS 3.7.1
- React Router DOM
- Recharts for data visualization
- React Hot Toast for notifications
- i18next for internationalization
- Firebase SDK for authentication

### Backend
- Node.js + Express
- Firebase Admin SDK
- Google Gemini AI (gemini-1.5-flash)
- Firebase Cloud Messaging (FCM)
- node-cron for scheduled tasks

### Database
- Firebase Firestore

## 📁 Project Structure

```
GrowTrack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   ├── habits.js
│   │   │   ├── reminders.js
│   │   │   ├── analytics.js
│   │   │   ├── feedback.js
│   │   │   └── ai.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── fcmService.js
│   │   │   └── cronService.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── layouts/
│   │   ├── utils/
│   │   ├── i18n/
│   │   ├── config/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Firebase Authentication enabled
- Google Gemini API key
- FCM server key (for push notifications)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=5000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# AI Configuration
AI_MODEL=gemini-1.5-flash
AI_API_KEY=your-gemini-api-key

# FCM Configuration
FCM_SERVER_KEY=your-fcm-server-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

5. Get Firebase Admin SDK credentials:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Copy the values to your `.env` file

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

5. Get Firebase Web App credentials:
   - Go to Firebase Console → Project Settings → General
   - Scroll to "Your apps" and add a web app if you haven't
   - Copy the config values to your `.env` file

6. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication

3. **Enable Firestore**
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)

4. **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Habits
    match /habits/{habitId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Reminders
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Analytics
    match /analytics/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // AI Feedback
    match /ai_feedback/{feedbackId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

5. **Enable Cloud Messaging**
   - Go to Project Settings → Cloud Messaging
   - Copy the Server Key for backend use
   - For frontend, you may need to set up a VAPID key

## 🤖 AI Integration (Gemini)

1. Get a Gemini API key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your backend `.env` file

2. The AI service uses `gemini-1.5-flash` by default, which you can change in the `.env` file.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/update` - Update user profile
- `DELETE /api/user/deactivate` - Deactivate account

### Habits
- `POST /api/habits/create` - Create habit
- `GET /api/habits/all` - Get all habits
- `GET /api/habits/:id` - Get single habit
- `PATCH /api/habits/:id/update` - Update habit
- `PATCH /api/habits/:id/pause` - Pause/resume habit
- `PATCH /api/habits/:id/archive` - Archive habit
- `POST /api/habits/:id/checkIn` - Check in to habit

### Reminders
- `POST /api/reminders/create` - Create reminder
- `GET /api/reminders/user` - Get user reminders
- `PATCH /api/reminders/:id/update` - Update reminder
- `DELETE /api/reminders/:id/delete` - Delete reminder

### Analytics
- `GET /api/analytics/daily` - Get daily analytics
- `GET /api/analytics/weekly` - Get weekly analytics
- `GET /api/analytics/monthly` - Get monthly analytics
- `GET /api/analytics/categories` - Get category breakdown

### AI
- `POST /api/ai/analyzeProgress` - Analyze user progress
- `POST /api/ai/getMotivation` - Get motivational message
- `POST /api/ai/recommendHabits` - Get habit recommendations
- `POST /api/ai/detectInactiveUser` - Detect inactive users
- `POST /api/ai/forecastStreakRisk` - Forecast streak risks

### Feedback
- `POST /api/feedback/rateAI` - Rate AI features
- `POST /api/feedback/reportIssue` - Report an issue
- `GET /api/feedback/all` - Get all feedback

## 🚀 Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Add environment variables in Vercel dashboard

### Backend (Render/Firebase Functions)

#### Option 1: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

#### Option 2: Firebase Functions
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase Functions:
```bash
firebase init functions
```

3. Deploy:
```bash
firebase deploy --only functions
```

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```

## 📝 Environment Variables Summary

### Backend
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase Admin private key
- `FIREBASE_CLIENT_EMAIL` - Firebase Admin client email
- `AI_MODEL` - AI model name (default: gemini-1.5-flash)
- `AI_API_KEY` - Gemini API key
- `FCM_SERVER_KEY` - FCM server key
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - FCM sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, Node.js, Firebase, and Gemini AI







