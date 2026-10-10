import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { isDemo } from '../firebaseConfig';
import { Button, Input, styles, colors } from '../ui';

const authErrors = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/network-request-failed': 'No internet connection.',
};
export const authMessage = (e) => authErrors[e.code] || e.message;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'meta', 'setup'))
      .then((s) => setNeedsSetup(!s.exists()))
      .catch(() => {});
  }, []);

  const login = async () => {
    setError('');
    setInfo('');
    if (!email || !password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setError('');
    if (!email) return setError('Type your email above first.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Password reset email sent.');
    } catch (e) {
      setError(authMessage(e));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 34 }}>📁</Text>
          </View>
          <Text style={styles.title}>Team Docs</Text>
          <Text style={styles.subtitle}>Sign in to access your team's documents</Text>
        </View>

        {isDemo ? (
          <View style={[styles.card, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
            <Text style={styles.h2}>Demo mode · sample data</Text>
            <Text style={[styles.muted, { marginTop: 4, color: '#92400E' }]}>
              Admin: admin@demo.com / demo123{'\n'}Member: member@demo.com / demo123
            </Text>
          </View>
        ) : null}

        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@company.com" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" onSubmitEditing={login} returnKeyType="go" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={{ color: colors.success, marginBottom: 12 }}>{info}</Text> : null}
        <Button title="Sign in" onPress={login} loading={busy} />

        <Pressable onPress={resetPassword} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.primary }}>Forgot password?</Text>
        </Pressable>

        <Text style={[styles.muted, { textAlign: 'center', marginTop: 24 }]}>
          Accounts are created by your admin.
        </Text>

        {needsSetup ? (
          <Button
            title="First-time setup: create admin account"
            variant="outline"
            style={{ marginTop: 24 }}
            onPress={() => navigation.navigate('Setup')}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
