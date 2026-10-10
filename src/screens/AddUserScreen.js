import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, getSecondaryAuth } from '../firebase';
import { Button, Chip, Input, styles } from '../ui';
import { authMessage } from './LoginScreen';

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setError('');
    if (!name.trim() || !email.trim()) return setError('Enter a name and email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    const secondary = getSecondaryAuth();
    try {
      const { user } = await createUserWithEmailAndPassword(secondary, email.trim(), password);
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        active: true,
        createdAt: serverTimestamp(),
      });
      await signOut(secondary);
      Alert.alert('User added', `${name} can now sign in with ${email.trim()} and the password you set.`);
      navigation.goBack();
    } catch (e) {
      setError(e.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : authMessage(e));
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Input label="Full name" value={name} onChangeText={setName} />
      <Input label="Email (used to log in)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Temporary password" value={password} onChangeText={setPassword} autoCapitalize="none" placeholder="At least 6 characters" />
      <Text style={styles.label}>Role</Text>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        <Chip label="Member" selected={role === 'member'} onPress={() => setRole('member')} />
        <Chip label="Admin" selected={role === 'admin'} onPress={() => setRole('admin')} />
      </View>
      <Text style={[styles.muted, { marginBottom: 18 }]}>
        Members can view, add and share documents. Admins can also manage users and edit or delete any document.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Create account" onPress={create} loading={busy} />
    </ScrollView>
  );
}
