import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { collection, doc, getCountFromServer, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Button, colors, styles } from '../ui';

export default function AdminUsersScreen({ navigation }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [docCount, setDocCount] = useState(null);

  useEffect(() => {
    getCountFromServer(collection(db, 'documents'))
      .then((s) => setDocCount(s.data().count))
      .catch(() => {});
    return onSnapshot(query(collection(db, 'users'), orderBy('name')), (snap) =>
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const update = (u, data) => updateDoc(doc(db, 'users', u.id), data).catch((e) => Alert.alert('Error', e.message));

  const manage = (u) => {
    if (u.id === user.uid) return Alert.alert('This is you', 'You cannot change your own role or deactivate yourself.');
    Alert.alert(u.name, u.email, [
      u.role === 'admin'
        ? { text: 'Make member', onPress: () => update(u, { role: 'member' }) }
        : { text: 'Make admin', onPress: () => update(u, { role: 'admin' }) },
      u.active
        ? { text: 'Deactivate (block login)', style: 'destructive', onPress: () => update(u, { active: false }) }
        : { text: 'Re-activate', onPress: () => update(u, { active: true }) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const active = users.filter((u) => u.active).length;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={users}
      keyExtractor={(u) => u.id}
      ListHeaderComponent={
        <>
          <View style={[styles.row, { gap: 10, marginBottom: 12 }]}>
            <Stat label="Active users" value={active} />
            <Stat label="Documents" value={docCount ?? '–'} />
          </View>
          <Button title="+ Add team member" onPress={() => navigation.navigate('AddUser')} style={{ marginBottom: 16 }} />
          <Text style={[styles.muted, { marginBottom: 8 }]}>Tap a person to change role or block access.</Text>
        </>
      }
      renderItem={({ item: u }) => (
        <Pressable onPress={() => manage(u)} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : u.active ? 1 : 0.55 }]}>
          <View style={styles.row}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: u.role === 'admin' ? colors.primary : '#9CA3AF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>{(u.name || '?')[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.h2}>
                {u.name}
                {u.id === user.uid ? ' (you)' : ''}
              </Text>
              <Text style={styles.muted}>{u.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: u.role === 'admin' ? colors.primary : colors.muted }}>
                {u.role.toUpperCase()}
              </Text>
              {!u.active ? <Text style={{ fontSize: 12, color: colors.danger }}>Blocked</Text> : null}
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

function Stat({ label, value }) {
  return (
    <View style={[styles.card, { flex: 1, marginBottom: 0 }]}>
      <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}
