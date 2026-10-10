import { accounts, newId } from './store';

const instances = new Map();
const err = (code) => Object.assign(new Error(code), { code });

export function initializeAuth(app) {
  if (!instances.has(app.name)) instances.set(app.name, { currentUser: null, listeners: new Set() });
  return instances.get(app.name);
}
export const getAuth = initializeAuth;
export const getReactNativePersistence = () => ({});
export const inMemoryPersistence = {};

function setUser(auth, user) {
  auth.currentUser = user;
  auth.listeners.forEach((cb) => cb(user));
}

export function onAuthStateChanged(auth, cb) {
  auth.listeners.add(cb);
  setTimeout(() => cb(auth.currentUser), 0);
  return () => auth.listeners.delete(cb);
}

export async function signInWithEmailAndPassword(auth, email, password) {
  const acc = accounts[email.toLowerCase()];
  if (!acc || acc.password !== password) throw err('auth/invalid-credential');
  const user = { uid: acc.uid, email: email.toLowerCase() };
  setUser(auth, user);
  return { user };
}

export async function createUserWithEmailAndPassword(auth, email, password) {
  const key = email.toLowerCase();
  if (accounts[key]) throw err('auth/email-already-in-use');
  const uid = newId('u');
  accounts[key] = { password, uid };
  const user = { uid, email: key };
  setUser(auth, user);
  return { user };
}

export async function signOut(auth) {
  setUser(auth, null);
}

export async function sendPasswordResetEmail() {}
