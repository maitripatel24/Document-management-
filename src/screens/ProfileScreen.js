import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { Button, styles } from '../ui';

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const [sent, setSent] = useState(false);

  const changePassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSent(true);
      Alert.alert('Email sent', `A password change link was sent to ${user.email}.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name</Text>
      <Text style={[styles.h2, { marginBottom: 14 }]}>{profile?.name}</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={[styles.h2, { marginBottom: 14 }]}>{user.email}</Text>
      <Text style={styles.label}>Role</Text>
      <Text style={[styles.h2, { marginBottom: 28, textTransform: 'capitalize' }]}>{profile?.role}</Text>
      <Button title={sent ? 'Reset email sent' : 'Change password'} variant="outline" onPress={changePassword} disabled={sent} />
      <Button title="Sign out" variant="danger" style={{ marginTop: 12 }} onPress={logout} />
    </ScrollView>
  );
}
