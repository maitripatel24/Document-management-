import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';
import { auth, db } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u ?? null)), []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoaded(false);
      return;
    }
    setProfileLoaded(false);
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (data && data.active === false) {
          Alert.alert('Account disabled', 'Your account has been deactivated. Contact your admin.');
          signOut(auth);
          return;
        }
        setProfile(data);
        setProfileLoaded(true);
      },
      () => setProfileLoaded(true)
    );
  }, [user]);

  const value = {
    user,
    profile,
    loading: user === undefined || (user && !profileLoaded),
    isAdmin: profile?.role === 'admin',
    logout: () => signOut(auth),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
