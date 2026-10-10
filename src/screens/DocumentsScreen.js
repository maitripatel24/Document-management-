import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES, Chip, Input, colors, formatDate, formatSize, styles } from '../ui';

const fileIcon = (mime = '') =>
  mime.startsWith('image/') ? '🖼️' : mime.includes('pdf') ? '📕' : mime.includes('sheet') || mime.includes('excel') ? '📊' : mime ? '📄' : '📝';

export default function DocumentsScreen({ navigation }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })));
        setLoading(false);
        setError('');
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return docs.filter(
      (d) =>
        (category === 'All' || d.category === category) &&
        (!s ||
          d.title?.toLowerCase().includes(s) ||
          d.notes?.toLowerCase().includes(s) ||
          d.fileName?.toLowerCase().includes(s) ||
          d.createdByName?.toLowerCase().includes(s))
    );
  }, [docs, search, category]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <Input value={search} onChangeText={setSearch} placeholder="🔍  Search documents" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {['All', ...CATEGORIES].map((c) => (
                <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </ScrollView>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', marginTop: 48 }}>
              <Text style={{ fontSize: 40 }}>📂</Text>
              <Text style={[styles.h2, { marginTop: 8 }]}>No documents yet</Text>
              <Text style={styles.muted}>Tap + to add the first one.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('DocumentDetail', { id: item.id })}
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.row}>
              <Text style={{ fontSize: 28, marginRight: 12 }}>{fileIcon(item.mimeType)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.h2} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.muted} numberOfLines={1}>
                  {[item.category, item.createdByName, formatDate(item.createdAt), formatSize(item.fileSize)]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
      <Pressable
        onPress={() => navigation.navigate('AddDocument')}
        style={({ pressed }) => ({
          position: 'absolute',
          right: 20,
          bottom: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: pressed ? colors.primaryDark : colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        })}
      >
        <Text style={{ color: '#fff', fontSize: 32, lineHeight: 34 }}>+</Text>
      </Pressable>
    </View>
  );
}
