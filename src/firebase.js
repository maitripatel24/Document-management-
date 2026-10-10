import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  inMemoryPersistence,
} from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebaseConfig';

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Keeps the user logged in between app launches.
let authInstance;
try {
  authInstance = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  authInstance = getAuth(app); // already initialized (fast refresh)
}
export const auth = authInstance;

let dbInstance;
try {
  dbInstance = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  dbInstance = getFirestore(app);
}
export const db = dbInstance;

export const storage = getStorage(app);

// A second Firebase app used only by admins to create new user accounts.
// Creating a user on the main app would log the admin out and log in as the new user.
let secondaryAuth;
export function getSecondaryAuth() {
  if (secondaryAuth) return secondaryAuth;
  const secondary = getApps().find((a) => a.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');
  try {
    secondaryAuth = initializeAuth(secondary, { persistence: inMemoryPersistence });
  } catch {
    secondaryAuth = getAuth(secondary);
  }
  return secondaryAuth;
}
