import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../AuthContext';
import { shareAny, shareFile, shareToEmail, shareToWhatsApp } from '../share';
import { Button, Loading, colors, formatDate, formatSize, styles } from '../ui';

export default function DocumentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user, isAdmin } = useAuth();
  const [item, setItem] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(
    () =>
      onSnapshot(doc(db, 'documents', id), (s) => {
        if (!s.exists()) return navigation.goBack();
        setItem({ id: s.id, ...s.data({ serverTimestamps: 'estimate' }) });
      }),
    [id]
  );

  if (!item) return <Loading />;
  const canEdit = isAdmin || item.createdBy === user.uid;

  const onShareFile = async () => {
    setSharing(true);
    try {
      await shareFile(item);
    } catch (e) {
      Alert.alert('Could not share', e.message);
    } finally {
      setSharing(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete document?', `"${item.title}" will be removed for everyone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (item.storagePath) await deleteObject(ref(storage, item.storagePath)).catch(() => {});
            await deleteDoc(doc(db, 'documents', id));
          } catch (e) {
            Alert.alert('Could not delete', e.message);
          }
        },
      },
    ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
        <Text style={[styles.title, { marginTop: 10 }]}>{item.title}</Text>
        <Text style={[styles.muted, { marginTop: 6 }]}>
          Added by {item.createdByName} · {formatDate(item.createdAt)}
        </Text>
        {item.notes ? <Text style={{ fontSize: 16, color: colors.text, marginTop: 16, lineHeight: 23 }}>{item.notes}</Text> : null}
      </View>

      {item.fileUrl ? (
        <View style={styles.card}>
          <Text style={styles.h2} numberOfLines={2}>📎 {item.fileName}</Text>
          <Text style={styles.muted}>{formatSize(item.fileSize)}</Text>
          <Button title="Open file" variant="outline" style={{ marginTop: 12 }} onPress={() => Linking.openURL(item.fileUrl)} />
        </View>
      ) : null}

      <Text style={[styles.label, { marginTop: 8 }]}>Share</Text>
      <Button title={item.fileUrl ? 'Share file (WhatsApp, Gmail, …)' : 'Share'} onPress={onShareFile} loading={sharing} />
      <View style={[styles.row, { marginTop: 10, gap: 10 }]}>
        <Button title="WhatsApp" color={colors.whatsapp} style={{ flex: 1 }} onPress={() => shareToWhatsApp(item)} />
        <Button title="Email / Gmail" color={colors.gmail} style={{ flex: 1 }} onPress={() => shareToEmail(item)} />
      </View>
      <Button title="Share link via other app" variant="outline" style={{ marginTop: 10 }} onPress={() => shareAny(item)} />
      {item.fileUrl ? (
        <Text style={[styles.muted, { marginTop: 8 }]}>
          "Share file" sends the actual file. WhatsApp / Email buttons send the details with a download link — anyone with the link can open the file.
        </Text>
      ) : null}

      {canEdit ? (
        <View style={{ marginTop: 28 }}>
          <Button title="Edit" variant="outline" onPress={() => navigation.navigate('AddDocument', { id })} />
          <Button title="Delete" variant="danger" style={{ marginTop: 10 }} onPress={confirmDelete} />
        </View>
      ) : null}
    </ScrollView>
  );
}
