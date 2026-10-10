import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Button, Input, styles } from '../ui';
import { authMessage } from './LoginScreen';

// Creates the very first account as admin. Only works once —
// after that, the database rules block it and admins add users from the Admin tab.
export default function SetupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setError('');
    if (!name || !email || password.length < 6) {
      return setError('Fill all fields. Password must be at least 6 characters.');
    }
    setBusy(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'admin',
        active: true,
        createdAt: serverTimestamp(),
      });
      batch.set(doc(db, 'meta', 'setup'), { done: true, by: user.uid, at: serverTimestamp() });
      await batch.commit();
    } catch (e) {
      setError(e.code === 'permission-denied' ? 'Setup has already been completed.' : authMessage(e));
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Create admin account</Text>
      <Text style={[styles.subtitle, { marginBottom: 24 }]}>
        This is a one-time step. The admin can then add team members and manage access.
      </Text>
      <Input label="Your name" value={name} onChangeText={setName} placeholder="Full name" />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Create admin account" onPress={create} loading={busy} />
    </ScrollView>
  );
}
