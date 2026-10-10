// Paste your Firebase project's web config here.
// Firebase console → Project settings → General → "Your apps" → Web app → SDK setup and configuration.
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Demo mode runs the app with sample data and no Firebase (see `npm run demo`).
export const isDemo = process.env.EXPO_PUBLIC_DEMO === '1';

export const isFirebaseConfigured = isDemo || !firebaseConfig.apiKey.startsWith('YOUR_');
